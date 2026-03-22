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
const inMemoryBankingRepository_1 = require("../../outbound/inMemoryBankingRepository");
const inMemoryPoolRepository_1 = require("../../outbound/inMemoryPoolRepository");
const inMemoryRouteRepository_1 = require("../../outbound/inMemoryRouteRepository");
const routesRouter = (0, express_1.Router)();
const bankingRepository = new inMemoryBankingRepository_1.InMemoryBankingRepository();
const applyBankedSurplus = new applyBankedSurplus_1.ApplyBankedSurplus(bankingRepository);
const poolRepository = new inMemoryPoolRepository_1.InMemoryPoolRepository();
const routeRepository = new inMemoryRouteRepository_1.InMemoryRouteRepository();
const bankSurplus = new bankSurplus_1.BankSurplus(routeRepository, bankingRepository);
const createPool = new createPool_1.CreatePool(routeRepository, poolRepository);
const getAdjustedComplianceBalances = new getAdjustedComplianceBalances_1.GetAdjustedComplianceBalances(routeRepository, bankingRepository);
const getBankingRecords = new getBankingRecords_1.GetBankingRecords(bankingRepository);
const getComplianceBalance = new getComplianceBalance_1.GetComplianceBalance(routeRepository);
const getRoutes = new getRoutes_1.GetRoutes(routeRepository);
const setBaselineRoute = new setBaselineRoute_1.SetBaselineRoute(routeRepository);
const getRouteComparison = new getRouteComparison_1.GetRouteComparison(routeRepository);
routesRouter.get("/routes", (req, res) => {
    const filters = {
        vesselType: req.query.vesselType,
        fuelType: req.query.fuelType,
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
    const shipId = req.query.shipId;
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
    const shipId = req.query.shipId;
    const year = Number(req.query.year);
    if (!shipId || Number.isNaN(year)) {
        res.status(400).json({ message: "shipId and year are required" });
        return;
    }
    const result = getBankingRecords.execute(shipId, year);
    res.json(result);
});
routesRouter.post("/banking/bank", (req, res) => {
    const shipId = req.body.shipId;
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
    const shipId = req.body.shipId;
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
    const shipIds = req.body.shipIds;
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
exports.default = routesRouter;
