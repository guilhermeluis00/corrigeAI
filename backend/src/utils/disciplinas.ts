import prisma from "../prisma.js";

export const DISCIPLINAS_EM = [
  "Língua Portuguesa", "Literatura", "Redação", "Língua Inglesa", "Língua Espanhola", "Artes", "Educação Física",
  "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Filosofia", "Sociologia", "Projeto de Vida"
];

export async function garantirDisciplinas(escolaId: number) {
  await prisma.disciplina.createMany({ data: DISCIPLINAS_EM.map((nome) => ({ nome, escolaId })), skipDuplicates: true });
}

// Retorna o id da disciplina (por nome) da escola, criando a lista padrão se necessário.
export async function disciplinaIdPorNome(escolaId: number, nome: string) {
  if (!DISCIPLINAS_EM.includes(nome)) return null;
  await garantirDisciplinas(escolaId);
  const d = await prisma.disciplina.findFirst({ where: { escolaId, nome } });
  return d?.id ?? null;
}
