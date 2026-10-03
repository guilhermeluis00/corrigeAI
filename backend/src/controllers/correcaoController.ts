import fs from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";
import prisma from "../prisma.js";

function resultadoScope(req: Request) {
  if (!req.usuario?.escolaId) return { id: -1 };
  if (req.usuario.tipo === "PROFESSOR") return { prova: { escolaId: req.usuario.escolaId, professorId: req.usuario.id } };
  return { prova: { escolaId: req.usuario.escolaId } };
}

export async function processarFoto(req: Request, res: Response) {
  let resultadoId: number | null = null;

  try {
    if (!req.usuario?.escolaId) return res.status(400).json({ mensagem: "Usuário sem escola vinculada." });
    if (!req.file) return res.status(400).json({ mensagem: "A imagem da folha é obrigatória." });

    const provaId = Number(req.body.provaId);
    const alunoId = Number(req.body.alunoId);

    if (!provaId || !alunoId) return res.status(400).json({ mensagem: "provaId e alunoId são obrigatórios." });

    const prova = await prisma.prova.findFirst({
      where: { id: provaId, ...resultadoScope(req).prova },
      include: { questoes: { orderBy: { numero: "asc" } }, turma: true }
    });

    if (!prova) return res.status(404).json({ mensagem: "Prova não encontrada." });

    const aluno = await prisma.aluno.findFirst({
      where: { id: alunoId, turma: { escolaId: req.usuario.escolaId } }
    });

    if (!aluno) return res.status(404).json({ mensagem: "Aluno não encontrado." });

    const resultado = await prisma.resultado.create({
      data: {
        provaId,
        alunoId,
        usuarioId: req.usuario.id,
        status: "PROCESSANDO",
        imagemOriginal: req.file.filename
      }
    });

    resultadoId = resultado.id;

    const pythonUrl = String(process.env.PYTHON_OMR_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

    const imageBuffer = await fs.readFile(req.file.path);
    const form = new FormData();
    form.append("imagem", new Blob([imageBuffer], { type: req.file.mimetype }), req.file.originalname);
    form.append("provaId", String(provaId));
    form.append("totalQuestoes", String(prova.questoes.length));

    let pythonResponse: globalThis.Response;

    try {
      pythonResponse = await fetch(`${pythonUrl}/omr/detect`, {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(30000)
      });
    } catch (error) {
      const mensagem = "Serviço de visão computacional indisponível.";
      await prisma.resultado.update({ where: { id: resultado.id }, data: { status: "ERRO", erroMensagem: mensagem } });
      return res.status(503).json({ mensagem, resultadoId: resultado.id });
    }

    if (!pythonResponse.ok) {
      const pythonError = await pythonResponse.text().catch(() => "");
      let detalhe = pythonError;
      try { const parsed = JSON.parse(pythonError); if (typeof parsed?.detail === "string") detalhe = parsed.detail; } catch { /* texto simples */ }
      const mensagem = detalhe || "Não foi possível processar a imagem.";
      await prisma.resultado.update({ where: { id: resultado.id }, data: { status: "ERRO", erroMensagem: mensagem } });
      return res.status(502).json({ mensagem, resultadoId: resultado.id });
    }

    const deteccao: any = await pythonResponse.json();
    const questoesDetectadas = Array.isArray(deteccao.questoes) ? deteccao.questoes : [];

    const porNumero = new Map<number, any>();
    for (const item of questoesDetectadas) {
      const numero = Number(item.numero);
      if (numero) porNumero.set(numero, item);
    }

    let acertos = 0;
    let valorTotal = 0;
    let valorObtido = 0;

    const respostas = prova.questoes.map((questao) => {
      const detectada = porNumero.get(questao.numero);
      const respostaAluno = detectada?.resposta ? String(detectada.resposta).toUpperCase() : null;
      const correta = respostaAluno ? respostaAluno === questao.resposta.toUpperCase() : false;
      const valor = Number(questao.valor);

      valorTotal += valor;
      if (correta) {
        acertos += 1;
        valorObtido += valor;
      }

      return {
        resultadoId: resultado.id,
        alunoId,
        questaoId: questao.id,
        respostaAluno,
        correta,
        valorObtido: correta ? valor : 0
      };
    });

    if (respostas.length) {
      await prisma.resposta.createMany({ data: respostas });
    }

    const nota = valorTotal > 0 ? Number(((valorObtido / valorTotal) * 10).toFixed(2)) : 0;

    const atualizado = await prisma.resultado.update({
      where: { id: resultado.id },
      data: {
        status: "CONCLUIDA",
        nota,
        totalQuestoes: prova.questoes.length,
        acertos,
        erros: Math.max(prova.questoes.length - acertos, 0)
      },
      include: {
        aluno: { include: { turma: true } },
        prova: { include: { disciplina: true, turma: true } },
        respostas: { include: { questao: true }, orderBy: { questao: { numero: "asc" } } }
      }
    });

    return res.status(201).json({ mensagem: "Correção concluída.", resultado: atualizado, deteccao });
  } catch (error) {
    console.error("Erro ao processar correção:", error);
    if (resultadoId) {
      await prisma.resultado.update({
        where: { id: resultadoId },
        data: { status: "ERRO", erroMensagem: "Erro interno durante a correção." }
      }).catch(() => undefined);
    }

    return res.status(500).json({ mensagem: "Erro ao processar a correção." });
  }
}

export async function statusCorrecao(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const resultado = await prisma.resultado.findFirst({
      where: { id, ...resultadoScope(req) },
      include: { aluno: true, prova: true, respostas: { include: { questao: true } } }
    });

    if (!resultado) return res.status(404).json({ mensagem: "Correção não encontrada." });
    return res.json(resultado);
  } catch (error) {
    console.error("Erro ao consultar correção:", error);
    return res.status(500).json({ mensagem: "Erro ao consultar correção." });
  }
}

export async function removerArquivo(req: Request, res: Response) {
  const nomeArquivo = String(req.body.nomeArquivo || "").trim();
  if (!nomeArquivo) return res.status(400).json({ mensagem: "Nome de arquivo não informado." });

  const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
  try {
    await fs.unlink(path.join(uploadDir, path.basename(nomeArquivo)));
  } catch {
    // arquivo já removido ou inexistente
  }

  return res.json({ mensagem: "Arquivo removido." });
}
