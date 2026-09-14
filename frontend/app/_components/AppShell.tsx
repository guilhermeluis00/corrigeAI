'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const groups = [
  {label:'Visão geral', items:[['Dashboard','/dashboard']]},
  {label:'Acadêmico', items:[['Turmas','/turmas'],['Alunos','/alunos']]},
  {label:'Avaliações', items:[['Provas','/provas'],['Correção','/correcao'],['Resultados','/resultados']]},
  {label:'Gestão', items:[['Relatórios','/relatorios'],['Gestão da escola','/gestao'],['Meu perfil','/perfil']]},
]
export default function AppShell({children}:{children:React.ReactNode}){
 const path=usePathname()
 return <div className="app-shell"><div className="app-layout">
   <aside className="sidebar"><Link href="/dashboard" className="brand"><div className="brand-mark">c</div><div className="brand-copy"><strong>CorrigeAI</strong><span>Gestão e correção escolar</span></div></Link>
   <nav className="side-nav">{groups.map(g=><div key={g.label}><div className="side-label">{g.label}</div>{g.items.map(([label,href])=><Link key={href} href={href} className={'side-link '+(path===href?'active':'')}>{label}</Link>)}</div>)}</nav>
   </aside>
   <div className="main-col"><header className="topbar"><div className="topbar-title">CorrigeAI</div><div className="topbar-right"><button className="btn btn-secondary btn-ghost">Ajuda</button><div className="avatar">GS</div></div></header><main className="content">{children}</main></div>
 </div></div>
}
