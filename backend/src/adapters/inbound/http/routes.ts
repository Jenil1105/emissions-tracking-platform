import { Router } from "express";
import { GetRoutes } from "../../../core/application/getRoutes";
import { InMemoryRouteRepository } from "../../outbound/inMemoryRouteRepository";

const routesRouter = Router();

const routeRepository = new InMemoryRouteRepository();
const getRoutes = new GetRoutes(routeRepository);

routesRouter.get("/routes", (req, res) => {
  const filters = {
    vesselType: req.query.vesselType as string | undefined,
    fuelType: req.query.fuelType as string | undefined,
    year: req.query.year ? Number(req.query.year) : undefined
  };

  const routes = getRoutes.execute(filters);
  res.json(routes);
});

export default routesRouter;
