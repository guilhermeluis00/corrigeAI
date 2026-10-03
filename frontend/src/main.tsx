import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import './styles.css';
import { Landing } from './pages/Landing';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Dashboard from './pages/Dashboard/Dashboard';
import Correcao from './pages/Correcao/Correcao';
import Resultados from './pages/Resultados/Resultados';
import Turmas from './pages/Turmas/Turmas';
import Alunos from './pages/Alunos/Alunos';
import AlunoDetalhe from './pages/Alunos/AlunoDetalhe';
import Provas from './pages/Provas/Provas';
import NovaProva from './pages/Provas/NovaProva';
import EditarProva from './pages/Provas/EditarProva';
import ProvaDetalhe from './pages/Provas/ProvaDetalhe';
import Relatorios from './pages/Relatorios/Relatorios';
import Gestao from './pages/Gestao/Gestao';
import Perfil from './pages/Perfil/Perfil';

function Private({ children }: {children: React.ReactNode}) { return <ProtectedRoute>{children}</ProtectedRoute>; }

function App(){
 return <Routes>
   <Route path="/" element={<Landing/>}/>
   <Route path="/login" element={<Login/>}/>
   <Route path="/cadastro" element={<Cadastro/>}/>
   <Route path="/dashboard" element={<Private><Dashboard/></Private>}/>
   <Route path="/correcao" element={<Private><Correcao/></Private>}/>
   <Route path="/correcao/:id" element={<Private><Correcao/></Private>}/>
   <Route path="/resultados" element={<Private><Resultados/></Private>}/>
   <Route path="/turmas" element={<Private><Turmas/></Private>}/>
   <Route path="/alunos" element={<Private><Alunos/></Private>}/>
   <Route path="/provas" element={<Private><Provas/></Private>}/>
   <Route path="/provas/nova" element={<Private><NovaProva/></Private>}/>
   <Route path="/provas/:id/editar" element={<Private><EditarProva/></Private>}/>
   <Route path="/provas/:id" element={<Private><ProvaDetalhe/></Private>}/>
   <Route path="/relatorios" element={<Private><Relatorios/></Private>}/>
   <Route path="/gestao" element={<Private><Gestao/></Private>}/>
   <Route path="/perfil" element={<Private><Perfil/></Private>}/>
   <Route path="/alunos/:id" element={<Private><AlunoDetalhe/></Private>}/>
   <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);
