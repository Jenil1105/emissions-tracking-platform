import "dotenv/config";
import cors from "cors";
import express from "express";
import routesRouter from "./adapters/inbound/http/routes";
import { initDatabase } from "./infrastructure/initDatabase";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(routesRouter);

async function startServer() {
  await initDatabase();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

void startServer();
