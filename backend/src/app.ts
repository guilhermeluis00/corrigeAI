import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import routes from "./routes.js";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

// Em desenvolvimento, também aceita acesso pela rede local (ex.: celular em http://192.168.x.x:5173).
const redeLocal = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== "production" && redeLocal.test(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: false
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

app.get("/", (_req, res) => {
  res.json({
    nome: "CorrigeAI API",
    status: "online",
    versao: "1.0.0"
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Erro não tratado:", err);

  if (err?.name === "MulterError") {
    return res.status(400).json({ mensagem: "Erro no upload da imagem." });
  }

  if (err instanceof Error && err.message.includes("Formato de imagem")) {
    return res.status(400).json({ mensagem: err.message });
  }

  return res.status(500).json({ mensagem: "Erro interno do servidor." });
});

export default app;
