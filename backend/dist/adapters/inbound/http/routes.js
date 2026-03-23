"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const applyBankedSurplus_1 = require("../../../core/application/applyBankedSurplus");
const bankSurplus_1 = require("../../../core/application/bankSurplus");
const createPool_1 = require("../../../core/application/createPool");
const getBankingRecords_1 = require("../../../core/application/getBankingRecords");
const getAdjustedComplianceBalances_1 = require("../../../core/application/getAdjustedComplianceBalances");
const express_1 = require("express");
const getComplianceBalance_1 = require("../../../core/application/getComplianceBalance");
const getRoutes_1 = require("../../../core/application/getRoutes");
const getRouteComparison_1 = require("../../../core/application/getRouteComparison");
const setBaselineRoute_1 = require("../../../core/application/setBaselineRoute");
const db_1 = require("../../../infrastructure/db");
const postgresBankingRepository_1 = require("../../outbound/postgresBankingRepository");
const postgresPoolRepository_1 = require("../../outbound/postgresPoolRepository");
const postgresRouteRepository_1 = require("../../outbound/postgresRouteRepository");
const postgresShipComplianceRepository_1 = require("../../outbound/postgresShipComplianceRepository");
const routesRouter = (0, express_1.Router)();
const bankingRepository = new postgresBankingRepository_1.PostgresBankingRepository(db_1.db);
const poolRepository = new postgresPoolRepository_1.PostgresPoolRepository(db_1.db);
const routeRepository = new postgresRouteRepository_1.PostgresRouteRepository(db_1.db);
const shipComplianceRepository = new postgresShipComplianceRepository_1.PostgresShipComplianceRepository(db_1.db);
const applyBankedSurplus = new applyBankedSurplus_1.ApplyBankedSurplus(bankingRepository);
const bankSurplus = new bankSurplus_1.BankSurplus(routeRepository, bankingRepository);
const createPool = new createPool_1.CreatePool(routeRepository, poolRepository, bankingRepository);
const getAdjustedComplianceBalances = new getAdjustedComplianceBalances_1.GetAdjustedComplianceBalances(routeRepository, bankingRepository);
const getBankingRecords = new getBankingRecords_1.GetBankingRecords(bankingRepository);
const getComplianceBalance = new getComplianceBalance_1.GetComplianceBalance(routeRepository, shipComplianceRepository);
const getRoutes = new getRoutes_1.GetRoutes(routeRepository);
const setBaselineRoute = new setBaselineRoute_1.SetBaselineRoute(routeRepository);
const getRouteComparison = new getRouteComparison_1.GetRouteComparison(routeRepository);
routesRouter.get("/routes", async (req, res) => {
    const filters = {
        vesselType: req.query.vesselType,
        fuelType: req.query.fuelType,
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
    const shipId = req.query.shipId;
    const year = Number(req.query.year);
    if (!shipId || Number.isNaN(year)) {
        res.status(400).json({ message: "shipId and year are required" });
        return;
    }
    const result = await getComplianceBalance.execute(shipId, year);
    if (!result) {
        res.status(404).json({ message: "No route found for the selected ship and year" });
        return;
    }
    res.json(result);
});
routesRouter.get("/banking/records", async (req, res) => {
    const shipId = req.query.shipId;
    const year = Number(req.query.year);
    if (!shipId || Number.isNaN(year)) {
        res.status(400).json({ message: "shipId and year are required" });
        return;
    }
    const result = await getBankingRecords.execute(shipId, year);
    res.json(result);
});
routesRouter.post("/banking/bank", async (req, res) => {
    const shipId = req.body.shipId;
    const year = Number(req.body.year);
    const amount = req.body.amount ? Number(req.body.amount) : undefined;
    if (!shipId || Number.isNaN(year)) {
        res.status(400).json({ error: "shipId and year are required" });
        return;
    }
    const result = await bankSurplus.execute(shipId, year, amount);
    if ("error" in result) {
        res.status(400).json(result);
        return;
    }
    res.json(result);
});
routesRouter.post("/banking/apply", async (req, res) => {
    const shipId = req.body.shipId;
    const year = Number(req.body.year);
    const amount = Number(req.body.amount);
    if (!shipId || Number.isNaN(year) || Number.isNaN(amount)) {
        res.status(400).json({ error: "shipId, year, and amount are required" });
        return;
    }
    const result = await applyBankedSurplus.execute(shipId, year, amount);
    if ("error" in result) {
        res.status(400).json(result);
        return;
    }
    res.json(result);
});
routesRouter.get("/compliance/adjusted-cb", async (req, res) => {
    const shipId = req.query.shipId;
    const year = Number(req.query.year);
    if (Number.isNaN(year)) {
        res.status(400).json({ message: "year is required" });
        return;
    }
    const result = await getAdjustedComplianceBalances.execute(year, shipId);
    res.json(result);
});
routesRouter.post("/pools", async (req, res) => {
    const year = Number(req.body.year);
    const shipIds = req.body.shipIds;
    if (Number.isNaN(year) || !Array.isArray(shipIds)) {
        res.status(400).json({ error: "year and shipIds are required" });
        return;
    }
    const result = await createPool.execute(year, shipIds);
    if ("error" in result) {
        res.status(400).json(result);
        return;
    }
    res.json(result);
});
exports.default = routesRouter;
