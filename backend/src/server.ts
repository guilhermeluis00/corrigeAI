import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3001" }));
app.use(express.json());
app.get("/", (_req, res) => res.json({ mensagem: "API CorrigeAI funcionando!" }));
app.use("/api", router);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`CorrigeAI backend em http://localhost:${port}`));
