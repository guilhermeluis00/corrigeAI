import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { AppShell } from './AppShell';
import { api, getUsuario } from '../services/api';
import '../pages/Module.css';

const LETRAS = ['A', 'B', 'C', 'D', 'E'] as const;
const vazia = () => ({ enunciado: '', alternativaA: '', alternativaB: '', alternativaC: '', alternativaD: '', alternativaE: '', resposta: '', valor: '1' });

export default function ProvaForm({ id }: { id?: string }) {
  const nav = useNavigate();
  const eu = getUsuario<any>();
  const ehProfessor = eu?.tipo === 'PROFESSOR';
  const [f, setF] = useState({ titulo: '', descricao: '', dataAplicacao: '', professorId: ehProfessor ? String(eu.id) : '', disciplinaId: '', turmaId: '' });
  const [qs, setQs] = useState<any[]>([vazia()]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [gab, setGab] = useState('');
  const [erro, setErro] = useState(''); const [salvando, setSalvando] = useState(false); const [carregando, setCarregando] = useState(true);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      try {
        const [t, d] = await Promise.all([api.turmas(), api.disciplinas()]);
        setTurmas(t); setDisciplinas(d);
        let profs: any[] = [];
        if (ehProfessor) { const p = await api.perfil(); profs = [{ id: eu.id, nome: p.usuario.nome, disciplina: p.usuario.disciplina }]; }
        else profs = await api.professores();
        setProfessores(profs);
        if (id) {
          const p = await api.prova(id);
          setF({ titulo: p.titulo, descricao: p.descricao || '', dataAplicacao: p.dataAplicacao ? p.dataAplicacao.slice(0, 10) : '', professorId: p.professorId ? String(p.professorId) : '', disciplinaId: p.disciplinaId ? String(p.disciplinaId) : '', turmaId: p.turmaId ? String(p.turmaId) : '' });
          setQs(p.questoes.length ? p.questoes.map((q: any) => ({ ...vazia(), ...Object.fromEntries(Object.entries(q).map(([k, v]) => [k, v ?? ''])), valor: String(q.valor) })) : [vazia()]);
        }
      } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao carregar dados.'); }
      finally { setCarregando(false); }
    })();
  }, [id]);

  const prof = professores.find((p) => String(p.id) === f.professorId);
  // Ao escolher o professor, a disciplina dele é preenchida e só aparecem as turmas em que ele dá aula.
  function escolherProfessor(v: string) {
    const p = professores.find((x) => String(x.id) === v);
    const d = p?.disciplina ? disciplinas.find((x) => x.nome === p.disciplina.nome) : null;
    setF((s) => ({ ...s, professorId: v, disciplinaId: d ? String(d.id) : s.disciplinaId, turmaId: '' }));
  }
  const turmasOpcoes = useMemo(() => (!f.professorId || ehProfessor ? turmas : turmas.filter((t) => (t.professores || []).some((x: any) => String(x.professorId) === f.professorId))), [turmas, f.professorId]);
  const setQ = (i: number, k: string, v: string) => setQs((a) => a.map((q, j) => (j === i ? { ...q, [k]: v } : q)));

  // Gera as questões só com o gabarito (ex.: provas no formato ENEM, cujo caderno fica à parte).
  function gerarDoGabarito() {
    const letras = gab.toUpperCase().match(/[A-E]/g) || [];
    if (!letras.length) { setErro('Cole o gabarito com letras de A a E (ex.: C A D B E ...).'); return; }
    if (letras.length > 90) { setErro('A folha de respostas comporta até 90 questões.'); return; }
    if (qs.some((q) => q.enunciado.trim() || q.resposta) && !confirm('Isso substitui as questões atuais. Continuar?')) return;
    setErro(''); setQs(letras.map((l, i) => ({ ...vazia(), enunciado: `Questão ${i + 1}`, resposta: l })));
  }

  async function salvar(status: 'RASCUNHO' | 'PUBLICADA') {
    setErro('');
    if (!f.titulo.trim()) { setErro('Informe o título da prova.'); return; }
    if (!f.professorId) { setErro('Informe o professor que elaborou a prova.'); return; }
    if (!f.turmaId) { setErro('Selecione a turma.'); return; }
    if (status === 'PUBLICADA') {
      const i = qs.findIndex((q) => !q.enunciado.trim() || !q.resposta);
      if (i >= 0) { setErro(`Preencha o enunciado e o gabarito da questão ${i + 1}.`); return; }
    }
    const payload = {
      titulo: f.titulo, descricao: f.descricao, dataAplicacao: f.dataAplicacao || null, status,
      professorId: Number(f.professorId), disciplinaId: f.disciplinaId ? Number(f.disciplinaId) : null, turmaId: Number(f.turmaId),
      questoes: qs.map((q, i) => ({ ...q, numero: i + 1, valor: Number(String(q.valor).replace(',', '.')) || 1 })),
    };
    setSalvando(true);
    try { const r = id ? await api.atualizarProva(id, payload) : await api.criarProva(payload); nav(`/provas/${r.prova.id}`); }
    catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível salvar a prova.'); setSalvando(false); }
  }

  const sel = (k: string, label: string, opts: { value: any; label: string }[], extra?: { disabled?: boolean; onChange?: (v: string) => void; vazio?: string }) => (
    <div className="field"><label>{label}</label>
      <select value={(f as any)[k]} disabled={extra?.disabled} onChange={(e) => (extra?.onChange ? extra.onChange(e.target.value) : set(k, e.target.value))}>
        <option value="">{extra?.vazio || 'Selecione'}</option>{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>);

  return (
    <AppShell><div className="container page">
      <div className="page-head"><div><h1 className="page-title">{id ? 'Editar prova' : 'Nova prova'}</h1><p className="page-subtitle">Monte a avaliação e defina o gabarito.</p></div>
        <div className="actions"><button className="btn" disabled={salvando || carregando} onClick={() => salvar('RASCUNHO')}>Salvar rascunho</button>
          <button className="btn btn-primary" disabled={salvando || carregando} onClick={() => salvar('PUBLICADA')}>Publicar</button></div></div>
      {erro && <div className="error-box">{erro}</div>}
      <section className="card card-pad"><h3 className="card-title">Informações da prova</h3><p className="card-subtitle">Defina o professor, a turma, a disciplina e a data.</p><div style={{ height: 16 }} />
        <div className="grid grid-4" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field"><label>Título *</label><input value={f.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ex.: Função afim" /></div>
          {sel('professorId', 'Professor que elaborou *', professores.map((p) => ({ value: p.id, label: p.disciplina?.nome ? `${p.nome} — ${p.disciplina.nome}` : p.nome })), { disabled: ehProfessor, onChange: escolherProfessor })}
          {sel('turmaId', 'Turma *', turmasOpcoes.map((t) => ({ value: t.id, label: `${t.codigo} — ${t.nome}` })), { vazio: turmasOpcoes.length ? 'Selecione' : 'Nenhuma turma disponível' })}
          {sel('disciplinaId', 'Disciplina', disciplinas.map((d) => ({ value: d.id, label: d.nome })), { disabled: !!prof?.disciplina })}
          <div className="field"><label>Data de aplicação</label><input type="date" value={f.dataAplicacao} onChange={(e) => set('dataAplicacao', e.target.value)} /></div>
          <div className="field"><label>Descrição</label><input value={f.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Orientações ou observações" /></div>
        </div>
        {f.professorId && !ehProfessor && turmasOpcoes.length === 0 && <p className="muted" style={{ marginTop: 10 }}>Este professor ainda não está vinculado a nenhuma turma. Vincule em Turmas.</p>}
      </section>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, marginTop: 18, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 18 }}>{qs.map((q, i) => (
          <section className="card card-pad" key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><div><h3 className="card-title">Questão {i + 1}</h3><p className="card-subtitle">Enunciado, alternativas e gabarito.</p></div>
              <button type="button" className="icon-btn" title="Remover" disabled={qs.length === 1} onClick={() => setQs((a) => a.filter((_, j) => j !== i))}><Trash2 size={15} /></button></div>
            <div className="field" style={{ margin: '12px 0' }}><label>Enunciado</label><textarea rows={3} value={q.enunciado} onChange={(e) => setQ(i, 'enunciado', e.target.value)} /></div>
            <div className="grid grid-4" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>{LETRAS.map((l) => <div className="field" key={l}><label>Alternativa {l}</label><input value={q[`alternativa${l}`]} onChange={(e) => setQ(i, `alternativa${l}`, e.target.value)} /></div>)}
              <div className="field"><label>Gabarito</label><select value={q.resposta} onChange={(e) => setQ(i, 'resposta', e.target.value)}><option value="">Selecione</option>{LETRAS.map((l) => <option key={l}>{l}</option>)}</select></div>
              <div className="field"><label>Valor</label><input value={q.valor} onChange={(e) => setQ(i, 'valor', e.target.value)} /></div></div>
          </section>))}</div>
        <section className="card card-pad"><h3 className="card-title">Estrutura da prova</h3><p className="card-subtitle">{qs.length} questão(ões) adicionada(s). Total: {qs.reduce((s, q) => s + (Number(String(q.valor).replace(',', '.')) || 0), 0)} ponto(s).</p><div style={{ height: 12 }} />
          <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setQs((a) => [...a, vazia()])}><Plus size={15} /> Adicionar questão</button>
          <div className="field" style={{ marginTop: 14 }}><label>Colar gabarito (gera as questões)</label>
            <textarea rows={3} value={gab} onChange={(e) => setGab(e.target.value)} placeholder="Ex.: C A D B E A C B D E" />
            <button type="button" className="btn" style={{ marginTop: 8 }} onClick={gerarDoGabarito}>Gerar questões</button></div>
          <p className="muted" style={{ marginTop: 12 }}>O gabarito fica associado à prova e é usado na correção.</p></section>
      </div>
    </div></AppShell>
  );
}
