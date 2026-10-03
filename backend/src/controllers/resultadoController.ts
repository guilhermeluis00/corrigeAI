import type { Request, Response } from "express";
import prisma from "../prisma.js";

function resultadoScope(req: Request) {
  if (!req.usuario?.escolaId) return { id: -1 };
  if (req.usuario.tipo === "PROFESSOR") {
    return { prova: { escolaId: req.usuario.escolaId, professorId: req.usuario.id } };
  }
  return { prova: { escolaId: req.usuario.escolaId } };
}

export async function listarResultados(req: Request, res: Response) {
  try {
    const where: any = resultadoScope(req);
    if (req.query.provaId) where.provaId = Number(req.query.provaId);
    if (req.query.alunoId) where.alunoId = Number(req.query.alunoId);

    const resultados = await prisma.resultado.findMany({
      where,
      include: {
        aluno: { include: { turma: { select: { id: true, nome: true } } } },
        prova: { include: { disciplina: true, turma: true } },
        respostas: { include: { questao: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(resultados);
  } catch (error) {
    console.error("Erro ao listar resultados:", error);
    return res.status(500).json({ mensagem: "Erro ao listar resultados." });
  }
}

export async function buscarResultado(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const resultado = await prisma.resultado.findFirst({
      where: { id, ...resultadoScope(req) },
      include: {
        aluno: { include: { turma: true } },
        prova: { include: { disciplina: true, turma: true, questoes: { orderBy: { numero: "asc" } } } },
        respostas: { include: { questao: true }, orderBy: { questao: { numero: "asc" } } }
      }
    });

    if (!resultado) return res.status(404).json({ mensagem: "Resultado não encontrado." });
    return res.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar resultado:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar resultado." });
  }
}
