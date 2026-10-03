import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import prisma from "../prisma.js";
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
      include: { escola: { select: { id: true, nome: true } } }
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
    const escolaIdInformado = req.body.escolaId ? Number(req.body.escolaId) : null;

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

    if (existente) {
      return res.status(409).json({ mensagem: "Já existe um usuário com esse e-mail." });
    }

    let escolaId = escolaIdInformado;

    if (escolaId) {
      const escola = await prisma.escola.findUnique({ where: { id: escolaId } });
      if (!escola) return res.status(404).json({ mensagem: "Escola não encontrada." });
    } else if (tipo !== "DIRETOR") {
      return res.status(400).json({
        mensagem: "Professores e coordenadores precisam ser vinculados a uma escola. Informe o escolaId."
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      if (!escolaId && tipo === "DIRETOR") {
        const nomeEscola = String(req.body.escola?.nome || `${nome} — Escola`).trim();
        const cnpjBase = String(req.body.escola?.cnpj || `AUTO-${Date.now()}-${Math.floor(Math.random() * 100000)}`)
          .trim()
          .slice(0, 40);

        const escola = await tx.escola.create({
          data: {
            nome: nomeEscola,
            cnpj: cnpjBase,
            email: req.body.escola?.email ? String(req.body.escola.email).trim().toLowerCase() : email,
            telefone: req.body.escola?.telefone ? String(req.body.escola.telefone).trim() : null,
            endereco: req.body.escola?.endereco ? String(req.body.escola.endereco).trim() : null
          }
        });

        escolaId = escola.id;
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      return tx.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          tipo: tipo as any,
          escolaId
        },
        include: { escola: { select: { id: true, nome: true } } }
      });
    });

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso.",
      usuario: usuarioPublico(resultado)
    });
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
      include: { escola: { select: { id: true, nome: true } } }
    });

    if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado." });

    return res.json({ usuario: usuarioPublico(usuario) });
  } catch (error) {
    console.error("Erro no /me:", error);
    return res.status(500).json({ mensagem: "Erro interno ao buscar usuário." });
  }
}
