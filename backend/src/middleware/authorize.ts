import type { NextFunction, Request, Response } from "express";
import type { TipoUsuario } from "@prisma/client";

export function permitir(...tipos: TipoUsuario[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    if (!tipos.includes(req.usuario.tipo)) {
      return res.status(403).json({ mensagem: "Você não tem permissão para esta operação." });
    }

    return next();
  };
}
