import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardCheck, FileText, LayoutDashboard, LogOut, Menu, Settings, Users, BarChart3, School, UserRound, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { rotasPorPerfil, type Role } from '../services/permissoes';
import './AppShell.css';

type User = { nome?: string; tipo?: string; escola?: { nome?: string } };

const items = [
  { to:'/dashboard', label:'Dashboard', icon:LayoutDashboard },
  { to:'/turmas', label:'Turmas', icon:Users },
  { to:'/alunos', label:'Alunos', icon:UserRound },
  { to:'/provas', label:'Provas', icon:BookOpen },
  { to:'/correcao', label:'Correção', icon:ClipboardCheck },
  { to:'/resultados', label:'Resultados', icon:FileText },
  { to:'/relatorios', label:'Relatórios', icon:BarChart3 },
  { to:'/gestao', label:'Gestão da escola', icon:School },
];

function roleLabel(tipo?: string) {
  if (tipo === 'DIRETOR') return 'Diretor';
  if (tipo === 'COORDENADOR') return 'Coordenador';
  return 'Professor';
}

export function AppShell({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [user, setUser] = useState<User>({ nome:'Usuário', tipo:'PROFESSOR' });
  useEffect(() => { try { const raw = localStorage.getItem('usuario'); if (raw) setUser(JSON.parse(raw)); } catch {} }, []);
  const canReports = user.tipo === 'COORDENADOR' || user.tipo === 'DIRETOR';
  const canManage = user.tipo === 'DIRETOR';
  const visible = items.filter((it) => (rotasPorPerfil[(user.tipo as Role) || 'PROFESSOR'] || []).includes(it.to));
  const initials = (user.nome || 'U').split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();
  function logout() { localStorage.removeItem('token'); localStorage.removeItem('usuario'); nav('/login'); }
  return <div className="shell">
    <aside className={`sidebar ${mobile ? 'open' : ''}`}>
      <div className="sidebar-head">
        <img src="/assets/logo-horizontal-branco.png" alt="CorrigeAI" className="sidebar-logo" />
        <button className="mobile-close" onClick={() => setMobile(false)}><X size={18}/></button>
      </div>
      <div className="school-mini">{user.escola?.nome || 'Ambiente escolar'}</div>
      <nav className="side-nav">
        {visible.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} onClick={() => setMobile(false)} className={({isActive}) => `side-link ${isActive ? 'active':''}`}><Icon size={17}/><span>{label}</span></NavLink>)}
      </nav>
      <div className="side-footer">
        <NavLink to="/perfil" className="side-link"><Settings size={17}/><span>Meu perfil</span></NavLink>
        <button className="side-link logout" onClick={logout}><LogOut size={17}/><span>Sair</span></button>
      </div>
    </aside>
    <div className="main-area">
      <header className="topbar">
        <button className="mobile-menu" onClick={() => setMobile(true)}><Menu size={20}/></button>
        <div className="topbar-spacer"/>
        <div className="top-user">
          <div className="top-user-text"><strong>{user.nome || 'Usuário'}</strong><span>{roleLabel(user.tipo)}</span></div>
          <div className="avatar">{initials}</div>
        </div>
      </header>
      <main>{children}</main>
    </div>
    {mobile && <button className="backdrop" aria-label="Fechar menu" onClick={() => setMobile(false)} />}
  </div>;
}
