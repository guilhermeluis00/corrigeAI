import { BASE_COMUM, type DisciplinaOpcao } from '../services/disciplinas';

type Props = { opcoes: DisciplinaOpcao[]; value: string[]; onChange: (v: string[]) => void; vazio?: string };

// Lista de checkboxes para marcar uma ou mais disciplinas (por nome), agrupadas por curso.
export function DisciplinasChecks({ opcoes, value, onChange, vazio = 'Nenhuma disciplina disponível.' }: Props) {
  const grupos = new Map<string, DisciplinaOpcao[]>();
  for (const d of opcoes) { const g = d.curso || BASE_COMUM; grupos.set(g, [...(grupos.get(g) || []), d]); }
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, maxHeight: 190, overflow: 'auto' }}>
      {!opcoes.length && <span className="muted">{vazio}</span>}
      {[...grupos].map(([grupo, ds]) => (
        <div key={grupo}>
          {grupos.size > 1 && <div className="muted" style={{ fontSize: 12, fontWeight: 800, padding: '6px 0 2px' }}>{grupo}</div>}
          {ds.map((d) => (
            <label key={d.nome} style={{ display: 'flex', gap: 8, padding: '4px 0', fontWeight: 400 }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={value.includes(d.nome)}
                onChange={(e) => onChange(e.target.checked ? [...value, d.nome] : value.filter((x) => x !== d.nome))} />{d.nome}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}
