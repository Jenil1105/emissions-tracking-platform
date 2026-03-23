import "dotenv/config";
import cors from "cors";
import express from "express";
import { createRoutesRouter } from "./adapters/inbound/http/routes";
import { db } from "./infrastructure/db";
import { initDatabase } from "./infrastructure/initDatabase";
import { PostgresBankingRepository } from "./adapters/outbound/postgresBankingRepository";
import { PostgresPoolRepository } from "./adapters/outbound/postgresPoolRepository";
import { PostgresRouteRepository } from "./adapters/outbound/postgresRouteRepository";
import { PostgresShipComplianceRepository } from "./adapters/outbound/postgresShipComplianceRepository";

const port = process.env.PORT || 3000;

export function createApp() {
  const app = express();
  const bankingRepository = new PostgresBankingRepository(db);
  const poolRepository = new PostgresPoolRepository(db);
  const routeRepository = new PostgresRouteRepository(db);
  const shipComplianceRepository = new PostgresShipComplianceRepository(db);

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(createRoutesRouter({
    bankingRepository,
    poolRepository,
    routeRepository,
    shipComplianceRepository,
  }));

  return app;
}

async function startServer() {
  await initDatabase();
  const app = createApp();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

void startServer();
