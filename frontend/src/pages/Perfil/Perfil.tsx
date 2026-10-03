import { FormEvent, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { api, getToken, setSession } from '../../services/api';
import '../Module.css';

const perfis: Record<string, string> = { DIRETOR: 'Diretor', COORDENADOR: 'Coordenador', PROFESSOR: 'Professor' };

export default function Perfil() {
  const [u, setU] = useState<any>(null); const [nome, setNome] = useState(''); const [email, setEmail] = useState(''); const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(''); const [erro, setErro] = useState('');
  useEffect(() => { api.perfil().then((d) => { setU(d.usuario); setNome(d.usuario.nome); setEmail(d.usuario.email); }).catch((e) => setErro(e.message)); }, []);

  async function salvar(e: FormEvent) {
    e.preventDefault(); setMsg(''); setErro('');
    if (senha && senha.length < 6) { setErro('A nova senha deve ter pelo menos 6 caracteres.'); return; }
    try {
      const d = await api.atualizarPerfil({ nome, email, ...(senha ? { senha } : {}) });
      setU(d.usuario); setSenha(''); setSession(getToken() || '', d.usuario); setMsg('Perfil atualizado.');
    } catch (err) { setErro(err instanceof Error ? err.message : 'Erro ao salvar.'); }
  }
  if (!u) return <AppShell><div className="container page">{erro ? <div className="error-box">{erro}</div> : <p className="muted">Carregando...</p>}</div></AppShell>;
  return (
    <AppShell><form className="container page" onSubmit={salvar}>
      <div className="page-head"><div><h1 className="page-title">Meu perfil</h1><p className="page-subtitle">Atualize suas informações de acesso.</p></div>
        <button className="btn btn-primary"><Save size={16} /> Salvar alterações</button></div>
      {erro && <div className="error-box">{erro}</div>}{msg && <div className="card" style={{ marginBottom: 12 }}>{msg}</div>}
      <section className="card section-card" style={{ padding: 20 }}>
        <h3>{u.nome}</h3><p className="muted">{perfis[u.tipo]}{u.disciplina?.nome ? ` de ${u.disciplina.nome}` : ''} · {u.escola?.nome || 'Sem escola'}</p>
        <div className="grid grid-4" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 16 }}>
          <div className="field"><label>Nome completo</label><input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
          <div className="field"><label>E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="field"><label>Perfil</label><input value={perfis[u.tipo]} disabled /></div>
          <div className="field"><label>Nova senha (opcional)</label><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Deixe em branco para manter" /></div>
        </div>
      </section>
    </form></AppShell>
  );
}
