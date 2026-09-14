'use client';

import Link from 'next/link';

export default function Topbar({ title, onToggle }: { title: string; onToggle: () => void }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-toggle" onClick={onToggle}>☰</button>
        <div className="topbar-breadcrumb">
          <strong>{title}</strong>
        </div>
      </div>
      <div className="topbar-right">
        <Link href="/perfil" className="topbar-avatar" title="Meu perfil">G</Link>
      </div>
    </header>
  );
}
