import type { NextFunction, Request, Response } from "express";
import { verificarToken } from "../utils/jwt.js";

export function autenticar(req: Request, res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({ mensagem: "Token não informado." });
    }

    const [tipo, token] = authorization.split(" ");

    if (tipo !== "Bearer" || !token) {
      return res.status(401).json({ mensagem: "Formato de token inválido." });
    }

    req.usuario = verificarToken(token);
    return next();
  } catch (error) {
    console.error("Erro de autenticação:", error);
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
  }
}
