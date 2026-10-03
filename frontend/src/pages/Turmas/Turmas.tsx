import { DataPage, Badge } from '../../components/DataPage';
import { api } from '../../services/api';

const turnos: Record<string, string> = { MANHA: 'Manhã', TARDE: 'Tarde', NOITE: 'Noite' };

export default function Turmas() {
  return <DataPage<any>
    titulo="Turmas" subtitulo="Turmas da escola, alunos e professores vinculados."
    loader={api.turmas} busca={(t) => `${t.codigo} ${t.nome}`}
    resumo={(r) => [{ label: 'Turmas', value: r.length }, { label: 'Alunos', value: r.reduce((s, t) => s + (t._count?.alunos || 0), 0) }, { label: 'Provas', value: r.reduce((s, t) => s + (t._count?.provas || 0), 0) }]}
    colunas={[
      { titulo: 'Código', render: (t) => <strong>{t.codigo}</strong> },
      { titulo: 'Turma', render: (t) => t.nome },
      { titulo: 'Série', render: (t) => t.serie || '—' },
      { titulo: 'Turno', render: (t) => <Badge>{turnos[t.turno] || '—'}</Badge> },
      { titulo: 'Alunos', render: (t) => t._count?.alunos ?? 0 },
      { titulo: 'Professores', render: (t) => t._count?.professores ?? 0 },
    ]} />;
}
