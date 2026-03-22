import { Router } from "express";
import { GetRoutes } from "../../../core/application/getRoutes";
import { GetRouteComparison } from "../../../core/application/getRouteComparison";
import { SetBaselineRoute } from "../../../core/application/setBaselineRoute";
import { InMemoryRouteRepository } from "../../outbound/inMemoryRouteRepository";

const routesRouter = Router();

const routeRepository = new InMemoryRouteRepository();
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

export default routesRouter;
