import type { Request, Response } from "express";
import prisma from "../prisma.js";
import { selectDisciplinas } from "../utils/disciplinas.js";

function turmaWherePorPerfil(req: Request) {
  if (!req.usuario?.escolaId) return { id: -1 };

  if (req.usuario.tipo === "PROFESSOR") {
    return {
      escolaId: req.usuario.escolaId,
      professores: { some: { professorId: req.usuario.id } }
    };
  }

  return { escolaId: req.usuario.escolaId };
}

const includeCompleto = {
  escola: { select: { id: true, nome: true } },
  alunos: true,
  professores: {
    include: {
      professor: { select: { id: true, nome: true, email: true, tipo: true } }
    }
  },
  _count: { select: { alunos: true, professores: true, provas: true } }
};

export async function listarTurmas(req: Request, res: Response) {
  try {
    const q = String(req.query.q || "").trim();
    const base: any = turmaWherePorPerfil(req);

    if (q) {
      base.OR = [
        { codigo: { contains: q, mode: "insensitive" } },
        { nome: { contains: q, mode: "insensitive" } }
      ];
    }

    const turmas = await prisma.turma.findMany({
      where: base,
      include: includeCompleto,
      orderBy: { nome: "asc" }
    });

    return res.json(turmas);
  } catch (error) {
    console.error("Erro ao listar turmas:", error);
    return res.status(500).json({ mensagem: "Erro ao listar turmas." });
  }
}

export async function buscarTurma(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const turma = await prisma.turma.findFirst({ where: { id, ...turmaWherePorPerfil(req) }, include: includeCompleto });

    if (!turma) return res.status(404).json({ mensagem: "Turma não encontrada." });

    return res.json(turma);
  } catch (error) {
    console.error("Erro ao buscar turma:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar turma." });
  }
}

export async function criarTurma(req: Request, res: Response) {
  try {
    if (!req.usuario?.escolaId) return res.status(400).json({ mensagem: "Usuário sem escola vinculada." });

    const { codigo, nome, serie, turno } = req.body;
    if (!codigo || !nome) return res.status(400).json({ mensagem: "Código e nome são obrigatórios." });

    if (req.usuario.tipo === "PROFESSOR") {
      return res.status(403).json({ mensagem: "Professores não podem criar turmas." });
    }

    const turma = await prisma.turma.create({
      data: {
        codigo: String(codigo).trim(),
        nome: String(nome).trim(),
        serie: serie ? String(serie).trim() : null,
        turno: turno || null,
        escolaId: req.usuario.escolaId
      },
      include: includeCompleto
    });

    return res.status(201).json({ mensagem: "Turma criada com sucesso.", turma });
  } catch (error: any) {
    console.error("Erro ao criar turma:", error);
    if (error?.code === "P2002") return res.status(409).json({ mensagem: "Já existe uma turma com esse código." });
    return res.status(500).json({ mensagem: "Erro ao criar turma." });
  }
}

export async function atualizarTurma(req: Request, res: Response) {
  try {
    if (!req.usuario || req.usuario.tipo === "PROFESSOR") return res.status(403).json({ mensagem: "Você não pode editar turmas." });

    const id = Number(req.params.id);
    const existente = await prisma.turma.findFirst({ where: { id, escolaId: req.usuario.escolaId } });
    if (!existente) return res.status(404).json({ mensagem: "Turma não encontrada." });

    const turma = await prisma.turma.update({
      where: { id },
      data: {
        codigo: req.body.codigo !== undefined ? String(req.body.codigo).trim() : undefined,
        nome: req.body.nome !== undefined ? String(req.body.nome).trim() : undefined,
        serie: req.body.serie !== undefined ? (req.body.serie ? String(req.body.serie).trim() : null) : undefined,
        turno: req.body.turno !== undefined ? req.body.turno || null : undefined
      },
      include: includeCompleto
    });

    return res.json({ mensagem: "Turma atualizada com sucesso.", turma });
  } catch (error: any) {
    console.error("Erro ao atualizar turma:", error);
    if (error?.code === "P2002") return res.status(409).json({ mensagem: "Já existe outra turma com esse código." });
    return res.status(500).json({ mensagem: "Erro ao atualizar turma." });
  }
}

