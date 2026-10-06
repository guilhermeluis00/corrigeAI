import type { Request, Response } from "express";
import prisma from "../prisma.js";

function provaScope(req: Request) {
  if (!req.usuario?.escolaId) return { id: -1 };
  if (req.usuario.tipo === "PROFESSOR") return { escolaId: req.usuario.escolaId, professorId: req.usuario.id };
  return { escolaId: req.usuario.escolaId };
}

const includeDetalhado = {
  disciplina: true,
  turma: true,
  professor: { select: { id: true, nome: true, email: true } },
  questoes: { orderBy: { numero: "asc" as const } },
  _count: { select: { questoes: true, resultados: true } }
};

export async function listarProvas(req: Request, res: Response) {
  try {
    const q = String(req.query.q || "").trim();
    const where: any = provaScope(req);
    if (q) where.titulo = { contains: q, mode: "insensitive" };

    const provas = await prisma.prova.findMany({
      where,
      include: includeDetalhado,
      orderBy: [{ dataAplicacao: "desc" }, { createdAt: "desc" }]
    });

    return res.json(provas);
  } catch (error) {
    console.error("Erro ao listar provas:", error);
    return res.status(500).json({ mensagem: "Erro ao listar provas." });
  }
}

function validarQuestoes(questoes: any, status?: string) {
  if (!Array.isArray(questoes)) return status === "PUBLICADA" ? "Adicione ao menos uma questão para publicar." : null;
  if (status === "PUBLICADA" && questoes.length === 0) return "Adicione ao menos uma questão para publicar.";
  for (const [i, q] of questoes.entries()) {
    if (!["A", "B", "C", "D", "E"].includes(String(q.resposta || "").toUpperCase())) return `Defina o gabarito (A a E) da questão ${i + 1}.`;
    if (!(Number(q.valor ?? 1) > 0)) return `O valor da questão ${i + 1} deve ser maior que zero.`;
  }
  return null;
}

// O professor que elabora a prova precisa dar aula na turma escolhida.
async function professorDaTurma(professorId: number | null, turmaId?: number | null) {
  if (!professorId || !turmaId) return true;
  return !!(await prisma.professorTurma.findFirst({ where: { professorId, turmaId } }));
}

async function validarRelacionamentos(req: Request, body: any) {
  const escolaId = req.usuario?.escolaId;
  const [turma, disciplina, professor] = await Promise.all([
    body.turmaId ? prisma.turma.findFirst({ where: { id: Number(body.turmaId), escolaId } }) : null,
    body.disciplinaId ? prisma.disciplina.findFirst({ where: { id: Number(body.disciplinaId), escolaId } }) : null,
    body.professorId ? prisma.usuario.findFirst({ where: { id: Number(body.professorId), escolaId, tipo: "PROFESSOR", ativo: true } }) : null
  ]);
  return { turma, disciplina, professor };
}

export async function buscarProva(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const prova = await prisma.prova.findFirst({ where: { id, ...provaScope(req) }, include: includeDetalhado });
    if (!prova) return res.status(404).json({ mensagem: "Prova não encontrada." });
    return res.json(prova);
  } catch (error) {
    console.error("Erro ao buscar prova:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar prova." });
  }
}

export async function criarProva(req: Request, res: Response) {
  try {
    if (!req.usuario?.escolaId) return res.status(400).json({ mensagem: "Usuário sem escola vinculada." });

    const { titulo, descricao, dataAplicacao, turmaId, disciplinaId, questoes = [] } = req.body;
    if (!titulo) return res.status(400).json({ mensagem: "Título da prova é obrigatório." });

    const { turma, disciplina } = await validarRelacionamentos(req, { turmaId, disciplinaId });
    if (turmaId && !turma) return res.status(404).json({ mensagem: "Turma não encontrada." });
    if (disciplinaId && !disciplina) return res.status(404).json({ mensagem: "Disciplina não encontrada." });

    const erroQuestoes = validarQuestoes(questoes, req.body.status);
    if (erroQuestoes) return res.status(400).json({ mensagem: erroQuestoes });

    const professorId = req.usuario.tipo === "PROFESSOR" ? req.usuario.id : (req.body.professorId ? Number(req.body.professorId) : null);

    let professor: any = null;
    if (professorId) {
      professor = await prisma.usuario.findFirst({ where: { id: professorId, escolaId: req.usuario.escolaId, tipo: "PROFESSOR", ativo: true }, include: { disciplinas: { select: { id: true } } } });
      if (!professor) return res.status(404).json({ mensagem: "Professor não encontrado." });
    }
    if (!(await professorDaTurma(professorId, turma?.id))) return res.status(400).json({ mensagem: "Este professor não dá aula na turma escolhida." });
    // Sem disciplina informada, usa a do professor quando ele leciona apenas uma.
    const disciplinaFinalId = disciplina?.id ?? (professor?.disciplinas.length === 1 ? professor.disciplinas[0].id : null);

    const prova = await prisma.prova.create({
      data: {
        titulo: String(titulo).trim(),
        descricao: descricao ? String(descricao).trim() : null,
        dataAplicacao: dataAplicacao ? new Date(dataAplicacao) : null,
        status: req.body.status || "RASCUNHO",
        escolaId: req.usuario.escolaId,
        turmaId: turma?.id ?? null,
        disciplinaId: disciplinaFinalId,
        professorId,
        questoes: {
          create: Array.isArray(questoes) ? questoes.map((q: any, index: number) => ({
            numero: Number(q.numero || index + 1),
            enunciado: q.enunciado ? String(q.enunciado) : null,
            alternativaA: q.alternativaA ? String(q.alternativaA) : null,
            alternativaB: q.alternativaB ? String(q.alternativaB) : null,
            alternativaC: q.alternativaC ? String(q.alternativaC) : null,
            alternativaD: q.alternativaD ? String(q.alternativaD) : null,
            alternativaE: q.alternativaE ? String(q.alternativaE) : null,
            resposta: String(q.resposta || "").toUpperCase(),
            valor: Number(q.valor ?? 1)
          })) : []
        }
      },
      include: includeDetalhado
    });

    return res.status(201).json({ mensagem: "Prova criada com sucesso.", prova });
  } catch (error) {
    console.error("Erro ao criar prova:", error);
    return res.status(500).json({ mensagem: "Erro ao criar prova." });
  }
}

