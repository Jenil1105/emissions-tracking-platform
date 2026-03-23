import { describe, expect, it, vi } from "vitest";
import { RouteDashboardService } from "../core/application/RouteDashboardService";
import type { RouteGateway } from "../core/ports/RouteGateway";
import { comparisonFixture, routesFixture } from "./fixtures";

describe("RouteDashboardService", () => {
  it("delegates route and comparison requests to the gateway", async () => {
    const gateway: RouteGateway = {
      getRoutes: vi.fn().mockResolvedValue(routesFixture),
      setBaseline: vi.fn().mockResolvedValue(undefined),
      getComparison: vi.fn().mockResolvedValue(comparisonFixture),
      getComplianceBalance: vi.fn(),
      getBankingRecords: vi.fn(),
      bankSurplus: vi.fn(),
      applyBanked: vi.fn(),
      getAdjustedComplianceBalances: vi.fn(),
      createPool: vi.fn(),
    };
    const service = new RouteDashboardService(gateway);

    const routes = await service.getRoutes({ fuelType: "LNG", year: "2024" });
    const comparison = await service.getComparison();
    await service.setBaseline("R002");

    expect(gateway.getRoutes).toHaveBeenCalledWith({ fuelType: "LNG", year: "2024" });
    expect(gateway.getComparison).toHaveBeenCalled();
    expect(gateway.setBaseline).toHaveBeenCalledWith("R002");
    expect(routes).toEqual(routesFixture);
    expect(comparison).toEqual(comparisonFixture);
  });
});
