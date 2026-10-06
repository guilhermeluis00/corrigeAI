import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setSession } from '../../services/api';
import { DisciplinasChecks } from '../../components/DisciplinasChecks';
import type { DisciplinaOpcao } from '../../services/disciplinas';
import '../Auth.css';

const TAMANHO_CODIGO = 11;

export default function Cadastro() {
  const nav = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', tipo: 'PROFESSOR', codigoEscola: '' });
  const [disciplinas, setDisciplinas] = useState<string[]>([]);
  const [opcoes, setOpcoes] = useState<DisciplinaOpcao[]>([]);
  const [avisoEscola, setAvisoEscola] = useState('Informe o código da escola para ver as disciplinas.');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const diretor = form.tipo === 'DIRETOR';

  // As disciplinas (inclusive as dos cursos técnicos) são as cadastradas pela escola do código informado.
  useEffect(() => {
    setOpcoes([]); setDisciplinas([]);
    const codigo = form.codigoEscola.trim();
    if (form.tipo !== 'PROFESSOR' || codigo.length !== TAMANHO_CODIGO) { setAvisoEscola('Informe o código da escola para ver as disciplinas.'); return; }
    let vivo = true;
    setAvisoEscola('Carregando disciplinas...');
    const t = setTimeout(() => {
      api.disciplinasDaEscola(codigo)
        .then((d) => { if (vivo) { setOpcoes(d); setAvisoEscola('Esta escola ainda não tem disciplinas cadastradas.'); } })
        .catch((e) => { if (vivo) setAvisoEscola(e instanceof Error ? e.message : 'Não foi possível carregar as disciplinas.'); });
    }, 400);
    return () => { vivo = false; clearTimeout(t); };
  }, [form.codigoEscola, form.tipo]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    if (!form.nome.trim() || !form.email.trim() || form.senha.length < 6) {
      setErro('Preencha nome, e-mail e use uma senha com pelo menos 6 caracteres.');
      return;
    }
    const payload: Record<string, unknown> = { nome: form.nome.trim(), email: form.email.trim(), senha: form.senha, tipo: form.tipo };
    if (!diretor) {
      const codigo = form.codigoEscola.trim();
      if (codigo.length !== TAMANHO_CODIGO) { setErro(`Informe o código de ${TAMANHO_CODIGO} caracteres da escola, fornecido pelo diretor.`); return; }
      payload.codigoEscola = codigo;
      if (form.tipo === 'PROFESSOR') {
        if (!disciplinas.length) { setErro('Selecione ao menos uma disciplina.'); return; }
        payload.disciplinas = disciplinas;
      }
    }
    setLoading(true);
    try {
      await api.cadastro(payload);
      if (diretor) {
        // Diretor segue direto para o cadastro da escola.
        const d = await api.login(form.email.trim(), form.senha);
        setSession(d.token, d.usuario);
        nav('/escola/nova');
      } else nav('/login');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-brand">
        <img src="/assets/logo-horizontal-branco.png" alt="CorrigeAI" />
        <div className="auth-brand-content">
          <span className="eyebrow">COMECE PELO CORRIGEAI</span>
          <h1>Uma rotina escolar mais organizada.</h1>
          <p>Crie sua conta para acessar a plataforma e conhecer a operação de avaliações, turmas e resultados.</p>
        </div>
        <div className="auth-note">Os dados da conta são tratados pelo backend do CorrigeAI.</div>
      </section>
      <section className="auth-card-wrap">
        <div className="auth-card">
          <img src="/assets/logo-horizontal.png" alt="CorrigeAI" />
          <h2>Criar conta</h2>
          <p>Cadastre um usuário para acessar a plataforma.</p>
          {erro && <div className="error-box">{erro}</div>}
          <form className="auth-form" onSubmit={submit}>
            <div className="field"><label>Nome completo</label><input value={form.nome} onChange={(e) => set('nome', e.target.value)} /></div>
            <div className="field"><label>E-mail</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
            <div className="field"><label>Senha</label><input type="password" value={form.senha} onChange={(e) => set('senha', e.target.value)} /></div>
            <div className="field"><label>Perfil</label>
              <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
                <option value="PROFESSOR">Professor</option>
                <option value="COORDENADOR">Coordenador</option>
                <option value="DIRETOR">Diretor</option>
              </select>
            </div>
            {diretor ? (
              <p className="muted" style={{ fontSize: 13 }}>Depois de criar a conta, você cadastra a sua escola e recebe o código para repassar à equipe.</p>
            ) : (
              <div className="field"><label>Código da escola</label><input value={form.codigoEscola} maxLength={TAMANHO_CODIGO} autoComplete="off" spellCheck={false} style={{ fontFamily: 'monospace' }} onChange={(e) => set('codigoEscola', e.target.value.trim())} placeholder="Código de 11 caracteres gerado no cadastro da escola" /></div>
            )}
            {form.tipo === 'PROFESSOR' && <div className="field"><label>Disciplinas que leciona (uma ou mais)</label><DisciplinasChecks opcoes={opcoes} vazio={avisoEscola} value={disciplinas} onChange={setDisciplinas} /></div>}
            <button className="btn btn-primary auth-submit" disabled={loading}>{loading ? 'Criando...' : 'Criar conta'}</button>
          </form>
          <div className="auth-bottom"><span>Já possui uma conta?</span><Link to="/login">Entrar</Link></div>
          <div className="auth-bottom"><Link to="/">Voltar para o site</Link><span>CorrigeAI</span></div>
        </div>
      </section>
    </div>
  );
}
