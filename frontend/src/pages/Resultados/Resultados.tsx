import { DataPage, Badge } from '../../components/DataPage';
import { api } from '../../services/api';

const st: Record<string, ['success' | 'warning' | 'danger', string]> = {
  CONCLUIDA: ['success', 'Concluída'], PROCESSANDO: ['warning', 'Processando'], ERRO: ['danger', 'Erro'],
};
const nota = (n: unknown) => (n == null ? '—' : Number(n).toFixed(1).replace('.', ','));

export default function Resultados() {
  return <DataPage<any>
    titulo="Resultados" subtitulo="Notas, acertos e erros por aluno e por prova."
    loader={api.resultados} busca={(r) => `${r.aluno?.nome || ''} ${r.prova?.titulo || ''} ${r.aluno?.turma?.nome || ''}`}
    resumo={(r) => {
      const n = r.filter((x) => x.nota != null).map((x) => Number(x.nota));
      return [{ label: 'Correções', value: r.length }, { label: 'Média', value: n.length ? nota(n.reduce((a, b) => a + b, 0) / n.length) : '—' }, { label: 'Maior nota', value: n.length ? nota(Math.max(...n)) : '—' }, { label: 'Menor nota', value: n.length ? nota(Math.min(...n)) : '—' }];
    }}
    colunas={[
      { titulo: 'Aluno', render: (r) => <strong>{r.aluno?.nome}</strong> },
      { titulo: 'Turma', render: (r) => r.aluno?.turma?.nome || '—' },
      { titulo: 'Prova', render: (r) => r.prova?.titulo },
      { titulo: 'Acertos', render: (r) => r.acertos ?? '—' },
      { titulo: 'Erros', render: (r) => r.erros ?? '—' },
      { titulo: 'Nota', render: (r) => <strong>{nota(r.nota)}</strong> },
      { titulo: 'Status', render: (r) => { const [t, l] = st[r.status] || ['warning', r.status]; return <Badge tipo={t}>{l}</Badge>; } },
    ]} />;
}
