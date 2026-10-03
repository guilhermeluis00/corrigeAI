import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Check, ClipboardCheck, FileText, ShieldCheck, Smartphone, Users } from 'lucide-react';
import './Landing.css';

export function Landing(){
 return <div className="landing">
  <header className="land-nav"><div className="land-inner">
    <img src="/assets/logo-horizontal.png" className="land-logo" alt="CorrigeAI"/>
    <nav><a href="#recursos">Recursos</a><a href="#como-funciona">Como funciona</a><a href="#seguranca">Segurança</a><a href="#planos">Planos</a></nav>
    <div className="land-actions"><Link to="/login" className="btn">Entrar</Link><Link to="/cadastro" className="btn btn-primary">Começar agora</Link></div>
  </div></header>
  <main>
    <section className="hero"><div className="land-inner hero-grid"><div>
      <span className="eyebrow">GESTÃO E AVALIAÇÃO ESCOLAR</span>
      <h1>Menos tempo corrigindo. Mais tempo ensinando.</h1>
      <p>O CorrigeAI reúne provas, turmas, alunos e resultados em um único ambiente. A correção por foto reduz o trabalho operacional e mantém o professor no controle.</p>
      <div className="hero-actions"><Link to="/cadastro" className="btn btn-primary btn-lg">Começar agora <ArrowRight size={17}/></Link><a href="#recursos" className="btn btn-lg">Conhecer recursos</a></div>
      <div className="hero-trust"><ShieldCheck size={16}/> Ambiente organizado para a rotina escolar.</div>
    </div><div className="hero-panel"><div className="panel-title">Visão geral da escola</div><div className="hero-kpi"><span>Alunos ativos</span><strong>482</strong></div><div className="hero-row"><span>Turmas</span><strong>16</strong></div><div className="hero-row"><span>Provas no período</span><strong>28</strong></div><div className="hero-row"><span>Correções concluídas</span><strong>94%</strong></div><div className="mini-bars"><i/><i/><i/><i/><i/><i/><i/></div></div></div></section>
    <section id="recursos" className="section"><div className="land-inner"><div className="section-head"><span className="eyebrow">RECURSOS</span><h2>Uma rotina escolar mais organizada</h2><p>Da criação da avaliação ao resultado, cada etapa fica registrada no mesmo sistema.</p></div><div className="feature-grid">
      <Feature n="01" icon={FileText} title="Provas e gabaritos" text="Crie avaliações, cadastre questões e mantenha o gabarito associado à prova."/>
      <Feature n="02" icon={ClipboardCheck} title="Correção por foto" text="Envie a folha de respostas pelo computador ou celular e acompanhe o processamento."/>
      <Feature n="03" icon={BarChart3} title="Resultados e relatórios" text="Consulte notas, acertos, médias e desempenho por aluno, turma e disciplina."/>
    </div></div></section>
    <section id="como-funciona" className="section alt"><div className="land-inner"><div className="section-head"><span className="eyebrow">COMO FUNCIONA</span><h2>Do preparo ao resultado em poucos passos</h2></div><div className="steps"><Step n="01" title="Prepare" text="Crie a prova, monte as questões e defina o gabarito."/><Step n="02" title="Corrija" text="Envie a foto da folha de respostas pelo computador ou celular."/><Step n="03" title="Analise" text="Revise respostas, acompanhe notas e use os relatórios da escola."/></div></div></section>
    <section id="seguranca" className="section"><div className="land-inner security"><div><span className="eyebrow">CONTROLE E SEGURANÇA</span><h2>Informação acadêmica organizada em um só lugar.</h2><p>Perfis de acesso, dados por escola e histórico de avaliações ajudam a manter a operação clara e controlada.</p></div><div className="security-list"><div><ShieldCheck size={20}/><div><strong>Perfis de acesso</strong><span>Professor, coordenador e diretor com permissões adequadas.</span></div></div><div><Users size={20}/><div><strong>Visão por turma</strong><span>Alunos, professores e avaliações relacionados à rotina da escola.</span></div></div><div><Smartphone size={20}/><div><strong>Uso no celular</strong><span>Correção por foto pensada para a rotina do professor.</span></div></div></div></div></section>
    <section id="planos" className="section alt"><div className="land-inner"><div className="section-head"><span className="eyebrow">PLANOS</span><h2>Uma plataforma que acompanha a escola</h2></div><div className="plans"><Plan name="Professor" price="Acesso individual" text="Para organizar avaliações e resultados na rotina docente."/><Plan featured name="Escola" price="Gestão completa" text="Para equipes escolares com turmas, alunos, relatórios e correção."/><Plan name="Rede" price="Sob consulta" text="Para organizações com múltiplas escolas e operação centralizada."/></div></div></section>
    <section className="cta"><div className="land-inner cta-inner"><div><span className="eyebrow">CORRIGEAI</span><h2>Organize a avaliação da sua escola.</h2><p>Conheça a plataforma e veja como o CorrigeAI pode entrar na rotina da sua equipe.</p></div><Link to="/cadastro" className="btn btn-primary btn-lg">Começar agora <ArrowRight size={17}/></Link></div></section>
  </main>
  <footer className="land-footer"><div className="land-inner"><div><img src="/assets/logo-horizontal.png" className="land-logo" alt="CorrigeAI"/><p>Gestão e correção escolar.</p></div><div className="footer-links"><a href="#recursos">Recursos</a><a href="#como-funciona">Como funciona</a><a href="#seguranca">Segurança</a><Link to="/login">Entrar</Link><Link to="/cadastro">Criar conta</Link></div></div></footer>
 </div>
}
function Feature({n,icon:Icon,title,text}:any){return <div className="feature"><span>{n}</span><Icon size={21}/><h3>{title}</h3><p>{text}</p></div>}
function Step({n,title,text}:any){return <div className="step"><span>{n}</span><h3>{title}</h3><p>{text}</p></div>}
function Plan({name,price,text,featured}:any){return <div className={`plan ${featured?'featured':''}`}><div className="plan-name">{name}</div><h3>{price}</h3><p>{text}</p><div className="plan-check"><Check size={15}/> Gestão e avaliação em um só ambiente.</div><Link to="/cadastro" className={`btn ${featured?'btn-primary':''}`}>Conhecer</Link></div>}
