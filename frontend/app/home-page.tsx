'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-5xl">IA</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">CorrigeAI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-2xl text-slate-600 mb-4">
            Correção Inteligente de Provas e Redações
          </p>
          <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
            Plataforma de correção automática com IA que fornece feedback detalhado e notas precisas para provas, redações e avaliações de forma rápida e confiável.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/login"
              className="btn-primary text-lg px-8 py-4 inline-block"
            >
              Fazer Login
            </Link>
            <Link
              href="/register"
              className="btn-secondary text-lg px-8 py-4 inline-block"
            >
              Criar Conta
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="card-hover">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Correção Rápida</h3>
              <p className="text-slate-600">
                Receba feedback em segundos com análise profunda usando IA avançada
              </p>
            </div>

            <div className="card-hover">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Análise Detalhada</h3>
              <p className="text-slate-600">
                Notas precisas, erros identificados e sugestões de melhoria
              </p>
            </div>

            <div className="card-hover">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">Para Professores</h3>
              <p className="text-slate-600">
                Gerencie turmas, acompanhe progresso e economize tempo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 gradient-text">
            Por que usar CorrigeAI?
          </h2>
          <p className="text-center text-slate-600 text-lg mb-16 max-w-2xl mx-auto">
            Transforme a forma como você avalia e aprende
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Feedback Personalizado</h3>
                <p className="text-slate-600">
                  Cada aluno recebe comentários específicos sobre seus erros e como melhorar
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                  <span className="text-2xl">⏱️</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Economize Tempo</h3>
                <p className="text-slate-600">
                  Professores podem focar no que realmente importa enquanto a IA faz a correção
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Acompanhamento</h3>
                <p className="text-slate-600">
                  Relatórios detalhados do desempenho dos alunos e evolução ao longo do tempo
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Precisão IA</h3>
                <p className="text-slate-600">
                  Algoritmos de aprendizado de máquina treinados para avaliar com consistência
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 gradient-text">
            Como Funciona
          </h2>
          <p className="text-center text-slate-600 text-lg mb-16 max-w-2xl mx-auto">
            3 passos simples para começar
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card text-center">
              <div className="inline-block bg-blue-100 text-blue-600 text-3xl font-bold w-16 h-16 rounded-full flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Crie uma Prova</h3>
              <p className="text-slate-600">
                Configure sua prova, adicione questões e defina data de entrega
              </p>
            </div>

            {/* Step 2 */}
            <div className="card text-center">
              <div className="inline-block bg-blue-100 text-blue-600 text-3xl font-bold w-16 h-16 rounded-full flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Alunos Respondem</h3>
              <p className="text-slate-600">
                Os alunos acessam e respondem as questões no prazo estabelecido
              </p>
            </div>

            {/* Step 3 */}
            <div className="card text-center">
              <div className="inline-block bg-blue-100 text-blue-600 text-3xl font-bold w-16 h-16 rounded-full flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">IA Corrige</h3>
              <p className="text-slate-600">
                Receba notas automáticas e feedback detalhado para cada resposta
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold gradient-text mb-2">10K+</div>
              <p className="text-slate-600">Provas Corrigidas</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold gradient-text mb-2">5K+</div>
              <p className="text-slate-600">Alunos Ativos</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold gradient-text mb-2">500+</div>
              <p className="text-slate-600">Professores</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold gradient-text mb-2">99%</div>
              <p className="text-slate-600">Satisfação</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Pronto para Começar?</h2>
          <p className="text-lg mb-8 opacity-90">
            Junte-se a milhares de professores e alunos que já usam CorrigeAI
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            Criar Conta Agora
          </Link>
        </div>
      </section>
    </div>
  );
}