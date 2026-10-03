import type { TipoUsuario } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        tipo: TipoUsuario;
        escolaId: number | null;
      };
    }
  }
}

export {};
