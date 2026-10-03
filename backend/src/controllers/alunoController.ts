import type { Request, Response } from "express";
import prisma from "../prisma.js";

function turmaScope(req: Request) {
  if (!req.usuario?.escolaId) return { id: -1 };
  if (req.usuario.tipo === "PROFESSOR") {
    return { escolaId: req.usuario.escolaId, professores: { some: { professorId: req.usuario.id } } };
  }
  return { escolaId: req.usuario.escolaId };
}

export async function listarAlunos(req: Request, res: Response) {
  try {
    const turmaId = req.query.turmaId ? Number(req.query.turmaId) : undefined;
    const q = String(req.query.q || "").trim();

    const where: any = { turma: turmaScope(req) };
    if (turmaId) where.turmaId = turmaId;
    if (q) {
      where.OR = [
        { nome: { contains: q, mode: "insensitive" } },
        { matricula: { contains: q, mode: "insensitive" } }
      ];
    }

    const alunos = await prisma.aluno.findMany({
      where,
      include: { turma: { select: { id: true, nome: true, codigo: true } }, _count: { select: { resultados: true } } },
      orderBy: { nome: "asc" }
    });

    return res.json(alunos);
  } catch (error) {
    console.error("Erro ao listar alunos:", error);
    return res.status(500).json({ mensagem: "Erro ao listar alunos." });
  }
}

export async function buscarAluno(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const aluno = await prisma.aluno.findFirst({
      where: { id, turma: turmaScope(req) },
      include: {
        turma: true,
        resultados: {
          include: { prova: true },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!aluno) return res.status(404).json({ mensagem: "Aluno não encontrado." });
    return res.json(aluno);
  } catch (error) {
    console.error("Erro ao buscar aluno:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar aluno." });
  }
}

export async function criarAluno(req: Request, res: Response) {
  try {
    if (!req.usuario || req.usuario.tipo === "PROFESSOR") return res.status(403).json({ mensagem: "Professores não podem cadastrar alunos." });

    const { nome, matricula, email, turmaId } = req.body;
    if (!nome || !matricula || !turmaId) return res.status(400).json({ mensagem: "Nome, matrícula e turma são obrigatórios." });

    const turma = await prisma.turma.findFirst({ where: { id: Number(turmaId), escolaId: req.usuario.escolaId } });
    if (!turma) return res.status(404).json({ mensagem: "Turma não encontrada." });

    const aluno = await prisma.aluno.create({
      data: {
        nome: String(nome).trim(),
        matricula: String(matricula).trim(),
        email: email ? String(email).trim().toLowerCase() : null,
        turmaId: turma.id
      },
      include: { turma: true }
    });

    return res.status(201).json({ mensagem: "Aluno cadastrado com sucesso.", aluno });
  } catch (error: any) {
    console.error("Erro ao criar aluno:", error);
    if (error?.code === "P2002") return res.status(409).json({ mensagem: "Essa matrícula já existe nesta turma." });
    return res.status(500).json({ mensagem: "Erro ao criar aluno." });
  }
}

export async function atualizarAluno(req: Request, res: Response) {
  try {
    if (!req.usuario || req.usuario.tipo === "PROFESSOR") return res.status(403).json({ mensagem: "Professores não podem editar alunos." });

    const id = Number(req.params.id);
    const existente = await prisma.aluno.findFirst({ where: { id, turma: { escolaId: req.usuario.escolaId } } });
    if (!existente) return res.status(404).json({ mensagem: "Aluno não encontrado." });

    if (req.body.turmaId) {
      const turma = await prisma.turma.findFirst({ where: { id: Number(req.body.turmaId), escolaId: req.usuario.escolaId } });
      if (!turma) return res.status(404).json({ mensagem: "Nova turma não encontrada." });
    }

    const aluno = await prisma.aluno.update({
      where: { id },
      data: {
        nome: req.body.nome !== undefined ? String(req.body.nome).trim() : undefined,
        matricula: req.body.matricula !== undefined ? String(req.body.matricula).trim() : undefined,
        email: req.body.email !== undefined ? (req.body.email ? String(req.body.email).trim().toLowerCase() : null) : undefined,
        turmaId: req.body.turmaId !== undefined ? Number(req.body.turmaId) : undefined,
        ativo: req.body.ativo !== undefined ? Boolean(req.body.ativo) : undefined
      },
      include: { turma: true }
    });

    return res.json({ mensagem: "Aluno atualizado com sucesso.", aluno });
  } catch (error: any) {
    console.error("Erro ao atualizar aluno:", error);
    if (error?.code === "P2002") return res.status(409).json({ mensagem: "Essa matrícula já existe nesta turma." });
    return res.status(500).json({ mensagem: "Erro ao atualizar aluno." });
  }
}

export async function excluirAluno(req: Request, res: Response) {
  try {
    if (!req.usuario || req.usuario.tipo === "PROFESSOR") return res.status(403).json({ mensagem: "Professores não podem excluir alunos." });

    const id = Number(req.params.id);
    const existente = await prisma.aluno.findFirst({ where: { id, turma: { escolaId: req.usuario.escolaId } } });
    if (!existente) return res.status(404).json({ mensagem: "Aluno não encontrado." });

    await prisma.aluno.delete({ where: { id } });
    return res.json({ mensagem: "Aluno removido com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    return res.status(500).json({ mensagem: "Erro ao excluir aluno." });
  }
}
