export type Role = 'PROFESSOR' | 'COORDENADOR' | 'DIRETOR';
export const rotasPorPerfil: Record<Role, string[]> = {
  PROFESSOR: ['/dashboard','/provas','/correcao','/resultados','/perfil'],
  COORDENADOR: ['/dashboard','/turmas','/alunos','/provas','/correcao','/resultados','/relatorios','/perfil'],
  DIRETOR: ['/dashboard','/turmas','/alunos','/provas','/correcao','/resultados','/relatorios','/gestao','/perfil'],
};
export function canAccess(role: Role | undefined, pathname: string) {
  if (!role) return false;
  return rotasPorPerfil[role].some(r => pathname === r || pathname.startsWith(`${r}/`));
}
