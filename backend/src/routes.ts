import { Router } from "express";
import { authMiddleware, allow, comparePassword, hashPassword, signToken } from "./auth.js";
import { prisma } from "./prisma.js";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

export const router = Router();
const uploadDir = process.env.UPLOAD_DIR || "uploads";
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir, limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "");
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.ativo || !(await comparePassword(senha, usuario.senha))) return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
    const user = { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo as any, escolaId: usuario.escolaId };
    return res.json({ token: await signToken(user), usuario: user });
  } catch (e) { console.error(e); res.status(500).json({ mensagem: "Erro interno no login." }); }
});

router.get("/auth/me", authMiddleware, async (req, res) => res.json({ usuario: req.user }));
router.post("/auth/cadastro", async (req, res) => {
  const { nome, email, senha, tipo } = req.body;
  if (!nome || !email || !senha || !tipo) return res.status(400).json({ mensagem: "Nome, e-mail, senha e tipo são obrigatórios." });
  if (!(["PROFESSOR", "COORDENADOR", "DIRETOR"] as string[]).includes(tipo)) return res.status(400).json({ mensagem: "Tipo inválido." });
  const exists = await prisma.usuario.findUnique({ where: { email: String(email).trim().toLowerCase() } });
  if (exists) return res.status(409).json({ mensagem: "E-mail já cadastrado." });
  const usuario = await prisma.usuario.create({ data: { nome: String(nome).trim(), email: String(email).trim().toLowerCase(), senha: await hashPassword(String(senha)), tipo } });
  res.status(201).json({ usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo, escolaId: usuario.escolaId } });
});

router.get("/turmas", authMiddleware, async (req, res) => {
  const escolaId = req.user?.escolaId ?? Number(req.query.escolaId);
  if (!escolaId) return res.status(400).json({ mensagem: "Escola não definida." });
  const turmas = await prisma.turma.findMany({ where: { escolaId }, include: { alunos: true, professores: { include: { professor: { select: { id: true, nome: true, email: true } } } } }, orderBy: { nome: "asc" } });
  res.json(turmas);
});

router.post("/turmas", authMiddleware, allow("COORDENADOR", "DIRETOR"), async (req, res) => {
  const escolaId = req.user?.escolaId;
  if (!escolaId) return res.status(400).json({ mensagem: "Usuário sem escola." });
  const { codigo, nome, serie, turno } = req.body;
  if (!codigo || !nome) return res.status(400).json({ mensagem: "Código e nome são obrigatórios." });
  try { const turma = await prisma.turma.create({ data: { codigo: String(codigo).trim(), nome: String(nome).trim(), serie: serie || null, turno: turno || null, escolaId } }); res.status(201).json(turma); }
  catch { res.status(409).json({ mensagem: "Não foi possível criar a turma." }); }
});

router.get("/alunos", authMiddleware, async (req, res) => {
  const escolaId = req.user?.escolaId;
  if (!escolaId) return res.status(400).json({ mensagem: "Usuário sem escola." });
  const alunos = await prisma.aluno.findMany({ where: { turma: { escolaId } }, include: { turma: true }, orderBy: { nome: "asc" } });
  res.json(alunos);
});

router.post("/alunos", authMiddleware, allow("COORDENADOR", "DIRETOR"), async (req, res) => {
  const escolaId = req.user?.escolaId;
  const { nome, matricula, email, turmaId } = req.body;
  const turma = await prisma.turma.findFirst({ where: { id: Number(turmaId), escolaId } });
  if (!turma) return res.status(404).json({ mensagem: "Turma não encontrada." });
  const aluno = await prisma.aluno.create({ data: { nome, matricula, email: email || null, turmaId: turma.id } });
  res.status(201).json(aluno);
});

router.get("/provas", authMiddleware, async (req, res) => {
  const escolaId = req.user?.escolaId;
  if (!escolaId) return res.status(400).json({ mensagem: "Usuário sem escola." });
  const provas = await prisma.prova.findMany({ where: { escolaId }, include: { turma: true, disciplina: true, professor: { select: { id: true, nome: true } }, questoes: true }, orderBy: { createdAt: "desc" } });
  res.json(provas);
});

router.post("/provas", authMiddleware, allow("PROFESSOR", "COORDENADOR", "DIRETOR"), async (req, res) => {
  const escolaId = req.user?.escolaId;
  const { titulo, descricao, quantidadeQuestoes, turmaId, disciplinaId, questoes = [] } = req.body;
  if (!escolaId || !titulo || !quantidadeQuestoes || !turmaId || !disciplinaId || !req.user) return res.status(400).json({ mensagem: "Dados incompletos." });
  const prova = await prisma.prova.create({ data: { titulo, descricao: descricao || null, quantidadeQuestoes: Number(quantidadeQuestoes), turmaId: Number(turmaId), disciplinaId: Number(disciplinaId), professorId: req.user.id, escolaId, questoes: { create: questoes.map((q: any) => ({ numero: Number(q.numero), resposta: String(q.resposta).toUpperCase(), valor: Number(q.valor ?? 1) })) } }, include: { questoes: true } });
  res.status(201).json(prova);
});

router.post("/correcoes/upload", authMiddleware, upload.single("arquivo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ mensagem: "Arquivo não enviado." });
  const provaId = Number(req.body.provaId);
  const alunoId = req.body.alunoId ? Number(req.body.alunoId) : null;
  const prova = await prisma.prova.findUnique({ where: { id: provaId }, include: { questoes: true } });
  if (!prova) return res.status(404).json({ mensagem: "Prova não encontrada." });
  const correcao = await prisma.correcaoFoto.create({ data: { provaId, alunoId, arquivoNome: req.file.originalname, arquivoUrl: path.resolve(req.file.path), status: "PROCESSANDO" } });
  res.status(202).json({ mensagem: "Foto recebida. O processamento Python poderá ser executado em seguida.", correcaoId: correcao.id });
});
