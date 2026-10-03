import { Link } from 'react-router-dom';
import { DataPage, Badge } from '../../components/DataPage';
import { api } from '../../services/api';

const status: Record<string, ['success' | 'neutral' | 'warning', string]> = {
  RASCUNHO: ['warning', 'Rascunho'], PUBLICADA: ['success', 'Publicada'], ENCERRADA: ['neutral', 'Encerrada'],
};
const data = (v?: string) => (v ? new Date(v).toLocaleDateString('pt-BR') : '—');

export default function Provas() {
  return <DataPage<any>
    titulo="Provas" subtitulo="Crie e acompanhe avaliações, questões e gabaritos."
    loader={api.provas} busca={(p) => `${p.titulo} ${p.turma?.nome || ''} ${p.disciplina?.nome || ''}`}
    novo={{ to: '/provas/nova', label: 'Nova prova' }}
    colunas={[
      { titulo: 'Prova', render: (p) => <Link to={`/provas/${p.id}`}><strong>{p.titulo}</strong></Link> },
      { titulo: 'Disciplina', render: (p) => p.disciplina?.nome || '—' },
      { titulo: 'Turma', render: (p) => p.turma?.nome || '—' },
      { titulo: 'Aplicação', render: (p) => data(p.dataAplicacao) },
      { titulo: 'Questões', render: (p) => p._count?.questoes ?? 0 },
      { titulo: 'Status', render: (p) => { const [t, l] = status[p.status] || ['neutral', p.status]; return <Badge tipo={t}>{l}</Badge>; } },
    ]} />;
}