export async function excluirTurma(req: Request, res: Response) {
  try {
    if (!req.usuario || req.usuario.tipo === "PROFESSOR") return res.status(403).json({ mensagem: "Você não pode excluir turmas." });

    const id = Number(req.params.id);
    const existente = await prisma.turma.findFirst({ where: { id, escolaId: req.usuario.escolaId } });
    if (!existente) return res.status(404).json({ mensagem: "Turma não encontrada." });

    await prisma.turma.delete({ where: { id } });
    return res.json({ mensagem: "Turma excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir turma:", error);
    return res.status(500).json({ mensagem: "Erro ao excluir turma." });
  }
}

export async function vincularProfessor(req: Request, res: Response) {
  try {
    if (!req.usuario || !["COORDENADOR", "DIRETOR"].includes(req.usuario.tipo)) {
      return res.status(403).json({ mensagem: "Você não pode vincular professores." });
    }

    const turmaId = Number(req.params.id);
    const professorId = Number(req.body.professorId);

    const [turma, professor] = await Promise.all([
      prisma.turma.findFirst({ where: { id: turmaId, escolaId: req.usuario.escolaId } }),
      prisma.usuario.findFirst({ where: { id: professorId, escolaId: req.usuario.escolaId, tipo: "PROFESSOR", ativo: true } })
    ]);

    if (!turma) return res.status(404).json({ mensagem: "Turma não encontrada." });
    if (!professor) return res.status(404).json({ mensagem: "Professor não encontrado." });

    const vinculo = await prisma.professorTurma.upsert({
      where: { professorId_turmaId: { professorId, turmaId } },
      update: {},
      create: { professorId, turmaId }
    });

    return res.status(201).json({ mensagem: "Professor vinculado com sucesso.", vinculo });
  } catch (error) {
    console.error("Erro ao vincular professor:", error);
    return res.status(500).json({ mensagem: "Erro ao vincular professor." });
  }
}

export async function listarProfessores(req: Request, res: Response) {
  try {
    const professores = await prisma.usuario.findMany({
      where: { escolaId: req.usuario?.escolaId, tipo: "PROFESSOR", ativo: true },
      select: { id: true, nome: true, email: true, disciplinas: selectDisciplinas },
      orderBy: { nome: "asc" }
    });
    return res.json(professores);
  } catch (error) {
    console.error("Erro ao listar professores:", error);
    return res.status(500).json({ mensagem: "Erro ao listar professores." });
  }
}

// Define (substitui) a lista de professores que dão aula e têm acesso à turma.
export async function definirProfessores(req: Request, res: Response) {
  try {
    const turmaId = Number(req.params.id);
    const ids: number[] = Array.isArray(req.body.professorIds) ? [...new Set<number>(req.body.professorIds.map(Number))].filter(Boolean) : [];

    const turma = await prisma.turma.findFirst({ where: { id: turmaId, escolaId: req.usuario?.escolaId } });
    if (!turma) return res.status(404).json({ mensagem: "Turma não encontrada." });

    const validos = await prisma.usuario.findMany({ where: { id: { in: ids }, escolaId: req.usuario?.escolaId, tipo: "PROFESSOR", ativo: true }, select: { id: true } });
    if (validos.length !== ids.length) return res.status(400).json({ mensagem: "Há professores inválidos para esta escola." });

    await prisma.$transaction([
      prisma.professorTurma.deleteMany({ where: { turmaId } }),
      prisma.professorTurma.createMany({ data: ids.map((professorId) => ({ professorId, turmaId })) })
    ]);

    return res.json({ mensagem: "Professores da turma atualizados." });
  } catch (error) {
    console.error("Erro ao definir professores:", error);
    return res.status(500).json({ mensagem: "Erro ao atualizar professores da turma." });
  }
}
