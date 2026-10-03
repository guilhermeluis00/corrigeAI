import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { DataPage, Badge } from '../../components/DataPage';
import { FormModal, type Campo } from '../../components/FormModal';
import { api } from '../../services/api';
import { useApi } from '../../services/useApi';

export default function Alunos() {
  const [modal, setModal] = useState<'novo' | any | null>(null);
  const [rk, setRk] = useState(0);
  const turmas = useApi<any[]>(api.turmas);

  const campos: Campo[] = [
    { name: 'nome', label: 'Nome completo', required: true },
    { name: 'matricula', label: 'Matrícula', required: true },
    { name: 'email', label: 'E-mail', type: 'email' },
    { name: 'turmaId', label: 'Turma', type: 'select', required: true, options: (turmas.data || []).map((t) => ({ value: t.id, label: `${t.codigo} — ${t.nome}` })) },
  ];
  async function salvar(v: Record<string, any>) {
    const dados = { nome: v.nome, matricula: v.matricula, email: v.email || null, turmaId: Number(v.turmaId) };
    if (modal === 'novo') await api.criarAluno(dados); else await api.atualizarAluno(modal.id, dados);
    setRk((k) => k + 1);
  }
  async function excluir(a: any) {
    if (!confirm(`Excluir o aluno ${a.nome}?`)) return;
    try { await api.excluirAluno(a.id); setRk((k) => k + 1); } catch (e) { alert(e instanceof Error ? e.message : 'Erro ao excluir.'); }
  }

  return <>
    <DataPage<any>
      titulo="Alunos" subtitulo="Cadastro de alunos por turma (coordenadores e diretor)."
      loader={api.alunos} reloadKey={rk} busca={(a) => `${a.nome} ${a.matricula} ${a.turma?.nome || ''}`}
      acoes={<button className="btn btn-primary" onClick={() => setModal('novo')}><Plus size={16} /> Novo aluno</button>}
      resumo={(r) => [{ label: 'Alunos', value: r.length }, { label: 'Ativos', value: r.filter((a) => a.ativo !== false).length }]}
      colunas={[
        { titulo: 'Aluno', render: (a) => <Link to={`/alunos/${a.id}`}><strong>{a.nome}</strong></Link> },
        { titulo: 'Matrícula', render: (a) => a.matricula },
        { titulo: 'Turma', render: (a) => a.turma?.nome || '—' },
        { titulo: 'Status', render: (a) => <Badge tipo={a.ativo === false ? 'neutral' : 'success'}>{a.ativo === false ? 'Inativo' : 'Ativo'}</Badge> },
        { titulo: 'Ações', render: (a) => <div className="table-actions">
          <button className="icon-btn" title="Editar" onClick={() => setModal(a)}><Pencil size={15} /></button>
          <button className="icon-btn" title="Excluir" onClick={() => excluir(a)}><Trash2 size={15} /></button></div> },
      ]} />
    {modal && <FormModal key={modal === 'novo' ? 'novo' : modal.id} titulo={modal === 'novo' ? 'Novo aluno' : 'Editar aluno'} campos={campos}
      inicial={modal === 'novo' ? undefined : { ...modal, email: modal.email || '' }} onClose={() => setModal(null)} onSubmit={salvar} />}
  </>;
}
