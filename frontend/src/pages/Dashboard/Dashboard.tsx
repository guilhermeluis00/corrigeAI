import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, ClipboardList, Users } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { Badge } from '../../components/DataPage';
import { api } from '../../services/api';
import { useApi } from '../../services/useApi';
import '../Module.css';

const st: Record<string, ['success' | 'neutral' | 'warning', string]> = { RASCUNHO: ['warning', 'Rascunho'], PUBLICADA: ['success', 'Publicada'], ENCERRADA: ['neutral', 'Encerrada'] };

function Stat({ icon: Icon, label, value, meta }: any) {
  return <div className="card stat"><Icon size={17} color="#12A37F" /><div className="stat-label" style={{ marginTop: 12 }}>{label}</div><div className="stat-value">{value}</div><div className="stat-meta">{meta}</div></div>;
}

export default function Dashboard() {
  const { data, loading, erro } = useApi<any>(api.dashboard);
  const i = data?.indicadores || {};
  const provas: any[] = data?.ultimasProvas || [];
  return (
    <AppShell>
      <div className="container page">
        <div className="page-head"><div><h1 className="page-title">Dashboard</h1><p className="page-subtitle">Acompanhe a rotina de avaliações e o desempenho da escola.</p></div></div>
        {erro && <div className="error-box">{erro}</div>}
        <div className="grid grid-4 cards-spaced">
          <Stat icon={Users} label="Alunos" value={loading ? '…' : i.alunos ?? 0} meta={`em ${i.turmas ?? 0} turmas`} />
          <Stat icon={ClipboardList} label="Provas" value={loading ? '…' : i.provas ?? 0} meta="cadastradas" />
          <Stat icon={Activity} label="Correções" value={loading ? '…' : i.correcoes ?? 0} meta="realizadas" />
          <Stat icon={CheckCircle2} label="Média geral" value={loading ? '…' : i.mediaGeral ? Number(i.mediaGeral).toFixed(1).replace('.', ',') : '—'} meta="todas as avaliações" />
        </div>
        <section className="card section-card">
          <div className="section-card-head"><div><h3>Avaliações recentes</h3><p>Últimas provas cadastradas.</p></div><Link className="btn" to="/provas">Ver todas</Link></div>
          {!loading && provas.length === 0 && <p className="muted" style={{ padding: 16 }}>Nenhuma prova cadastrada ainda.</p>}
          <div className="list">{provas.map((p) => { const [t, l] = st[p.status] || ['neutral', p.status]; return (
            <div className="list-item" key={p.id}><div><strong>{p.titulo}</strong><div className="muted">{p.turma?.nome || '—'} · {p.disciplina?.nome || '—'} · {p._count?.questoes ?? 0} questões</div></div><Badge tipo={t}>{l}</Badge></div>); })}</div>
        </section>
      </div>
    </AppShell>
  );
}
