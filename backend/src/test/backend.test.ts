import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createRoutesRouter } from "../adapters/inbound/http/routes";
import { ApplyBankedSurplus } from "../core/application/applyBankedSurplus";
import { BankSurplus } from "../core/application/bankSurplus";
import { CreatePool } from "../core/application/createPool";
import { GetComplianceBalance } from "../core/application/getComplianceBalance";
import { GetRouteComparison } from "../core/application/getRouteComparison";
import type { BankEntry } from "../core/domain/BankEntry";
import type { Pool, PoolMember } from "../core/domain/Pool";
import type { Route } from "../core/domain/Route";
import type { ShipCompliance } from "../core/domain/ShipCompliance";
import type { BankingRepository } from "../core/ports/bankingRepository";
import type { PoolRepository } from "../core/ports/poolRepository";
import type { RouteFilters, RouteRepository } from "../core/ports/routeRepository";
import type { ShipComplianceRepository } from "../core/ports/shipComplianceRepository";

function createRoutesFixture(): Route[] {
  return [
    {
      id: 1,
      routeId: "R001",
      shipId: "SHIP-001",
      vesselType: "Container",
      fuelType: "HFO",
      year: 2024,
      ghgIntensity: 91,
      fuelConsumption: 5000,
      distance: 12000,
      totalEmissions: 4500,
      isBaseline: true,
    },
    {
      id: 2,
      routeId: "R002",
      shipId: "SHIP-002",
      vesselType: "BulkCarrier",
      fuelType: "LNG",
      year: 2024,
      ghgIntensity: 88,
      fuelConsumption: 4800,
      distance: 11500,
      totalEmissions: 4200,
      isBaseline: false,
    },
    {
      id: 3,
      routeId: "R003",
      shipId: "SHIP-003",
      vesselType: "Tanker",
      fuelType: "MGO",
      year: 2024,
      ghgIntensity: 93.5,
      fuelConsumption: 5100,
      distance: 12500,
      totalEmissions: 4700,
      isBaseline: false,
    },
    {
      id: 4,
      routeId: "R004",
      shipId: "SHIP-004",
      vesselType: "RoRo",
      fuelType: "HFO",
      year: 2025,
      ghgIntensity: 89.2,
      fuelConsumption: 4900,
      distance: 11800,
      totalEmissions: 4300,
      isBaseline: false,
    },
  ];
}

class FakeRouteRepository implements RouteRepository {
  constructor(private readonly routes: Route[]) {}

  async getAll(filters?: RouteFilters): Promise<Route[]> {
    return this.routes.filter((route) => {
      if (filters?.vesselType && route.vesselType !== filters.vesselType) return false;
      if (filters?.fuelType && route.fuelType !== filters.fuelType) return false;
      if (filters?.year && route.year !== filters.year) return false;
      return true;
    });
  }

  async setBaseline(routeId: string): Promise<Route | undefined> {
    const route = this.routes.find((item) => item.routeId === routeId);
    if (!route) return undefined;
    for (const item of this.routes) item.isBaseline = item.routeId === routeId;
    return route;
  }

  async getBaseline(): Promise<Route | undefined> {
    return this.routes.find((route) => route.isBaseline);
  }

  async getByYear(year: number): Promise<Route[]> {
    return this.routes.filter((route) => route.year === year);
  }

  async getByShipIdAndYear(shipId: string, year: number): Promise<Route | undefined> {
    return this.routes.find((route) => route.shipId === shipId && route.year === year);
  }
}

class FakeBankingRepository implements BankingRepository {
  constructor(private readonly records: BankEntry[] = []) {}

  async getRecords(shipId?: string, year?: number): Promise<BankEntry[]> {
    return this.records.filter((record) => {
      if (shipId && record.shipId !== shipId) return false;
      if (year !== undefined && record.year !== year) return false;
      return true;
    });
  }

  async create(shipId: string, year: number, amount: number, type: "BANK" | "APPLY"): Promise<BankEntry> {
    const record: BankEntry = {
      id: this.records.length + 1,
      shipId,
      year,
      amount,
      type,
    };
    this.records.push(record);
    return record;
  }
}

class FakePoolRepository implements PoolRepository {
  pools: Pool[] = [];

  async create(year: number, members: PoolMember[]): Promise<Pool> {
    const pool: Pool = { id: this.pools.length + 1, year, members };
    this.pools.push(pool);
    return pool;
  }
}

class FakeShipComplianceRepository implements ShipComplianceRepository {
  snapshots: ShipCompliance[] = [];

  async saveSnapshot(input: Omit<ShipCompliance, "id">): Promise<ShipCompliance> {
    const snapshot: ShipCompliance = {
      id: this.snapshots.length + 1,
      ...input,
    };
    this.snapshots.push(snapshot);
    return snapshot;
  }
}

function createTestApp() {
  const app = express();
  const deps = {
    bankingRepository: new FakeBankingRepository([{ id: 1, shipId: "SHIP-002", year: 2024, amount: 1000, type: "BANK" }]),
    poolRepository: new FakePoolRepository(),
    routeRepository: new FakeRouteRepository(createRoutesFixture()),
    shipComplianceRepository: new FakeShipComplianceRepository(),
  };

  app.use(express.json());
  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });
  app.use(createRoutesRouter(deps));
  return app;
}

