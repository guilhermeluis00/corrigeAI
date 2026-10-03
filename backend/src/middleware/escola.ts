import type { NextFunction, Request, Response } from "express";

// Bloqueia o uso da API enquanto o usuário (ex.: diretor novo) ainda não tem escola cadastrada.
export function exigirEscola(req: Request, res: Response, next: NextFunction) {
  if (!req.usuario?.escolaId) {
    return res.status(403).json({ mensagem: "Cadastre a sua escola para continuar.", codigo: "SEM_ESCOLA" });
  }
  return next();
}
