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
import { db } from "../../../infrastructure/db";
import { PostgresBankingRepository } from "../../outbound/postgresBankingRepository";
import { PostgresPoolRepository } from "../../outbound/postgresPoolRepository";
import { PostgresRouteRepository } from "../../outbound/postgresRouteRepository";

const routesRouter = Router();

const bankingRepository = new PostgresBankingRepository(db);
const poolRepository = new PostgresPoolRepository(db);
const routeRepository = new PostgresRouteRepository(db);
const applyBankedSurplus = new ApplyBankedSurplus(bankingRepository);
const bankSurplus = new BankSurplus(routeRepository, bankingRepository);
const createPool = new CreatePool(routeRepository, poolRepository, bankingRepository);
const getAdjustedComplianceBalances = new GetAdjustedComplianceBalances(routeRepository, bankingRepository);
const getBankingRecords = new GetBankingRecords(bankingRepository);
const getComplianceBalance = new GetComplianceBalance(routeRepository);
const getRoutes = new GetRoutes(routeRepository);
const setBaselineRoute = new SetBaselineRoute(routeRepository);
const getRouteComparison = new GetRouteComparison(routeRepository);

routesRouter.get("/routes", async (req, res) => {
  const filters = {
    vesselType: req.query.vesselType as string | undefined,
    fuelType: req.query.fuelType as string | undefined,
    year: req.query.year ? Number(req.query.year) : undefined,
  };

  const routes = await getRoutes.execute(filters);
  res.json(routes);
});

routesRouter.post("/routes/:routeId/baseline", async (req, res) => {
  const routeId = req.params.routeId;
  const updatedRoute = await setBaselineRoute.execute(routeId);

  if (!updatedRoute) {
    res.status(404).json({ message: "Route not found" });
    return;
  }

  res.json(updatedRoute);
});

routesRouter.get("/routes/comparison", async (_req, res) => {
  const result = await getRouteComparison.execute();

  if (!result) {
    res.status(404).json({ message: "Baseline route not found" });
    return;
  }

  res.json(result);
});

routesRouter.get("/compliance/cb", async (req, res) => {
  const year = Number(req.query.year);

  if (Number.isNaN(year)) {
    res.status(400).json({ message: "year is required" });
    return;
  }

  const result = await getComplianceBalance.execute(year);

  if (!result) {
    res.status(404).json({ message: "No routes found for the selected year" });
    return;
  }

  res.json(result);
});

routesRouter.get("/banking/records", async (req, res) => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const result = await getBankingRecords.execute(year);
  res.json(result);
});

routesRouter.post("/banking/bank", async (req, res) => {
  const year = Number(req.body.year);
  const amount = req.body.amount ? Number(req.body.amount) : undefined;

  if (Number.isNaN(year)) {
    res.status(400).json({ error: "year is required" });
    return;
  }

  const result = await bankSurplus.execute(year, amount);

  if ("error" in result) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

routesRouter.post("/banking/apply", async (req, res) => {
  const year = Number(req.body.year);
  const amount = Number(req.body.amount);

  if (Number.isNaN(year) || Number.isNaN(amount)) {
    res.status(400).json({ error: "year and amount are required" });
    return;
  }

  const result = await applyBankedSurplus.execute(year, amount);

  if ("error" in result) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

routesRouter.get("/compliance/adjusted-cb", async (req, res) => {
  const year = Number(req.query.year);

  if (Number.isNaN(year)) {
    res.status(400).json({ message: "year is required" });
    return;
  }

  const result = await getAdjustedComplianceBalances.execute(year);
  res.json(result);
});

routesRouter.post("/pools", async (req, res) => {
  const year = Number(req.body.year);
  const routeIds = req.body.routeIds as string[] | undefined;

  if (Number.isNaN(year) || !Array.isArray(routeIds)) {
    res.status(400).json({ error: "year and routeIds are required" });
    return;
  }

  const result = await createPool.execute(year, routeIds);

  if ("error" in result) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

export default routesRouter;
