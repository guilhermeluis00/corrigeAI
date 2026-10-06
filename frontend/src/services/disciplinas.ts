// As disciplinas vêm da escola: a base comum (ensino médio) e as dos cursos técnicos que ela cadastrar.
export type DisciplinaOpcao = { nome: string; curso?: string | null };

export const BASE_COMUM = 'Ensino médio';
export const opcoesDisciplinas = (lista: DisciplinaOpcao[] | null | undefined) =>
  (lista || []).map((d) => ({ value: d.nome, label: d.curso ? `${d.nome} — ${d.curso}` : d.nome }));
// Nomes das disciplinas que o usuário leciona, separados por vírgula.
export const nomesDisciplinas = (u: any): string => (u?.disciplinas || []).map((d: any) => d.nome).join(', ');