describe("Unit use cases", () => {
  let routeRepository: FakeRouteRepository;
  let bankingRepository: FakeBankingRepository;
  let poolRepository: FakePoolRepository;
  let shipComplianceRepository: FakeShipComplianceRepository;

  beforeEach(() => {
    routeRepository = new FakeRouteRepository(createRoutesFixture());
    bankingRepository = new FakeBankingRepository();
    poolRepository = new FakePoolRepository();
    shipComplianceRepository = new FakeShipComplianceRepository();
  });

  it("ComputeComparison returns baseline deltas and compliance", async () => {
    const result = await new GetRouteComparison(routeRepository).execute();
    expect(result?.baseline.routeId).toBe("R001");
    expect(result?.comparisonRoutes[0]?.percentDiff).toBeCloseTo(((88 / 91) - 1) * 100, 5);
    expect(result?.comparisonRoutes[0]?.compliant).toBe(true);
  });

  it("ComputeCB stores a compliance snapshot", async () => {
    const result = await new GetComplianceBalance(routeRepository, shipComplianceRepository).execute("SHIP-002", 2024);
    expect(result?.complianceBalance).toBeCloseTo((89.3368 - 88) * (4800 * 41000), 5);
    expect(shipComplianceRepository.snapshots).toHaveLength(1);
    expect(shipComplianceRepository.snapshots[0]?.shipId).toBe("SHIP-002");
  });

  it("BankSurplus banks a positive CB", async () => {
    const result = await new BankSurplus(routeRepository, bankingRepository).execute("SHIP-002", 2024, 1000);
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.record.shipId).toBe("SHIP-002");
      expect(result.totalBanked).toBe(1000);
    }
  });

  it("BankSurplus rejects negative CB", async () => {
    const result = await new BankSurplus(routeRepository, bankingRepository).execute("SHIP-001", 2024);
    expect(result).toEqual({ error: "Only positive compliance balance can be banked" });
  });

  it("ApplyBanked uses the global banked pool", async () => {
    bankingRepository = new FakeBankingRepository([{ id: 1, shipId: "SHIP-002", year: 2024, amount: 1200, type: "BANK" }]);
    const result = await new ApplyBankedSurplus(bankingRepository).execute("SHIP-001", 2024, 500);
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.record.shipId).toBe("SHIP-001");
      expect(result.remainingBanked).toBe(700);
    }
  });

  it("ApplyBanked rejects over-apply", async () => {
    bankingRepository = new FakeBankingRepository([{ id: 1, shipId: "SHIP-002", year: 2024, amount: 200, type: "BANK" }]);
    const result = await new ApplyBankedSurplus(bankingRepository).execute("SHIP-001", 2025, 500);
    expect(result).toEqual({ error: "Amount exceeds available banked surplus" });
  });

  it("CreatePool creates a valid pool", async () => {
    const result = await new CreatePool(routeRepository, poolRepository, bankingRepository).execute(2024, ["SHIP-002"]);
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.members).toHaveLength(1);
      expect(result.members[0]?.shipId).toBe("SHIP-002");
    }
  });

  it("CreatePool rejects invalid pool sums", async () => {
    routeRepository = new FakeRouteRepository(createRoutesFixture().filter((route) => route.shipId !== "SHIP-002"));
    const result = await new CreatePool(routeRepository, poolRepository, bankingRepository).execute(2024, ["SHIP-001", "SHIP-003"]);
    expect(result).toEqual({ error: "Pool sum must be zero or positive" });
  });
});

describe("Integration routes", () => {
  it("GET /routes returns filtered rows", async () => {
    const response = await request(createTestApp()).get("/routes").query({ fuelType: "LNG", year: 2024 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]?.routeId).toBe("R002");
  });

  it("GET /compliance/cb returns a ship-year balance", async () => {
    const response = await request(createTestApp()).get("/compliance/cb").query({ shipId: "SHIP-002", year: 2024 });
    expect(response.status).toBe(200);
    expect(response.body.shipId).toBe("SHIP-002");
  });

  it("POST /banking/apply rejects over-apply", async () => {
    const response = await request(createTestApp()).post("/banking/apply").send({ shipId: "SHIP-001", year: 2024, amount: 5000 });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Amount exceeds available banked surplus");
  });

  it("POST /pools rejects invalid pools", async () => {
    const app = express();
    app.use(express.json());
    app.use(createRoutesRouter({
      bankingRepository: new FakeBankingRepository(),
      poolRepository: new FakePoolRepository(),
      routeRepository: new FakeRouteRepository(createRoutesFixture().filter((route) => route.shipId !== "SHIP-002")),
      shipComplianceRepository: new FakeShipComplianceRepository(),
    }));

    const response = await request(app).post("/pools").send({ year: 2024, shipIds: ["SHIP-001", "SHIP-003"] });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Pool sum must be zero or positive");
  });
});


