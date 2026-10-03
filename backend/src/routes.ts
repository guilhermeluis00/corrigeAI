import { Router } from "express";
import {
  login,
  cadastro,
  me
} from "./controllers/authController.js";
import { dashboard } from "./controllers/dashboardController.js";
import {
  listarTurmas,
  buscarTurma,
  criarTurma,
  atualizarTurma,
  excluirTurma,
  vincularProfessor,
  listarProfessores,
  definirProfessores
} from "./controllers/turmaController.js";
import {
  listarAlunos,
  buscarAluno,
  criarAluno,
  atualizarAluno,
  excluirAluno
} from "./controllers/alunoController.js";
import {
  listarProvas,
  buscarProva,
  criarProva,
  atualizarProva,
  excluirProva
} from "./controllers/provaController.js";
import { listarResultados, buscarResultado } from "./controllers/resultadoController.js";
import { relatorios } from "./controllers/relatorioController.js";
import { listarDisciplinas, criarDisciplina, atualizarDisciplina, excluirDisciplina } from "./controllers/disciplinaController.js";
import {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  escolaAtual,
  atualizarEscola,
  criarEscola
} from "./controllers/gestaoController.js";
import { perfil, atualizarPerfil } from "./controllers/perfilController.js";
import { processarFoto, statusCorrecao } from "./controllers/correcaoController.js";
import { autenticar } from "./middleware/auth.js";
import { permitir } from "./middleware/authorize.js";
import { uploadImagem } from "./middleware/upload.js";
import { exigirEscola } from "./middleware/escola.js";

const router = Router();

router.post("/auth/login", login);
router.post("/auth/cadastro", cadastro);
router.get("/auth/me", autenticar, me);

router.get("/perfil", autenticar, perfil);
router.put("/perfil", autenticar, atualizarPerfil);
router.post("/escola", autenticar, permitir("DIRETOR"), criarEscola);

// Tudo abaixo exige usuário autenticado COM escola cadastrada.
router.use(autenticar, exigirEscola);

router.get("/professores", permitir("COORDENADOR", "DIRETOR"), listarProfessores);
router.put("/turmas/:id/professores", permitir("COORDENADOR", "DIRETOR"), definirProfessores);

router.get("/dashboard", autenticar, dashboard);

router.get("/turmas", autenticar, listarTurmas);
router.get("/turmas/:id", autenticar, buscarTurma);
router.post("/turmas", autenticar, permitir("COORDENADOR", "DIRETOR"), criarTurma);
router.put("/turmas/:id", autenticar, permitir("COORDENADOR", "DIRETOR"), atualizarTurma);
router.delete("/turmas/:id", autenticar, permitir("COORDENADOR", "DIRETOR"), excluirTurma);
router.post("/turmas/:id/professores", autenticar, permitir("COORDENADOR", "DIRETOR"), vincularProfessor);

router.get("/alunos", autenticar, listarAlunos);
router.get("/alunos/:id", autenticar, buscarAluno);
router.post("/alunos", autenticar, permitir("COORDENADOR", "DIRETOR"), criarAluno);
router.put("/alunos/:id", autenticar, permitir("COORDENADOR", "DIRETOR"), atualizarAluno);
router.delete("/alunos/:id", autenticar, permitir("COORDENADOR", "DIRETOR"), excluirAluno);

router.get("/disciplinas", autenticar, listarDisciplinas);
router.post("/disciplinas", autenticar, permitir("COORDENADOR", "DIRETOR"), criarDisciplina);
router.put("/disciplinas/:id", autenticar, permitir("COORDENADOR", "DIRETOR"), atualizarDisciplina);
router.delete("/disciplinas/:id", autenticar, permitir("DIRETOR"), excluirDisciplina);

router.get("/provas", autenticar, listarProvas);
router.get("/provas/:id", autenticar, buscarProva);
router.post("/provas", autenticar, criarProva);
router.put("/provas/:id", autenticar, atualizarProva);
router.delete("/provas/:id", autenticar, excluirProva);

router.get("/resultados", autenticar, listarResultados);
router.get("/resultados/:id", autenticar, buscarResultado);

router.get("/relatorios", autenticar, permitir("COORDENADOR", "DIRETOR"), relatorios);

router.get("/gestao/usuarios", autenticar, permitir("DIRETOR"), listarUsuarios);
router.post("/gestao/usuarios", autenticar, permitir("DIRETOR"), criarUsuario);
router.put("/gestao/usuarios/:id", autenticar, permitir("DIRETOR"), atualizarUsuario);
router.get("/gestao/escola", autenticar, permitir("DIRETOR"), escolaAtual);
router.put("/gestao/escola", autenticar, permitir("DIRETOR"), atualizarEscola);

router.post("/correcoes/foto", autenticar, uploadImagem.single("imagem"), processarFoto);
router.get("/correcoes/:id", autenticar, statusCorrecao);

export default router;
