import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setSession } from '../../services/api';
import '../Auth.css';

export default function CadastroEscola() {
  const nav = useNavigate();
  const [f, setF] = useState({ nome: '', cnpj: '', email: '', telefone: '', endereco: '' });
  const [escola, setEscola] = useState<any>(null);
  const [erro, setErro] = useState(''); const [loading, setLoading] = useState(false); const [copiado, setCopiado] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault(); setErro('');
    if (!f.nome.trim() || !f.cnpj.trim()) { setErro('Informe o nome da escola e o CNPJ.'); return; }
    setLoading(true);
    try { const d = await api.criarEscola(f); setSession(d.token, d.usuario); setEscola(d.escola); }
    catch (err) { setErro(err instanceof Error ? err.message : 'Não foi possível cadastrar a escola.'); }
    finally { setLoading(false); }
  }
  const input = (k: keyof typeof f, label: string, ph = '') => <div className="field"><label>{label}</label><input value={f[k]} placeholder={ph} onChange={(e) => set(k, e.target.value)} /></div>;

  return (
    <div className="auth-page">
      <section className="auth-brand">
        <img src="/assets/logo-horizontal-branco.png" alt="CorrigeAI" />
        <div className="auth-brand-content"><span className="eyebrow">ÚLTIMO PASSO</span><h1>Cadastre a sua escola.</h1><p>Ao concluir, a escola recebe um código. Repasse esse código a coordenadores e professores para que eles criem a conta vinculada à escola.</p></div>
        <div className="auth-note">Somente o diretor cadastra a escola.</div>
      </section>
      <section className="auth-card-wrap"><div className="auth-card">
        <img src="/assets/logo-horizontal.png" alt="CorrigeAI" />
        {escola ? (<>
          <h2>Escola cadastrada</h2><p>{escola.nome}</p>
          <div className="card card-pad" style={{ textAlign: 'center', margin: '16px 0' }}>
            <div className="muted">Código da escola</div>
            <div style={{ fontSize: 30, fontWeight: 700, fontFamily: 'monospace', wordBreak: 'break-all' }}>{escola.codigo}</div>
            <button type="button" className="btn" onClick={() => { navigator.clipboard?.writeText(escola.codigo); setCopiado(true); }}>{copiado ? 'Copiado' : 'Copiar código'}</button>
          </div>
          <p className="muted">Você poderá consultar este código depois em Gestão da escola.</p>
          <button className="btn btn-primary auth-submit" onClick={() => nav('/dashboard')}>Ir para o painel</button>
        </>) : (<>
          <h2>Dados da escola</h2><p>Informe os dados da instituição.</p>
          {erro && <div className="error-box">{erro}</div>}
          <form className="auth-form" onSubmit={submit}>
            {input('nome', 'Nome da escola *')}{input('cnpj', 'CNPJ *', '00.000.000/0000-00')}{input('email', 'E-mail da escola')}{input('telefone', 'Telefone')}{input('endereco', 'Endereço')}
            <button className="btn btn-primary auth-submit" disabled={loading}>{loading ? 'Salvando...' : 'Cadastrar escola'}</button>
          </form>
        </>)}
      </div></section>
    </div>
  );
}
