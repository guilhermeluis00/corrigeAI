import { Link } from 'react-router-dom';
import { DataPage, Badge } from '../../components/DataPage';
import { api } from '../../services/api';

export default function Alunos() {
  return <DataPage<any>
    titulo="Alunos" subtitulo="Alunos cadastrados nas turmas da escola."
    loader={api.alunos} busca={(a) => `${a.nome} ${a.matricula} ${a.turma?.nome || ''}`}
    resumo={(r) => [{ label: 'Alunos', value: r.length }, { label: 'Ativos', value: r.filter((a) => a.ativo !== false).length }]}
    colunas={[
      { titulo: 'Aluno', render: (a) => <Link to={`/alunos/${a.id}`}><strong>{a.nome}</strong></Link> },
      { titulo: 'Matrícula', render: (a) => a.matricula },
      { titulo: 'Turma', render: (a) => a.turma?.nome || '—' },
      { titulo: 'Correções', render: (a) => a._count?.resultados ?? 0 },
      { titulo: 'Status', render: (a) => <Badge tipo={a.ativo === false ? 'neutral' : 'success'}>{a.ativo === false ? 'Inativo' : 'Ativo'}</Badge> },
    ]} />;
}
