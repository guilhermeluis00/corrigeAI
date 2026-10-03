import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { DataPage, Badge } from '../../components/DataPage';
import { FormModal, type Campo } from '../../components/FormModal';
import { api } from '../../services/api';
import { useApi } from '../../services/useApi';

const turnos: Record<string, string> = { MANHA: 'Manhã', TARDE: 'Tarde', NOITE: 'Noite' };

export default function Turmas() {
  const [modal, setModal] = useState<'novo' | any | null>(null);
  const [rk, setRk] = useState(0);
  const prof = useApi<any[]>(api.professores);

  const campos: Campo[] = [
    { name: 'codigo', label: 'Código', required: true, placeholder: 'Ex.: 8A' },
    { name: 'nome', label: 'Nome', required: true, placeholder: 'Ex.: 8º Ano A' },
    { name: 'serie', label: 'Série', placeholder: 'Ex.: 8º Ano' },
    { name: 'turno', label: 'Turno', type: 'select', options: Object.entries(turnos).map(([value, label]) => ({ value, label })) },
    { name: 'professorIds', label: 'Professores que dão aula nesta turma', type: 'checks', options: (prof.data || []).map((p) => ({ value: p.id, label: p.nome })) },
  ];

  async function salvar(v: Record<string, any>) {
    const dados = { codigo: v.codigo, nome: v.nome, serie: v.serie, turno: v.turno || null };
    const novo = modal === 'novo';
    const r = novo ? await api.criarTurma(dados) : await api.atualizarTurma(modal.id, dados);
    await api.definirProfessores(novo ? r.turma.id : modal.id, v.professorIds.map(Number));
    setRk((k) => k + 1);
  }
  async function excluir(t: any) {
    if (!confirm(`Excluir a turma ${t.nome}? Os alunos dela também serão removidos.`)) return;
    try { await api.excluirTurma(t.id); setRk((k) => k + 1); } catch (e) { alert(e instanceof Error ? e.message : 'Erro ao excluir.'); }
  }

  return <>
    <DataPage<any>
      titulo="Turmas" subtitulo="Cadastre turmas e defina quais professores dão aula e têm acesso a cada uma."
      loader={api.turmas} reloadKey={rk} busca={(t) => `${t.codigo} ${t.nome}`}
      acoes={<button className="btn btn-primary" onClick={() => setModal('novo')}><Plus size={16} /> Nova turma</button>}
      resumo={(r) => [{ label: 'Turmas', value: r.length }, { label: 'Alunos', value: r.reduce((s, t) => s + (t._count?.alunos || 0), 0) }, { label: 'Provas', value: r.reduce((s, t) => s + (t._count?.provas || 0), 0) }]}
      colunas={[
        { titulo: 'Código', render: (t) => <strong>{t.codigo}</strong> },
        { titulo: 'Turma', render: (t) => t.nome },
        { titulo: 'Turno', render: (t) => <Badge>{turnos[t.turno] || '—'}</Badge> },
        { titulo: 'Alunos', render: (t) => t._count?.alunos ?? 0 },
        { titulo: 'Professores', render: (t) => t.professores?.length ? t.professores.map((x: any) => x.professor?.nome).join(', ') : <span className="muted">Nenhum</span> },
        { titulo: 'Ações', render: (t) => <div className="table-actions">
          <button className="icon-btn" title="Editar" onClick={() => setModal(t)}><Pencil size={15} /></button>
          <button className="icon-btn" title="Excluir" onClick={() => excluir(t)}><Trash2 size={15} /></button></div> },
      ]} />
    {modal && <FormModal key={modal === 'novo' ? 'novo' : modal.id} titulo={modal === 'novo' ? 'Nova turma' : 'Editar turma'} subtitulo="Os professores marcados terão acesso a esta turma." campos={campos}
      inicial={modal === 'novo' ? undefined : { ...modal, professorIds: (modal.professores || []).map((x: any) => x.professorId) }}
      onClose={() => setModal(null)} onSubmit={salvar} />}
  </>;
}
