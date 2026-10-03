import jwt from "jsonwebtoken";
import type { TipoUsuario } from "@prisma/client";

export type TokenPayload = {
  id: number;
  tipo: TipoUsuario;
  escolaId: number | null;
};

export function gerarToken(payload: TokenPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não configurado no .env");

  return jwt.sign(payload, secret, { expiresIn: "8h" });
}

export function verificarToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não configurado no .env");

  return jwt.verify(token, secret) as TokenPayload;
}
