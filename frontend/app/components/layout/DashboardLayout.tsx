'use client';

import { useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar title={title} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-content">
        <div className="page-wrap animate-in">
          {children}
        </div>
      </div>
    </>
  );
}
