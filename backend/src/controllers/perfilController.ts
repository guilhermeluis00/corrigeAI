import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import prisma from "../prisma.js";

export async function perfil(req: Request, res: Response) {
  try {
    if (!req.usuario) return res.status(401).json({ mensagem: "Usuário não autenticado." });
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, nome: true, email: true, tipo: true, ativo: true, escola: { select: { id: true, nome: true } } }
    });
    if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado." });
    return res.json({ usuario });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar perfil." });
  }
}

export async function atualizarPerfil(req: Request, res: Response) {
  try {
    if (!req.usuario) return res.status(401).json({ mensagem: "Usuário não autenticado." });

    const data: any = {
      nome: req.body.nome !== undefined ? String(req.body.nome).trim() : undefined,
      email: req.body.email !== undefined ? String(req.body.email).trim().toLowerCase() : undefined
    };

    if (req.body.senha) data.senha = await bcrypt.hash(String(req.body.senha), 10);

    const usuario = await prisma.usuario.update({
      where: { id: req.usuario.id },
      data,
      select: { id: true, nome: true, email: true, tipo: true, ativo: true, escolaId: true, escola: { select: { id: true, nome: true } } }
    });

    return res.json({ mensagem: "Perfil atualizado com sucesso.", usuario });
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error);
    if (error?.code === "P2002") return res.status(409).json({ mensagem: "Este e-mail já está em uso." });
    return res.status(500).json({ mensagem: "Erro ao atualizar perfil." });
  }
}
