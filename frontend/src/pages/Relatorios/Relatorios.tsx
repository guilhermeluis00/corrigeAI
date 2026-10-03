import { useMemo } from 'react';
import { AppShell } from '../../components/AppShell';
import { api } from '../../services/api';
import { useApi } from '../../services/useApi';
import '../Module.css';

const f = (n: number) => n.toFixed(1).replace('.', ',');

export default function Relatorios() {
  const { data, loading, erro } = useApi<any[]>(api.resultados);
  const r = useMemo(() => {
    const ok = (data || []).filter((x) => x.status === 'CONCLUIDA' && x.nota != null);
    const por: Record<string, number[]> = {};
    ok.forEach((x) => { const k = x.aluno?.turma?.nome || 'Sem turma'; (por[k] ||= []).push(Number(x.nota)); });
    const notas = ok.map((x) => Number(x.nota));
    const media = (a: number[]) => a.reduce((s, n) => s + n, 0) / a.length;
    return { n: notas.length, media: notas.length ? media(notas) : null, aprov: notas.length ? (notas.filter((n) => n >= 6).length / notas.length) * 100 : null,
      turmas: Object.entries(por).map(([t, a]) => ({ t, m: media(a), q: a.length })).sort((a, b) => b.m - a.m) };
  }, [data]);
  return (
    <AppShell><div className="container page">
      <div className="page-head"><div><h1 className="page-title">Relatórios</h1><p className="page-subtitle">Desempenho calculado a partir das correções concluídas.</p></div></div>
      {erro && <div className="error-box">{erro}</div>}
      <div className="grid grid-4 cards-spaced">
        <div className="card stat"><div className="stat-label">Correções concluídas</div><div className="stat-value">{loading ? '…' : r.n}</div></div>
        <div className="card stat"><div className="stat-label">Média geral</div><div className="stat-value">{r.media == null ? '—' : f(r.media)}</div></div>
        <div className="card stat"><div className="stat-label">Aprovação (nota ≥ 6)</div><div className="stat-value">{r.aprov == null ? '—' : `${Math.round(r.aprov)}%`}</div></div>
      </div>
      <section className="card section-card"><div className="section-card-head"><div><h3>Média por turma</h3></div></div>
        {!loading && r.turmas.length === 0 ? <p className="muted" style={{ padding: 16 }}>Ainda não há correções concluídas.</p> :
          <div className="table-wrap"><table><thead><tr><th>Turma</th><th>Correções</th><th>Média</th></tr></thead><tbody>{r.turmas.map((x) => <tr key={x.t}><td><strong>{x.t}</strong></td><td>{x.q}</td><td>{f(x.m)}</td></tr>)}</tbody></table></div>}
      </section>
    </div></AppShell>
  );
}
