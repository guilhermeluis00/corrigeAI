import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import prisma from "../prisma.js";
import { gerarToken } from "../utils/jwt.js";
import { disciplinaIdsPorNomes, garantirDisciplinas, selectDisciplinas } from "../utils/disciplinas.js";
import { gerarCodigoEscola } from "../utils/codigoEscola.js";

export async function listarUsuarios(req: Request, res: Response) {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { escolaId: req.usuario?.escolaId },
      select: { id: true, nome: true, email: true, tipo: true, ativo: true, createdAt: true, disciplinas: selectDisciplinas },
      orderBy: { nome: "asc" }
    });
    return res.json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return res.status(500).json({ mensagem: "Erro ao listar usuários." });
  }
}

export async function criarUsuario(req: Request, res: Response) {
  try {
    const { nome, email, senha, tipo } = req.body;
    if (!nome || !email || !senha || !tipo) return res.status(400).json({ mensagem: "Nome, e-mail, senha e tipo são obrigatórios." });
    if (!req.usuario?.escolaId) return res.status(400).json({ mensagem: "Usuário sem escola vinculada." });

    if (!["PROFESSOR", "COORDENADOR", "DIRETOR"].includes(tipo)) return res.status(400).json({ mensagem: "Tipo inválido." });

    const emailNormalizado = String(email).trim().toLowerCase();
    const existe = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });
    if (existe) return res.status(409).json({ mensagem: "E-mail já cadastrado." });

    const senhaHash = await bcrypt.hash(String(senha), 10);
    let disciplinas: { id: number }[] = [];
    if (tipo === "PROFESSOR") {
      disciplinas = await disciplinaIdsPorNomes(req.usuario.escolaId, req.body.disciplinas ?? req.body.disciplina);
      if (!disciplinas.length) return res.status(400).json({ mensagem: "Selecione ao menos uma disciplina do professor." });
    }

    const usuario = await prisma.usuario.create({
      data: { nome: String(nome).trim(), email: emailNormalizado, senha: senhaHash, tipo, escolaId: req.usuario.escolaId, disciplinas: { connect: disciplinas } }
    });

    return res.status(201).json({
      mensagem: "Usuário criado com sucesso.",
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo, ativo: usuario.ativo }
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({ mensagem: "Erro ao criar usuário." });
  }
}

export async function atualizarUsuario(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const existente = await prisma.usuario.findFirst({ where: { id, escolaId: req.usuario?.escolaId } });
    if (!existente) return res.status(404).json({ mensagem: "Usuário não encontrado." });

    const data: any = {
      nome: req.body.nome !== undefined ? String(req.body.nome).trim() : undefined,
      email: req.body.email !== undefined ? String(req.body.email).trim().toLowerCase() : undefined,
      tipo: req.body.tipo !== undefined ? req.body.tipo : undefined,
      ativo: req.body.ativo !== undefined ? Boolean(req.body.ativo) : undefined
    };

    // Substitui a lista de disciplinas que o professor leciona.
    const nomes = req.body.disciplinas ?? req.body.disciplina;
    if (nomes !== undefined) {
      const disciplinas = await disciplinaIdsPorNomes(req.usuario!.escolaId!, nomes);
      if (!disciplinas.length && (data.tipo ?? existente.tipo) === "PROFESSOR") return res.status(400).json({ mensagem: "Selecione ao menos uma disciplina do professor." });
      data.disciplinas = { set: disciplinas };
    }

    if (req.body.senha) data.senha = await bcrypt.hash(String(req.body.senha), 10);

    const usuario = await prisma.usuario.update({ where: { id }, data, select: { id: true, nome: true, email: true, tipo: true, ativo: true, disciplinas: selectDisciplinas } });
    return res.json({ mensagem: "Usuário atualizado com sucesso.", usuario });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({ mensagem: "Erro ao atualizar usuário." });
  }
}

export async function escolaAtual(req: Request, res: Response) {
  try {
    if (!req.usuario?.escolaId) return res.status(404).json({ mensagem: "Escola não encontrada." });
    const escola = await prisma.escola.findUnique({ where: { id: req.usuario.escolaId } });
    if (!escola) return res.status(404).json({ mensagem: "Escola não encontrada." });
    return res.json(escola);
  } catch (error) {
    console.error("Erro ao buscar escola:", error);
    return res.status(500).json({ mensagem: "Erro ao buscar escola." });
  }
}

export async function atualizarEscola(req: Request, res: Response) {
  try {
    if (!req.usuario?.escolaId) return res.status(404).json({ mensagem: "Escola não encontrada." });
    const escola = await prisma.escola.update({
      where: { id: req.usuario.escolaId },
      data: {
        nome: req.body.nome !== undefined ? String(req.body.nome).trim() : undefined,
        cnpj: req.body.cnpj !== undefined ? String(req.body.cnpj).trim() : undefined,
        email: req.body.email !== undefined ? (req.body.email ? String(req.body.email).trim().toLowerCase() : null) : undefined,
        telefone: req.body.telefone !== undefined ? (req.body.telefone ? String(req.body.telefone).trim() : null) : undefined,
        endereco: req.body.endereco !== undefined ? (req.body.endereco ? String(req.body.endereco).trim() : null) : undefined
      }
    });
    return res.json({ mensagem: "Dados da escola atualizados.", escola });
  } catch (error: any) {
    console.error("Erro ao atualizar escola:", error);
    if (error?.code === "P2002") return res.status(409).json({ mensagem: "Este CNPJ já está cadastrado." });
    return res.status(500).json({ mensagem: "Erro ao atualizar escola." });
  }
}

export async function criarEscola(req: Request, res: Response) {
  try {
    if (!req.usuario) return res.status(401).json({ mensagem: "Usuário não autenticado." });
    const atual = await prisma.usuario.findUnique({ where: { id: req.usuario.id } });
    if (!atual) return res.status(404).json({ mensagem: "Usuário não encontrado." });
    if (atual.escolaId) return res.status(409).json({ mensagem: "Você já possui uma escola cadastrada." });

    const nome = String(req.body.nome || "").trim();
    const cnpj = String(req.body.cnpj || "").trim();
    if (!nome || !cnpj) return res.status(400).json({ mensagem: "Nome da escola e CNPJ são obrigatórios." });
    const opcional = (v: unknown) => (v ? String(v).trim() : null);

    const { escola, usuario } = await prisma.$transaction(async (tx) => {
      const escola = await tx.escola.create({
        data: { nome, cnpj, codigo: gerarCodigoEscola(), email: opcional(req.body.email)?.toLowerCase() ?? null, telefone: opcional(req.body.telefone), endereco: opcional(req.body.endereco) }
      });
      const usuario = await tx.usuario.update({
        where: { id: atual.id },
        data: { escolaId: escola.id },
        include: { escola: { select: { id: true, nome: true } } }
      });
      return { escola, usuario };
    });

    await garantirDisciplinas(escola.id);
    const token = gerarToken({ id: usuario.id, tipo: usuario.tipo, escolaId: usuario.escolaId });
    return res.status(201).json({
      mensagem: "Escola cadastrada com sucesso.",
      token,
      escola,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo, ativo: usuario.ativo, escolaId: usuario.escolaId, escola: usuario.escola }
    });
  } catch (error: any) {
    console.error("Erro ao criar escola:", error);
    if (error?.code === "P2002") return res.status(409).json({ mensagem: "Este CNPJ já está cadastrado." });
    return res.status(500).json({ mensagem: "Erro ao cadastrar escola." });
  }
}
