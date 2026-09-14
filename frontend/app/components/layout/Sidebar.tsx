'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuSections = [
  {
    title: null,
    items: [
      { label: 'Dashboard', icon: '📊', href: '/dashboard' },
    ],
  },
  {
    title: 'Acadêmico',
    items: [
      { label: 'Turmas',      icon: '🏫', href: '/turmas' },
      { label: 'Alunos',      icon: '👥', href: '/alunos' },
    ],
  },
  {
    title: 'Avaliações',
    items: [
      { label: 'Provas',      icon: '📋', href: '/provas' },
      { label: 'Correção',    icon: '📷', href: '/correcao' },
      { label: 'Resultados',  icon: '📈', href: '/resultados' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { label: 'Relatórios',  icon: '📑', href: '/relatorios' },
      { label: 'Gestão',      icon: '⚙️', href: '/gestao' },
    ],
  },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 85 }} onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">AI</div>
          <div className="sidebar-logo-text">Corrige<span>AI</span></div>
        </div>

        {menuSections.map((section, i) => (
          <div key={i}>
            {section.title && (
              <div className="sidebar-section">
                <div className="sidebar-section-title">{section.title}</div>
              </div>
            )}
            <nav className="sidebar-nav">
              {section.items.map(item => (
                <Link key={item.href} href={item.href}
                  className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                  onClick={onClose}>
                  <span className="sidebar-link-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </aside>
    </>
  );
}
