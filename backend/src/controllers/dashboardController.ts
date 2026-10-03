import type { Request, Response } from "express";
import prisma from "../prisma.js";

export async function dashboard(req: Request, res: Response) {
  try {
    if (!req.usuario?.escolaId) {
      return res.json({
        escola: null,
        indicadores: { alunos: 0, turmas: 0, provas: 0, correcoes: 0, mediaGeral: 0 },
        ultimasProvas: [],
        atividadeRecente: []
      });
    }

    const escolaId = req.usuario.escolaId;
    const professorId = req.usuario.tipo === "PROFESSOR" ? req.usuario.id : undefined;

    const turmaWhere: any = { escolaId };
    const provaWhere: any = { escolaId };

    if (professorId) {
      turmaWhere.professores = { some: { professorId } };
      provaWhere.professorId = professorId;
    }

    const [alunos, turmas, provas, correcoes, resultadosComNota, ultimasProvas] = await Promise.all([
      prisma.aluno.count({ where: { turma: turmaWhere, ativo: true } }),
      prisma.turma.count({ where: turmaWhere }),
      prisma.prova.count({ where: provaWhere }),
      prisma.resultado.count({ where: { prova: provaWhere } }),
      prisma.resultado.findMany({ where: { prova: provaWhere, nota: { not: null } }, select: { nota: true } }),
      prisma.prova.findMany({
        where: provaWhere,
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          turma: { select: { id: true, nome: true } },
          disciplina: { select: { id: true, nome: true } },
          _count: { select: { questoes: true, resultados: true } }
        }
      })
    ]);

    const mediaGeral = resultadosComNota.length
      ? Number((resultadosComNota.reduce((sum, r) => sum + Number(r.nota), 0) / resultadosComNota.length).toFixed(2))
      : 0;

    return res.json({
      escola: req.usuario.escolaId,
      indicadores: { alunos, turmas, provas, correcoes, mediaGeral },
      ultimasProvas,
      atividadeRecente: []
    });
  } catch (error) {
    console.error("Erro no dashboard:", error);
    return res.status(500).json({ mensagem: "Erro ao carregar o dashboard." });
  }
}
