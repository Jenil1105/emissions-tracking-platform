import { ApplyBankedSurplus } from "../../../core/application/applyBankedSurplus";
import { BankSurplus } from "../../../core/application/bankSurplus";
import { GetBankingRecords } from "../../../core/application/getBankingRecords";
import { Router } from "express";
import { GetComplianceBalance } from "../../../core/application/getComplianceBalance";
import { GetRoutes } from "../../../core/application/getRoutes";
import { GetRouteComparison } from "../../../core/application/getRouteComparison";
import { SetBaselineRoute } from "../../../core/application/setBaselineRoute";
import { InMemoryBankingRepository } from "../../outbound/inMemoryBankingRepository";
import { InMemoryRouteRepository } from "../../outbound/inMemoryRouteRepository";

const routesRouter = Router();

const bankingRepository = new InMemoryBankingRepository();
const applyBankedSurplus = new ApplyBankedSurplus(bankingRepository);
const routeRepository = new InMemoryRouteRepository();
const bankSurplus = new BankSurplus(routeRepository, bankingRepository);
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

routesRouter.post("/routes/:id/baseline", (req, res) => {
  const id = Number(req.params.id);
  const updatedRoute = setBaselineRoute.execute(id);

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
  const shipId = req.query.shipId as string;
  const year = Number(req.query.year);

  const result = getComplianceBalance.execute(shipId, year);

  if (!result) {
    res.status(404).json({ message: "Route not found" });
    return;
  }

  res.json(result);
});

routesRouter.get("/banking/records", (req, res) => {
  const shipId = req.query.shipId as string;
  const year = Number(req.query.year);

  const result = getBankingRecords.execute(shipId, year);
  res.json(result);
});

routesRouter.post("/banking/bank", (req, res) => {
  const shipId = req.body.shipId as string;
  const year = Number(req.body.year);
  const amount = req.body.amount ? Number(req.body.amount) : undefined;

  const result = bankSurplus.execute(shipId, year, amount);

  if ("error" in result) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

routesRouter.post("/banking/apply", (req, res) => {
  const shipId = req.body.shipId as string;
  const year = Number(req.body.year);
  const amount = Number(req.body.amount);

  const result = applyBankedSurplus.execute(shipId, year, amount);

  if ("error" in result) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

export default routesRouter;
