import type { Request, Response } from "express";
import prisma from "../prisma.js";

export async function relatorios(req: Request, res: Response) {
  try {
    if (!req.usuario?.escolaId) return res.json({ indicadores: {}, porDisciplina: [], porTurma: [] });

    const escolaId = req.usuario.escolaId;
    const provaWhere: any = { escolaId };
    if (req.usuario.tipo === "PROFESSOR") provaWhere.professorId = req.usuario.id;

    const [resultados, turmas, disciplinas] = await Promise.all([
      prisma.resultado.findMany({ where: { prova: provaWhere, nota: { not: null } }, include: { prova: { include: { turma: true, disciplina: true } } } }),
      prisma.turma.findMany({ where: { escolaId }, select: { id: true, nome: true } }),
      prisma.disciplina.findMany({ where: { escolaId } })
    ]);

    const notas = resultados.map((r) => Number(r.nota));
    const mediaEscola = notas.length ? Number((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    const porDisciplina = disciplinas.map((d) => {
      const values = resultados.filter((r) => r.prova.disciplinaId === d.id).map((r) => Number(r.nota));
      return { id: d.id, nome: d.nome, media: values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0 };
    });

    const porTurma = turmas.map((t: any) => {
      const values = resultados.filter((r) => r.prova.turmaId === t.id).map((r) => Number(r.nota));
      return { id: t.id, nome: t.nome, media: values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0 };
    });

    return res.json({
      indicadores: {
        mediaEscola,
        totalResultados: resultados.length,
        maiorNota: notas.length ? Math.max(...notas) : 0,
        menorNota: notas.length ? Math.min(...notas) : 0
      },
      porDisciplina,
      porTurma
    });
  } catch (error) {
    console.error("Erro nos relatórios:", error);
    return res.status(500).json({ mensagem: "Erro ao gerar relatórios." });
  }
}
