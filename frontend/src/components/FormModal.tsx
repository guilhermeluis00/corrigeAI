import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import '../pages/Module.css';

export type Campo = {
  name: string; label: string; type?: 'text' | 'email' | 'password' | 'select' | 'checks';
  options?: { value: string | number; label: string }[]; required?: boolean; placeholder?: string; visivelSe?: (v: Record<string, any>) => boolean;
};
type Props = {
  titulo: string; subtitulo?: string; campos: Campo[]; inicial?: Record<string, any>; rotulo?: string;
  onClose: () => void; onSubmit: (v: Record<string, any>) => Promise<void>;
};

export function FormModal({ titulo, subtitulo, campos, inicial, rotulo = 'Salvar', onClose, onSubmit }: Props) {
  const [v, setV] = useState<Record<string, any>>(() => Object.fromEntries(campos.map((c) => [c.name, inicial?.[c.name] ?? (c.type === 'checks' ? [] : '')])));
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k: string, x: any) => setV((p) => ({ ...p, [k]: x }));

  async function submit(e: FormEvent) {
    e.preventDefault(); setErro('');
    const falta = campos.find((c) => (!c.visivelSe || c.visivelSe(v)) && c.required && c.type !== 'checks' && !String(v[c.name]).trim());
    if (falta) { setErro(`Preencha o campo "${falta.label}".`); return; }
    setLoading(true);
    try { await onSubmit(v); onClose(); }
    catch (err) { setErro(err instanceof Error ? err.message : 'Não foi possível salvar.'); setLoading(false); }
  }

  return (
    <div className="modal"><div className="modal-box">
      <div className="modal-head"><div><h3>{titulo}</h3>{subtitulo && <p className="card-subtitle">{subtitulo}</p>}</div><button type="button" className="icon-btn" onClick={onClose}><X size={16} /></button></div>
      {erro && <div className="error-box">{erro}</div>}
      <form onSubmit={submit}>
        {campos.filter((c) => !c.visivelSe || c.visivelSe(v)).map((c) => (
          <div className="field" key={c.name} style={{ marginBottom: 12 }}>
            <label>{c.label}{c.required ? ' *' : ''}</label>
            {c.type === 'select' ? (
              <select value={v[c.name]} onChange={(e) => set(c.name, e.target.value)}><option value="">Selecione</option>{c.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            ) : c.type === 'checks' ? (
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, maxHeight: 150, overflow: 'auto' }}>
                {!c.options?.length && <span className="muted">Nenhum professor cadastrado na escola ainda.</span>}
                {c.options?.map((o) => (
                  <label key={o.value} style={{ display: 'flex', gap: 8, padding: '4px 0', fontWeight: 400 }}>
                    <input type="checkbox" style={{ width: 'auto' }} checked={v[c.name].includes(o.value)}
                      onChange={(e) => set(c.name, e.target.checked ? [...v[c.name], o.value] : v[c.name].filter((x: any) => x !== o.value))} />{o.label}
                  </label>
                ))}
              </div>
            ) : (
              <input type={c.type || 'text'} value={v[c.name]} placeholder={c.placeholder} onChange={(e) => set(c.name, e.target.value)} />
            )}
          </div>
        ))}
        <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Salvando...' : rotulo}</button>
        </div>
      </form>
    </div></div>
  );
}
