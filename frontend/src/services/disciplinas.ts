// Disciplinas do ensino médio (mesma lista usada pelo backend).
export const DISCIPLINAS_EM = [
  'Língua Portuguesa', 'Literatura', 'Redação', 'Língua Inglesa', 'Língua Espanhola', 'Artes', 'Educação Física',
  'Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia', 'Filosofia', 'Sociologia', 'Projeto de Vida',
];
export const opcoesDisciplinas = DISCIPLINAS_EM.map((d) => ({ value: d, label: d }));
