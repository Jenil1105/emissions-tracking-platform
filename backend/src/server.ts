import express from "express";
import cors from "cors";
import routesRouter from "./adapters/inbound/http/routes";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use(routesRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
