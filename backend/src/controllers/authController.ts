import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import prisma from "../prisma.js";
import { disciplinaIdsPorNomes, selectDisciplinas } from "../utils/disciplinas.js";
import { gerarToken } from "../utils/jwt.js";

const TIPOS_VALIDOS = ["PROFESSOR", "COORDENADOR", "DIRETOR"] as const;

function usuarioPublico(usuario: any) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
    ativo: usuario.ativo,
    escolaId: usuario.escolaId,
    disciplinas: (usuario.disciplinas || []).map((d: any) => ({ id: d.id, nome: d.nome })),
    escola: usuario.escola
      ? { id: usuario.escola.id, nome: usuario.escola.nome }
      : null
  };
}

export async function login(req: Request, res: Response) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "");

    if (!email || !senha) {
      return res.status(400).json({ mensagem: "E-mail e senha são obrigatórios." });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { escola: { select: { id: true, nome: true } }, disciplinas: selectDisciplinas }
    });

    if (!usuario) {
      return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
    }

    if (!usuario.ativo) {
      return res.status(403).json({ mensagem: "Usuário está desativado." });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
    }

    const token = gerarToken({
      id: usuario.id,
      tipo: usuario.tipo,
      escolaId: usuario.escolaId
    });

    return res.json({
      mensagem: "Login realizado com sucesso.",
      token,
      usuario: usuarioPublico(usuario)
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ mensagem: "Erro interno ao realizar login." });
  }
}

export async function cadastro(req: Request, res: Response) {
  try {
    const nome = String(req.body.nome || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "");
    const tipo = String(req.body.tipo || "").toUpperCase();
    const codigoEscola = String(req.body.codigoEscola || "").trim();
    let escolaId: number | null = null;

    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ mensagem: "Nome, e-mail, senha e tipo são obrigatórios." });
    }
    if (!TIPOS_VALIDOS.includes(tipo as (typeof TIPOS_VALIDOS)[number])) {
      return res.status(400).json({ mensagem: "Tipo de usuário inválido." });
    }
    if (senha.length < 6) {
      return res.status(400).json({ mensagem: "A senha deve ter pelo menos 6 caracteres." });
    }

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) return res.status(409).json({ mensagem: "Já existe um usuário com esse e-mail." });

    // Diretor: cria a conta sem escola e cadastra a escola logo em seguida (POST /api/escola).
    // Professor/Coordenador: precisam do código da escola informado pelo diretor.
    if (tipo === "DIRETOR") {
      if (codigoEscola) return res.status(400).json({ mensagem: "Diretores cadastram a própria escola após criar a conta." });
    } else {
      if (!codigoEscola) {
        return res.status(400).json({ mensagem: "Informe o código da escola fornecido pelo diretor." });
      }
      const escola = await prisma.escola.findFirst({ where: { codigo: codigoEscola, ativo: true } });
      if (!escola) return res.status(404).json({ mensagem: "Código de escola inválido." });
      escolaId = escola.id;
    }

    let disciplinas: { id: number }[] = [];
    if (tipo === "PROFESSOR") {
      disciplinas = await disciplinaIdsPorNomes(escolaId as number, req.body.disciplinas ?? req.body.disciplina);
      if (!disciplinas.length) return res.status(400).json({ mensagem: "Selecione ao menos uma disciplina do professor." });
    }

    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: await bcrypt.hash(senha, 10), tipo: tipo as any, escolaId, disciplinas: { connect: disciplinas } },
      include: { escola: { select: { id: true, nome: true } }, disciplinas: selectDisciplinas }
    });

    return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso.", usuario: usuarioPublico(usuario) });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return res.status(500).json({ mensagem: "Erro interno ao cadastrar usuário." });
  }
}

export async function me(req: Request, res: Response) {
  try {
    if (!req.usuario) return res.status(401).json({ mensagem: "Usuário não autenticado." });

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      include: { escola: { select: { id: true, nome: true } }, disciplinas: selectDisciplinas }
    });

    if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado." });

    return res.json({ usuario: usuarioPublico(usuario) });
  } catch (error) {
    console.error("Erro no /me:", error);
    return res.status(500).json({ mensagem: "Erro interno ao buscar usuário." });
  }
}
