import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { Badge } from '../../components/DataPage';
import { api, getUsuario } from '../../services/api';
import { useApi } from '../../services/useApi';
import '../Module.css';

const st: Record<string, ['success' | 'neutral' | 'warning', string]> = { RASCUNHO: ['warning', 'Rascunho'], PUBLICADA: ['success', 'Publicada'], ENCERRADA: ['neutral', 'Encerrada'] };

export default function ProvaDetalhe() {
  const { id } = useParams(); const nav = useNavigate(); const eu = getUsuario<any>();
  const { data: p, loading, erro } = useApi<any>(() => api.prova(id!), [id]);
  async function excluir() {
    if (!confirm('Excluir esta prova e suas questões?')) return;
    try { await api.excluirProva(id!); nav('/provas'); } catch (e) { alert(e instanceof Error ? e.message : 'Erro ao excluir.'); }
  }
  if (loading || !p) return <AppShell><div className="container page">{erro ? <div className="error-box">{erro}</div> : <p className="muted">Carregando...</p>}</div></AppShell>;
  const [tipo, rotulo] = st[p.status] || ['neutral', p.status];
  const info = [['Elaborada por', p.professor?.nome], ['Disciplina', p.disciplina?.nome], ['Turma', p.turma ? `${p.turma.codigo} — ${p.turma.nome}` : null],
    ['Aplicação', p.dataAplicacao ? new Date(p.dataAplicacao).toLocaleDateString('pt-BR') : null]];
  return (
    <AppShell><div className="container page">
      <div className="page-head"><div><h1 className="page-title">{p.titulo}</h1><p className="page-subtitle">{p.descricao || 'Sem descrição.'}</p></div>
        <div className="actions"><Badge tipo={tipo}>{rotulo}</Badge><Link className="btn" to={`/provas/${p.id}/editar`}><Pencil size={15} /> Editar</Link>
          {eu?.tipo !== 'PROFESSOR' && <button className="btn" onClick={excluir}><Trash2 size={15} /> Excluir</button>}</div></div>
      <div className="grid grid-4 cards-spaced">{info.map(([l, v]) => <div className="card stat" key={l as string}><div className="stat-label">{l}</div><div style={{ fontWeight: 700, fontSize: 18 }}>{v || '—'}</div></div>)}</div>
      <section className="card section-card"><div className="section-card-head"><div><h3>Questões e gabarito</h3><p>{p.questoes.length} questão(ões).</p></div></div>
        {p.questoes.length === 0 ? <p className="muted" style={{ padding: 16 }}>Nenhuma questão cadastrada.</p> : (
          <div className="table-wrap"><table><thead><tr><th>Nº</th><th>Enunciado</th><th>Gabarito</th><th>Valor</th></tr></thead>
            <tbody>{p.questoes.map((q: any) => <tr key={q.id}><td>{q.numero}</td><td>{q.enunciado || '—'}</td><td><strong>{q.resposta}</strong></td><td>{Number(q.valor)}</td></tr>)}</tbody></table></div>)}
      </section>
    </div></AppShell>
  );
}
