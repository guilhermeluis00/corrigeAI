import type { Request, Response } from "express";
import prisma from "../prisma.js";
import { garantirDisciplinas } from "../utils/disciplinas.js";

export async function listarDisciplinas(req: Request, res: Response) {
  try {
    if (!req.usuario?.escolaId) return res.json([]);

    await garantirDisciplinas(req.usuario.escolaId);

    const q = String(req.query.q || "").trim();
    const where: any = { escolaId: req.usuario.escolaId };
    if (q) where.nome = { contains: q, mode: "insensitive" };

    const disciplinas = await prisma.disciplina.findMany({
      where,
      include: { _count: { select: { provas: true, professores: true } } },
      orderBy: [{ curso: { sort: "asc", nulls: "first" } }, { nome: "asc" }]
    });

    return res.json(disciplinas);
  } catch (error) {
    console.error("Erro ao listar disciplinas:", error);
    return res.status(500).json({ mensagem: "Erro ao listar disciplinas." });
  }
}

// Pública: usada na tela de cadastro para o professor escolher as disciplinas a partir do código da escola.
export async function disciplinasDaEscola(req: Request, res: Response) {
  try {
    const escola = await prisma.escola.findFirst({ where: { codigo: String(req.params.codigo), ativo: true }, select: { id: true } });
    if (!escola) return res.status(404).json({ mensagem: "Código de escola inválido." });

    await garantirDisciplinas(escola.id);
    const disciplinas = await prisma.disciplina.findMany({
      where: { escolaId: escola.id },
      select: { nome: true, curso: true },
      orderBy: [{ curso: { sort: "asc", nulls: "first" } }, { nome: "asc" }]
    });
    return res.json(disciplinas);
  } catch (error) {
    console.error("Erro ao listar disciplinas da escola:", error);
    return res.status(500).json({ mensagem: "Erro ao listar disciplinas." });
  }
}

export async function criarDisciplina(req: Request, res: Response) {
  try {
    if (!req.usuario?.escolaId) return res.status(400).json({ mensagem: "Usuário sem escola vinculada." });
    if (req.usuario.tipo === "PROFESSOR") return res.status(403).json({ mensagem: "Professores não podem criar disciplinas." });

    const nome = String(req.body.nome || "").trim();
    const descricao = req.body.descricao ? String(req.body.descricao).trim() : null;
    const curso = req.body.curso ? String(req.body.curso).trim() || null : null;
    if (!nome) return res.status(400).json({ mensagem: "Nome da disciplina é obrigatório." });

    const disciplina = await prisma.disciplina.create({
      data: { nome, descricao, curso, escolaId: req.usuario.escolaId }
    });

    return res.status(201).json({ mensagem: "Disciplina criada com sucesso.", disciplina });
  } catch (error: any) {
    console.error("Erro ao criar disciplina:", error);
    if (error?.code === "P2002") return res.status(409).json({ mensagem: "Essa disciplina já existe nesta escola." });
    return res.status(500).json({ mensagem: "Erro ao criar disciplina." });
  }
}

export async function atualizarDisciplina(req: Request, res: Response) {
  try {
    if (!req.usuario || req.usuario.tipo === "PROFESSOR") return res.status(403).json({ mensagem: "Você não pode editar disciplinas." });

    const id = Number(req.params.id);
    const existente = await prisma.disciplina.findFirst({ where: { id, escolaId: req.usuario.escolaId } });
    if (!existente) return res.status(404).json({ mensagem: "Disciplina não encontrada." });

    if (req.body.nome !== undefined && !String(req.body.nome).trim()) return res.status(400).json({ mensagem: "Nome da disciplina é obrigatório." });

    const disciplina = await prisma.disciplina.update({
      where: { id },
      data: {
        nome: req.body.nome !== undefined ? String(req.body.nome).trim() : undefined,
        curso: req.body.curso !== undefined ? (req.body.curso ? String(req.body.curso).trim() || null : null) : undefined,
        descricao: req.body.descricao !== undefined ? (req.body.descricao ? String(req.body.descricao).trim() : null) : undefined
      }
    });

    return res.json({ mensagem: "Disciplina atualizada com sucesso.", disciplina });
  } catch (error: any) {
    console.error("Erro ao atualizar disciplina:", error);
    if (error?.code === "P2002") return res.status(409).json({ mensagem: "Essa disciplina já existe nesta escola." });
    return res.status(500).json({ mensagem: "Erro ao atualizar disciplina." });
  }
}

export async function excluirDisciplina(req: Request, res: Response) {
  try {
    if (!req.usuario || req.usuario.tipo !== "DIRETOR") return res.status(403).json({ mensagem: "Somente o diretor pode excluir disciplinas." });

    const id = Number(req.params.id);
    const existente = await prisma.disciplina.findFirst({ where: { id, escolaId: req.usuario.escolaId } });
    if (!existente) return res.status(404).json({ mensagem: "Disciplina não encontrada." });

    const provas = await prisma.prova.count({ where: { disciplinaId: id } });
    if (provas > 0) return res.status(409).json({ mensagem: "Não é possível excluir uma disciplina vinculada a provas." });
    const professores = await prisma.usuario.count({ where: { disciplinas: { some: { id } } } });
    if (professores > 0) return res.status(409).json({ mensagem: "Não é possível excluir uma disciplina que ainda tem professores. Remova-a dos professores antes." });

    await prisma.disciplina.delete({ where: { id } });
    return res.json({ mensagem: "Disciplina excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir disciplina:", error);
    return res.status(500).json({ mensagem: "Erro ao excluir disciplina." });
  }
}
