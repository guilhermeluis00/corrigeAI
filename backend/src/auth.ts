import "dotenv/config";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { Request, Response, NextFunction } from "express";

export type UserType = "PROFESSOR" | "COORDENADOR" | "DIRETOR";
export type AuthUser = { id: number; nome: string; email: string; tipo: UserType; escolaId: number | null };

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

export async function hashPassword(password: string) { return bcrypt.hash(password, 10); }
export async function comparePassword(password: string, hash: string) { return bcrypt.compare(password, hash); }

export async function signToken(user: AuthUser) {
  return new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret);
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ mensagem: "Token não informado." });
    const { payload } = await jwtVerify(header.slice(7), secret);
    req.user = { id: Number(payload.id), nome: String(payload.nome), email: String(payload.email), tipo: String(payload.tipo) as UserType, escolaId: payload.escolaId == null ? null : Number(payload.escolaId) };
    next();
  } catch { return res.status(401).json({ mensagem: "Token inválido ou expirado." }); }
}

export function allow(...roles: UserType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.tipo)) return res.status(403).json({ mensagem: "Acesso negado." });
    next();
  };
}

declare global { namespace Express { interface Request { user?: AuthUser } } }
