'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({ nome: '', email: '', password: '', confirm: '', tipo: 'professor' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('As senhas não correspondem'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: form.nome, email: form.email, password: form.password, tipo: form.tipo }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Erro ao criar conta'); return; }
      router.push('/login');
    } catch { setError('Erro de conexão com o servidor'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <div className="navbar-logo-icon">AI</div>
            <div className="navbar-logo-text">Corrige<span>AI</span></div>
          </Link>
        </div>
      </nav>

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">AI</div>
            <h1>Crie sua conta</h1>
            <p>Comece a corrigir provas com IA</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input type="text" className="form-input" placeholder="Seu nome" value={form.nome} onChange={set('nome')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="seu@email.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de conta</label>
              <select className="form-input" value={form.tipo} onChange={set('tipo')}>
                <option value="professor">Professor</option>
                <option value="aluno">Aluno</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={set('password')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar senha</label>
              <input type="password" className="form-input" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Conta'}
            </button>
          </form>

          <div className="auth-divider">já tem conta?</div>

          <Link href="/login" className="btn btn-secondary btn-full">Fazer Login</Link>
        </div>
      </div>
    </>
  );
}
