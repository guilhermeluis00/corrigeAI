import { DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Check, Upload } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { Badge } from '../../components/DataPage';
import { api } from '../../services/api';
import { useApi } from '../../services/useApi';
import '../Module.css';
import './Correcao.css';

const PASSOS = ['Receber imagem', 'Detectar marcações', 'Comparar com gabarito', 'Calcular resultado'];
const nota = (n: unknown) => Number(n).toFixed(1).replace('.', ',');

export default function Correcao() {
  const provas = useApi<any[]>(api.provas);
  const alunos = useApi<any[]>(api.alunos);
  const [provaId, setProvaId] = useState(''); const [alunoId, setAlunoId] = useState('');
  const [file, setFile] = useState<File | null>(null); const [preview, setPreview] = useState('');
  const [enviando, setEnviando] = useState(false); const [erro, setErro] = useState(''); const [res, setRes] = useState<any>(null);
  const [over, setOver] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null); const inputCam = useRef<HTMLInputElement>(null);

  const publicadas = useMemo(() => (provas.data || []).filter((p) => p.status === 'PUBLICADA' && (p._count?.questoes ?? 0) > 0), [provas.data]);
  const prova = publicadas.find((p) => String(p.id) === provaId);
  const alunosDaTurma = useMemo(() => (alunos.data || []).filter((a) => a.ativo !== false && prova && a.turmaId === prova.turmaId), [alunos.data, prova]);
  useEffect(() => { setAlunoId(''); }, [provaId]);
  useEffect(() => { if (!file) { setPreview(''); return; } const u = URL.createObjectURL(file); setPreview(u); return () => URL.revokeObjectURL(u); }, [file]);

  function escolher(f?: File | null) { if (f && f.type.startsWith('image/')) { setFile(f); setRes(null); setErro(''); } else if (f) setErro('Envie uma imagem (JPG ou PNG).'); }
  function soltar(e: DragEvent) { e.preventDefault(); setOver(false); escolher(e.dataTransfer.files?.[0]); }
  async function corrigir() {
    setErro('');
    if (!provaId || !alunoId || !file) { setErro('Escolha a prova, o aluno e envie a foto da folha.'); return; }
    setEnviando(true);
    try { const r = await api.uploadCorrecao(file, provaId, alunoId); setRes(r); }
    catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível corrigir a folha.'); }
    finally { setEnviando(false); }
  }
  function reiniciar() { setFile(null); setRes(null); setErro(''); setAlunoId(''); }

  const passo = res ? 4 : enviando ? 2 : file ? 1 : 0;
  const det = useMemo(() => new Map<number, any>((res?.deteccao?.questoes || []).map((q: any) => [q.numero, q])), [res]);
  const r = res?.resultado;

  return (
    <AppShell><div className="container page">
      <div className="page-head"><div><h1 className="page-title">Correção por foto</h1><p className="page-subtitle">Envie a folha de respostas preenchida e veja o resultado.</p></div></div>
      <div className="cor-grid">
        <section className="card section-card">
          <div className="section-card-head"><div><h3>Folha de respostas</h3><p>Escolha a prova e o aluno antes do envio.</p></div></div>
          <div className="cor-form">
            {erro && <div className="error-box">{erro}</div>}
            {!provas.loading && publicadas.length === 0 && <div className="card">Nenhuma prova publicada. Publique uma prova (com gabarito) em Provas para poder corrigir.</div>}
            <div className="cor-two">
              <div className="field"><label>Prova</label><select value={provaId} onChange={(e) => setProvaId(e.target.value)}><option value="">Selecione</option>{publicadas.map((p) => <option key={p.id} value={p.id}>{p.titulo}{p.turma ? ` — ${p.turma.nome}` : ''}</option>)}</select></div>
              <div className="field"><label>Aluno</label><select value={alunoId} disabled={!prova} onChange={(e) => setAlunoId(e.target.value)}><option value="">{prova ? (alunosDaTurma.length ? 'Selecione' : 'Nenhum aluno na turma') : 'Escolha a prova primeiro'}</option>{alunosDaTurma.map((a) => <option key={a.id} value={a.id}>{a.nome} ({a.matricula})</option>)}</select></div>
            </div>
            {preview ? (
              <div className="cor-prev"><img src={preview} alt="Folha enviada" /></div>
            ) : (
              <div className={`cor-drop${over ? ' over' : ''}`} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={soltar}>
                <Camera size={34} /><h4>Envie a foto da folha</h4><p>Arraste uma imagem ou selecione um arquivo. Os 4 quadrados pretos dos cantos devem aparecer.</p>
                <div className="cor-btns"><button type="button" className="btn btn-primary" onClick={() => inputFile.current?.click()}><Upload size={15} /> Selecionar imagem</button>
                  <button type="button" className="btn" onClick={() => inputCam.current?.click()}><Camera size={15} /> Usar câmera</button></div>
              </div>)}
            <input ref={inputFile} type="file" accept="image/*" hidden onChange={(e) => { escolher(e.target.files?.[0]); e.target.value = ''; }} />
            <input ref={inputCam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { escolher(e.target.files?.[0]); e.target.value = ''; }} />
            <div className="cor-btns" style={{ justifyContent: 'flex-end' }}>
              {file && <button type="button" className="btn" onClick={reiniciar} disabled={enviando}>Trocar imagem</button>}
              <button type="button" className="btn btn-primary" disabled={enviando || !file || !provaId || !alunoId} onClick={corrigir}>{enviando ? 'Corrigindo...' : 'Corrigir folha'}</button>
            </div>
          </div>
        </section>
        <div style={{ display: 'grid', gap: 18 }}>
          <section className="card section-card"><div className="section-card-head"><div><h3>Etapas da correção</h3><p>Leitura por visão computacional e comparação com o gabarito.</p></div></div>
            {PASSOS.map((t, i) => <div className="cor-step" key={t}><div style={{ display: 'flex', alignItems: 'center' }}><span className={`cor-dot ${i < passo ? 'ok' : i === passo ? 'on' : ''}`}>{i < passo ? <Check size={13} /> : i + 1}</span><strong>{t}</strong></div><span className="muted">{i < passo ? 'Concluído' : i === passo && (enviando || file) ? 'Em andamento' : 'Aguardando'}</span></div>)}</section>
          {r && (
            <section className="card section-card"><div className="cor-res">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div className="muted">{r.aluno?.nome} · {r.prova?.titulo}</div><div className="cor-nota">{nota(r.nota)}</div></div>
                <div style={{ textAlign: 'right' }}><Badge tipo="success">{r.acertos} acertos</Badge> <Badge tipo={r.erros ? 'danger' : 'neutral'}>{r.erros} erros</Badge></div></div>
              <div className="table-wrap"><table><thead><tr><th>Q</th><th>Marcada</th><th>Gabarito</th><th>Resultado</th></tr></thead><tbody>
                {(r.respostas || []).map((x: any) => { const d = det.get(x.questao?.numero); return (
                  <tr key={x.id}><td>{x.questao?.numero}</td><td><strong>{x.respostaAluno || '—'}</strong></td><td>{x.questao?.resposta}</td>
                    <td>{x.correta ? <Badge tipo="success">Correta</Badge> : d?.status === 'multipla' ? <Badge tipo="warning">Marcação dupla</Badge> : !x.respostaAluno ? <Badge tipo="warning">Em branco</Badge> : <Badge tipo="danger">Incorreta</Badge>}</td></tr>); })}
              </tbody></table></div>
              <button className="btn btn-primary" onClick={reiniciar}>Corrigir outra folha</button>
            </div></section>)}
        </div>
      </div>
    </div></AppShell>
  );
}
