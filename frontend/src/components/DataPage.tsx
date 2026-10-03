import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { AppShell } from './AppShell';
import { useApi } from '../services/useApi';
import '../pages/Module.css';

export type Col<T> = { titulo: string; render: (row: T) => ReactNode };
type Props<T> = {
  titulo: string; subtitulo: string; loader: () => Promise<T[]>; colunas: Col<T>[];
  busca: (row: T) => string; novo?: { to: string; label: string }; resumo?: (rows: T[]) => { label: string; value: ReactNode }[];
};

export function Badge({ children, tipo = 'neutral' }: { children: ReactNode; tipo?: 'success' | 'neutral' | 'warning' | 'danger' }) {
  return <span className={`badge badge-${tipo}`}>{children}</span>;
}

export function DataPage<T>({ titulo, subtitulo, loader, colunas, busca, novo, resumo }: Props<T>) {
  const { data, loading, erro } = useApi<T[]>(loader);
  const [q, setQ] = useState('');
  const rows = useMemo(() => (data || []).filter((r) => busca(r).toLowerCase().includes(q.trim().toLowerCase())), [data, q]);
  const stats = resumo && data ? resumo(data) : [];
  return (
    <AppShell>
      <div className="container page">
        <div className="page-head">
          <div><h1 className="page-title">{titulo}</h1><p className="page-subtitle">{subtitulo}</p></div>
          {novo && <Link className="btn btn-primary" to={novo.to}><Plus size={16} /> {novo.label}</Link>}
        </div>
        {stats.length > 0 && <div className="grid grid-4 cards-spaced">{stats.map((s) => <div className="card stat" key={s.label}><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div></div>)}</div>}
        <section className="card section-card">
          <div className="section-card-head">
            <div className="field search"><label>Buscar</label>
              <div style={{ position: 'relative' }}><Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#8a98a4' }} />
                <input style={{ paddingLeft: 34 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Digite para filtrar" /></div>
            </div>
            <span className="badge badge-neutral">{rows.length} registros</span>
          </div>
          {erro && <div className="error-box">{erro}</div>}
          {loading ? <p className="muted" style={{ padding: 16 }}>Carregando...</p> : !erro && rows.length === 0 ? <p className="muted" style={{ padding: 16 }}>Nenhum registro encontrado.</p> : (
            <div className="table-wrap"><table>
              <thead><tr>{colunas.map((c) => <th key={c.titulo}>{c.titulo}</th>)}</tr></thead>
              <tbody>{rows.map((r, i) => <tr key={i}>{colunas.map((c) => <td key={c.titulo}>{c.render(r)}</td>)}</tr>)}</tbody>
            </table></div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
