import { ApplyBankedSurplus } from "../../../core/application/applyBankedSurplus";
import { BankSurplus } from "../../../core/application/bankSurplus";
import { CreatePool } from "../../../core/application/createPool";
import { GetBankingRecords } from "../../../core/application/getBankingRecords";
import { GetAdjustedComplianceBalances } from "../../../core/application/getAdjustedComplianceBalances";
import { Router } from "express";
import { GetComplianceBalance } from "../../../core/application/getComplianceBalance";
import { GetRoutes } from "../../../core/application/getRoutes";
import { GetRouteComparison } from "../../../core/application/getRouteComparison";
import { SetBaselineRoute } from "../../../core/application/setBaselineRoute";
import { InMemoryBankingRepository } from "../../outbound/inMemoryBankingRepository";
import { InMemoryPoolRepository } from "../../outbound/inMemoryPoolRepository";
import { InMemoryRouteRepository } from "../../outbound/inMemoryRouteRepository";

const routesRouter = Router();

const bankingRepository = new InMemoryBankingRepository();
const applyBankedSurplus = new ApplyBankedSurplus(bankingRepository);
const poolRepository = new InMemoryPoolRepository();
const routeRepository = new InMemoryRouteRepository();
const bankSurplus = new BankSurplus(routeRepository, bankingRepository);
const createPool = new CreatePool(routeRepository, poolRepository);
const getAdjustedComplianceBalances = new GetAdjustedComplianceBalances(routeRepository, bankingRepository);
const getBankingRecords = new GetBankingRecords(bankingRepository);
const getComplianceBalance = new GetComplianceBalance(routeRepository);
const getRoutes = new GetRoutes(routeRepository);
const setBaselineRoute = new SetBaselineRoute(routeRepository);
const getRouteComparison = new GetRouteComparison(routeRepository);

routesRouter.get("/routes", (req, res) => {
  const filters = {
    vesselType: req.query.vesselType as string | undefined,
    fuelType: req.query.fuelType as string | undefined,
    year: req.query.year ? Number(req.query.year) : undefined
  };

  const routes = getRoutes.execute(filters);
  res.json(routes);
});

routesRouter.post("/routes/:routeId/baseline", (req, res) => {
  const routeId = req.params.routeId;
  const updatedRoute = setBaselineRoute.execute(routeId);

  if (!updatedRoute) {
    res.status(404).json({ message: "Route not found" });
    return;
  }

  res.json(updatedRoute);
});

routesRouter.get("/routes/comparison", (_req, res) => {
  const result = getRouteComparison.execute();

  if (!result) {
    res.status(404).json({ message: "Baseline route not found" });
    return;
  }

  res.json(result);
});

routesRouter.get("/compliance/cb", (req, res) => {
  const shipId = req.query.shipId as string | undefined;
  const year = Number(req.query.year);
  if (!shipId || Number.isNaN(year)) {
    res.status(400).json({ message: "shipId and year are required" });
    return;
  }

  const result = getComplianceBalance.execute(shipId, year);

  if (!result) {
    res.status(404).json({ message: "Route not found" });
    return;
  }

  res.json(result);
});

routesRouter.get("/banking/records", (req, res) => {
  const shipId = req.query.shipId as string | undefined;
  const year = Number(req.query.year);
  if (!shipId || Number.isNaN(year)) {
    res.status(400).json({ message: "shipId and year are required" });
    return;
  }

  const result = getBankingRecords.execute(shipId, year);
  res.json(result);
});

routesRouter.post("/banking/bank", (req, res) => {
  const shipId = req.body.shipId as string | undefined;
  const year = Number(req.body.year);
  const amount = req.body.amount ? Number(req.body.amount) : undefined;
  if (!shipId || Number.isNaN(year)) {
    res.status(400).json({ error: "shipId and year are required" });
    return;
  }

  const result = bankSurplus.execute(shipId, year, amount);

  if ("error" in result) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

routesRouter.post("/banking/apply", (req, res) => {
  const shipId = req.body.shipId as string | undefined;
  const year = Number(req.body.year);
  const amount = Number(req.body.amount);
  if (!shipId || Number.isNaN(year) || Number.isNaN(amount)) {
    res.status(400).json({ error: "shipId, year, and amount are required" });
    return;
  }

  const result = applyBankedSurplus.execute(shipId, year, amount);

  if ("error" in result) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

routesRouter.get("/compliance/adjusted-cb", (req, res) => {
  const year = Number(req.query.year);
  if (Number.isNaN(year)) {
    res.status(400).json({ message: "year is required" });
    return;
  }
  const result = getAdjustedComplianceBalances.execute(year);
  res.json(result);
});

routesRouter.post("/pools", (req, res) => {
  const year = Number(req.body.year);
  const shipIds = req.body.shipIds as string[];
  if (Number.isNaN(year) || !Array.isArray(shipIds)) {
    res.status(400).json({ error: "year and shipIds are required" });
    return;
  }

  const result = createPool.execute(year, shipIds);

  if ("error" in result) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

export default routesRouter;
