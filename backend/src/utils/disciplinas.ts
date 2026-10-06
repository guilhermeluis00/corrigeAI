import prisma from "../prisma.js";

export const DISCIPLINAS_EM = [
  "Língua Portuguesa", "Literatura", "Redação", "Língua Inglesa", "Língua Espanhola", "Artes", "Educação Física",
  "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Filosofia", "Sociologia", "Projeto de Vida"
];

// Cria a lista padrão do ensino médio apenas quando a escola ainda não tem nenhuma disciplina.
export async function garantirDisciplinas(escolaId: number) {
  if ((await prisma.disciplina.count({ where: { escolaId } })) > 0) return;
  await prisma.disciplina.createMany({ data: DISCIPLINAS_EM.map((nome) => ({ nome, escolaId })), skipDuplicates: true });
}

export const selectDisciplinas = { select: { id: true, nome: true }, orderBy: { nome: "asc" as const } };

// Retorna as disciplinas ({ id }) da escola a partir dos nomes, criando a lista padrão se necessário.
// Aceita uma lista de nomes ou um único nome.
export async function disciplinaIdsPorNomes(escolaId: number, nomes: unknown) {
  const validos = [...new Set((Array.isArray(nomes) ? nomes : [nomes]).map((n) => String(n ?? "").trim()))].filter(Boolean);
  if (!validos.length) return [];
  await garantirDisciplinas(escolaId);
  const disciplinas = await prisma.disciplina.findMany({ where: { escolaId, nome: { in: validos } }, select: { id: true } });
  return disciplinas.map((d) => ({ id: d.id }));
}
