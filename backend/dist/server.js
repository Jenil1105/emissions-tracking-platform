"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./adapters/inbound/http/routes"));
const initDatabase_1 = require("./infrastructure/initDatabase");
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
app.use(routes_1.default);
async function startServer() {
    await (0, initDatabase_1.initDatabase)();
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}
void startServer();