export async function atualizarProva(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const existente = await prisma.prova.findFirst({ where: { id, ...provaScope(req) } });
    if (!existente) return res.status(404).json({ mensagem: "Prova não encontrada." });

    const data: any = {
      titulo: req.body.titulo !== undefined ? String(req.body.titulo).trim() : undefined,
      descricao: req.body.descricao !== undefined ? (req.body.descricao ? String(req.body.descricao).trim() : null) : undefined,
      dataAplicacao: req.body.dataAplicacao !== undefined ? (req.body.dataAplicacao ? new Date(req.body.dataAplicacao) : null) : undefined,
      status: req.body.status !== undefined ? req.body.status : undefined,
      turmaId: req.body.turmaId !== undefined ? (req.body.turmaId ? Number(req.body.turmaId) : null) : undefined,
      disciplinaId: req.body.disciplinaId !== undefined ? (req.body.disciplinaId ? Number(req.body.disciplinaId) : null) : undefined,
      professorId: req.usuario?.tipo !== "PROFESSOR" && req.body.professorId !== undefined ? (req.body.professorId ? Number(req.body.professorId) : null) : undefined
    };

    const erroQuestoes = validarQuestoes(req.body.questoes, req.body.status);
    if (erroQuestoes) return res.status(400).json({ mensagem: erroQuestoes });
    const profFinal = data.professorId !== undefined ? data.professorId : existente.professorId;
    const turmaFinal = data.turmaId !== undefined ? data.turmaId : existente.turmaId;
    if (data.professorId) {
      const prof = await prisma.usuario.findFirst({ where: { id: data.professorId, escolaId: req.usuario?.escolaId, tipo: "PROFESSOR", ativo: true } });
      if (!prof) return res.status(404).json({ mensagem: "Professor não encontrado." });
    }
    if (!(await professorDaTurma(profFinal, turmaFinal))) return res.status(400).json({ mensagem: "Este professor não dá aula na turma escolhida." });

    if (req.body.turmaId) {
      const turma = await prisma.turma.findFirst({ where: { id: Number(req.body.turmaId), escolaId: req.usuario?.escolaId } });
      if (!turma) return res.status(404).json({ mensagem: "Turma não encontrada." });
    }
    if (req.body.disciplinaId) {
      const disciplina = await prisma.disciplina.findFirst({ where: { id: Number(req.body.disciplinaId), escolaId: req.usuario?.escolaId } });
      if (!disciplina) return res.status(404).json({ mensagem: "Disciplina não encontrada." });
    }

    if (Array.isArray(req.body.questoes)) {
      await prisma.$transaction([
        prisma.questao.deleteMany({ where: { provaId: id } }),
        prisma.prova.update({
          where: { id },
          data: {
            ...data,
            questoes: {
              create: req.body.questoes.map((q: any, index: number) => ({
                numero: Number(q.numero || index + 1),
                enunciado: q.enunciado ? String(q.enunciado) : null,
                alternativaA: q.alternativaA ? String(q.alternativaA) : null,
                alternativaB: q.alternativaB ? String(q.alternativaB) : null,
                alternativaC: q.alternativaC ? String(q.alternativaC) : null,
                alternativaD: q.alternativaD ? String(q.alternativaD) : null,
                alternativaE: q.alternativaE ? String(q.alternativaE) : null,
                resposta: String(q.resposta || "").toUpperCase(),
                valor: Number(q.valor ?? 1)
              }))
            }
          },
          include: includeDetalhado
        })
      ]);
    }

    const prova = await prisma.prova.update({ where: { id }, data, include: includeDetalhado });
    return res.json({ mensagem: "Prova atualizada com sucesso.", prova });
  } catch (error) {
    console.error("Erro ao atualizar prova:", error);
    return res.status(500).json({ mensagem: "Erro ao atualizar prova." });
  }
}

export async function excluirProva(req: Request, res: Response) {
  try {
    if (req.usuario?.tipo === "PROFESSOR") return res.status(403).json({ mensagem: "Professores não podem excluir provas." });
    const id = Number(req.params.id);
    const prova = await prisma.prova.findFirst({ where: { id, escolaId: req.usuario?.escolaId } });
    if (!prova) return res.status(404).json({ mensagem: "Prova não encontrada." });
    await prisma.prova.delete({ where: { id } });
    return res.json({ mensagem: "Prova excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir prova:", error);
    return res.status(500).json({ mensagem: "Erro ao excluir prova." });
  }
}
