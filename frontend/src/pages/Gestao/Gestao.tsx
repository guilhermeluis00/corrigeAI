import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { Badge } from '../../components/DataPage';
import { FormModal } from '../../components/FormModal';
import { api, getUsuario } from '../../services/api';
import { useApi } from '../../services/useApi';
import '../Module.css';

const perfis: Record<string, string> = { DIRETOR: 'Diretor', COORDENADOR: 'Coordenador', PROFESSOR: 'Professor' };

export default function Gestao() {
  const [rk, setRk] = useState(0); const [novo, setNovo] = useState(false); const [copiado, setCopiado] = useState(false);
  const eu = getUsuario<any>();
  const us = useApi<any[]>(api.usuarios, [rk]);
  const es = useApi<any>(api.escola);
  const lista = us.data || [];
  const conta = (t: string) => lista.filter((u) => u.tipo === t && u.ativo).length;

  async function alternar(u: any) {
    try { await api.atualizarUsuario(u.id, { ativo: !u.ativo }); setRk((k) => k + 1); } catch (e) { alert(e instanceof Error ? e.message : 'Erro ao atualizar.'); }
  }
  return (
    <AppShell><div className="container page">
      <div className="page-head"><div><h1 className="page-title">Gestão da escola</h1><p className="page-subtitle">Usuários, equipe e dados da escola.</p></div>
        <button className="btn btn-primary" onClick={() => setNovo(true)}><Plus size={16} /> Novo usuário</button></div>
      {(us.erro || es.erro) && <div className="error-box">{us.erro || es.erro}</div>}
      <div className="grid grid-4 cards-spaced">
        <div className="card stat"><div className="stat-label">Código da escola</div><div className="stat-value">{es.data?.id ?? '…'}</div>
          <button className="btn" onClick={() => { navigator.clipboard?.writeText(String(es.data?.id)); setCopiado(true); }}>{copiado ? 'Copiado' : 'Copiar código'}</button></div>
        <div className="card stat"><div className="stat-label">Usuários ativos</div><div className="stat-value">{lista.filter((u) => u.ativo).length}</div></div>
        <div className="card stat"><div className="stat-label">Professores</div><div className="stat-value">{conta('PROFESSOR')}</div></div>
        <div className="card stat"><div className="stat-label">Coordenadores</div><div className="stat-value">{conta('COORDENADOR')}</div></div>
      </div>
      <section className="card section-card">
        <div className="section-card-head"><div><h3>Usuários</h3><p>Repasse o código da escola para coordenadores e professores se cadastrarem sozinhos.</p></div></div>
        {us.loading ? <p className="muted" style={{ padding: 16 }}>Carregando...</p> : (
          <div className="table-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>{lista.map((u) => <tr key={u.id}><td>{u.nome}</td><td>{u.email}</td><td>{perfis[u.tipo]}</td>
              <td><Badge tipo={u.ativo ? 'success' : 'neutral'}>{u.ativo ? 'Ativo' : 'Inativo'}</Badge></td>
              <td>{u.id !== eu?.id && <button className="btn" onClick={() => alternar(u)}>{u.ativo ? 'Desativar' : 'Ativar'}</button>}</td></tr>)}</tbody></table></div>)}
      </section>
      {es.data && <section className="card section-card"><div className="section-card-head"><div><h3>Dados da escola</h3></div></div>
        <div className="grid grid-4" style={{ padding: 16 }}>{[['Nome', es.data.nome], ['CNPJ', es.data.cnpj], ['E-mail', es.data.email], ['Telefone', es.data.telefone]].map(([l, v]) =>
          <div className="card" key={l}><div className="muted">{l}</div><strong>{v || '—'}</strong></div>)}</div></section>}
      {novo && <FormModal titulo="Novo usuário" subtitulo="Cria o acesso já vinculado à sua escola." rotulo="Criar usuário"
        campos={[{ name: 'nome', label: 'Nome completo', required: true }, { name: 'email', label: 'E-mail', type: 'email', required: true }, { name: 'senha', label: 'Senha inicial (mín. 6)', type: 'password', required: true },
          { name: 'tipo', label: 'Perfil', type: 'select', required: true, options: [{ value: 'PROFESSOR', label: 'Professor' }, { value: 'COORDENADOR', label: 'Coordenador' }] }]}
        onClose={() => setNovo(false)} onSubmit={async (v) => { await api.criarUsuario(v); setRk((k) => k + 1); }} />}
    </div></AppShell>
  );
}
