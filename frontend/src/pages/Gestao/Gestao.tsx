import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { Badge } from '../../components/DataPage';
import { FormModal } from '../../components/FormModal';
import { api, getUsuario } from '../../services/api';
import { BASE_COMUM, nomesDisciplinas, opcoesDisciplinas } from '../../services/disciplinas';
import { useApi } from '../../services/useApi';
import '../Module.css';

const perfis: Record<string, string> = { DIRETOR: 'Diretor', COORDENADOR: 'Coordenador', PROFESSOR: 'Professor' };

export default function Gestao() {
  const [rk, setRk] = useState(0); const [novo, setNovo] = useState(false); const [copiado, setCopiado] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [rkD, setRkD] = useState(0); const [disc, setDisc] = useState<'nova' | any | null>(null);
  const eu = getUsuario<any>();
  const us = useApi<any[]>(api.usuarios, [rk]);
  const es = useApi<any>(api.escola);
  const ds = useApi<any[]>(api.disciplinas, [rkD]);
  const opcoes = opcoesDisciplinas(ds.data);
  const lista = us.data || [];
  const conta = (t: string) => lista.filter((u) => u.tipo === t && u.ativo).length;

  async function alternar(u: any) {
    try { await api.atualizarUsuario(u.id, { ativo: !u.ativo }); setRk((k) => k + 1); } catch (e) { alert(e instanceof Error ? e.message : 'Erro ao atualizar.'); }
  }
  async function excluirDisciplina(d: any) {
    if (!confirm(`Excluir a disciplina ${d.nome}?`)) return;
    try { await api.excluirDisciplina(d.id); setRkD((k) => k + 1); } catch (e) { alert(e instanceof Error ? e.message : 'Erro ao excluir.'); }
  }
  return (
    <AppShell><div className="container page">
      <div className="page-head"><div><h1 className="page-title">Gestão da escola</h1><p className="page-subtitle">Usuários, disciplinas e dados da escola.</p></div>
        <button className="btn btn-primary" onClick={() => setNovo(true)}><Plus size={16} /> Novo usuário</button></div>
      {(us.erro || es.erro || ds.erro) && <div className="error-box">{us.erro || es.erro || ds.erro}</div>}
      <div className="grid grid-4 cards-spaced">
        <div className="card stat"><div className="stat-label">Código da escola</div><div className="stat-value" style={{ fontFamily: 'monospace', fontSize: 22, wordBreak: 'break-all' }}>{es.data?.codigo ?? '…'}</div>
          <button className="btn" onClick={() => { navigator.clipboard?.writeText(es.data?.codigo || ''); setCopiado(true); }}>{copiado ? 'Copiado' : 'Copiar código'}</button></div>
        <div className="card stat"><div className="stat-label">Usuários ativos</div><div className="stat-value">{lista.filter((u) => u.ativo).length}</div></div>
        <div className="card stat"><div className="stat-label">Professores</div><div className="stat-value">{conta('PROFESSOR')}</div></div>
        <div className="card stat"><div className="stat-label">Coordenadores</div><div className="stat-value">{conta('COORDENADOR')}</div></div>
      </div>
      <section className="card section-card">
        <div className="section-card-head"><div><h3>Usuários</h3><p>Repasse o código da escola para coordenadores e professores se cadastrarem sozinhos.</p></div></div>
        {us.loading ? <p className="muted" style={{ padding: 16 }}>Carregando...</p> : (
          <div className="table-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Disciplinas</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>{lista.map((u) => <tr key={u.id}><td>{u.nome}</td><td>{u.email}</td><td>{perfis[u.tipo]}</td><td>{nomesDisciplinas(u) || '—'}</td>
              <td><Badge tipo={u.ativo ? 'success' : 'neutral'}>{u.ativo ? 'Ativo' : 'Inativo'}</Badge></td>
              <td><div className="table-actions">{u.tipo === 'PROFESSOR' && <button className="btn" onClick={() => setEditando(u)}>Disciplinas</button>}
                {u.id !== eu?.id && <button className="btn" onClick={() => alternar(u)}>{u.ativo ? 'Desativar' : 'Ativar'}</button>}</div></td></tr>)}</tbody></table></div>)}
      </section>
      <section className="card section-card">
        <div className="section-card-head"><div><h3>Disciplinas</h3><p>As do ensino médio já vêm cadastradas. Adicione as disciplinas dos cursos técnicos da escola.</p></div>
          <button className="btn btn-primary" onClick={() => setDisc('nova')}><Plus size={16} /> Nova disciplina</button></div>
        {ds.loading ? <p className="muted" style={{ padding: 16 }}>Carregando...</p> : (
          <div className="table-wrap"><table><thead><tr><th>Disciplina</th><th>Curso</th><th>Professores</th><th>Provas</th><th>Ações</th></tr></thead>
            <tbody>{(ds.data || []).map((d) => <tr key={d.id}><td>{d.nome}</td><td>{d.curso ? <Badge>{d.curso}</Badge> : <span className="muted">{BASE_COMUM}</span>}</td>
              <td>{d._count?.professores ?? 0}</td><td>{d._count?.provas ?? 0}</td>
              <td><div className="table-actions"><button className="icon-btn" title="Editar" onClick={() => setDisc(d)}><Pencil size={15} /></button>
                <button className="icon-btn" title="Excluir" onClick={() => excluirDisciplina(d)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>)}
      </section>
      {es.data && <section className="card section-card"><div className="section-card-head"><div><h3>Dados da escola</h3></div></div>
        <div className="grid grid-4" style={{ padding: 16 }}>{[['Nome', es.data.nome], ['CNPJ', es.data.cnpj], ['E-mail', es.data.email], ['Telefone', es.data.telefone]].map(([l, v]) =>
          <div className="card card-pad" key={l}><div className="muted">{l}</div><strong>{v || '—'}</strong></div>)}</div></section>}
      {novo && <FormModal titulo="Novo usuário" subtitulo="Cria o acesso já vinculado à sua escola." rotulo="Criar usuário"
        campos={[{ name: 'nome', label: 'Nome completo', required: true }, { name: 'email', label: 'E-mail', type: 'email', required: true }, { name: 'senha', label: 'Senha inicial (mín. 6)', type: 'password', required: true },
          { name: 'tipo', label: 'Perfil', type: 'select', required: true, options: [{ value: 'PROFESSOR', label: 'Professor' }, { value: 'COORDENADOR', label: 'Coordenador' }] },
          { name: 'disciplinas', label: 'Disciplinas que leciona', type: 'checks', required: true, options: opcoes, visivelSe: (v) => v.tipo === 'PROFESSOR' }]}
        onClose={() => setNovo(false)} onSubmit={async (v) => { await api.criarUsuario(v); setRk((k) => k + 1); }} />}
      {editando && <FormModal key={editando.id} titulo="Disciplinas do professor" subtitulo={editando.nome}
        campos={[{ name: 'disciplinas', label: 'Disciplinas que leciona', type: 'checks', required: true, options: opcoes }]}
        inicial={{ disciplinas: (editando.disciplinas || []).map((d: any) => d.nome) }}
        onClose={() => setEditando(null)} onSubmit={async (v) => { await api.atualizarUsuario(editando.id, { disciplinas: v.disciplinas }); setRk((k) => k + 1); setRkD((k) => k + 1); }} />}
      {disc && <FormModal key={disc === 'nova' ? 'nova' : disc.id} titulo={disc === 'nova' ? 'Nova disciplina' : 'Editar disciplina'} subtitulo="Informe o curso técnico ou deixe em branco para o ensino médio."
        campos={[{ name: 'nome', label: 'Nome da disciplina', required: true, placeholder: 'Ex.: Banco de Dados' }, { name: 'curso', label: 'Curso técnico', placeholder: 'Ex.: Técnico em Informática' }]}
        inicial={disc === 'nova' ? undefined : disc}
        onClose={() => setDisc(null)} onSubmit={async (v) => { const d = { nome: v.nome, curso: v.curso }; await (disc === 'nova' ? api.criarDisciplina(d) : api.atualizarDisciplina(disc.id, d)); setRkD((k) => k + 1); setRk((k) => k + 1); }} />}
    </div></AppShell>
  );
}
