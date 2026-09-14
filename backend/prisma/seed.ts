import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

async function main() {
  const senha = await bcrypt.hash("123456", 10);
  const escola = await prisma.escola.upsert({
    where: { cnpj: "00000000000100" },
    update: {},
    create: {
      nome: "Escola CorrigeAI",
      cnpj: "00000000000100",
      email: "contato@corrigeai.com",
      telefone: "(85) 99999-9999",
      endereco: "Fortaleza - CE"
    }
  });

  for (const data of [
    ["Professor Demo", "prof@escola.com", "PROFESSOR"],
    ["Coordenador Demo", "coord@escola.com", "COORDENADOR"],
    ["Diretor Demo", "diretor@escola.com", "DIRETOR"]
  ] as const) {
    await prisma.usuario.upsert({
      where: { email: data[1] },
      update: { escolaId: escola.id, nome: data[0], tipo: data[2] },
      create: { nome: data[0], email: data[1], senha, tipo: data[2], escolaId: escola.id }
    });
  }

  for (const nome of ["Matemática", "Português", "Ciências", "História", "Geografia"]) {
    await prisma.disciplina.upsert({
      where: { escolaId_nome: { escolaId: escola.id, nome } },
      update: {},
      create: { nome, escolaId: escola.id }
    });
  }

  await prisma.turma.upsert({
    where: { escolaId_codigo: { escolaId: escola.id, codigo: "8A" } },
    update: {},
    create: { codigo: "8A", nome: "8º Ano A", serie: "8º Ano", turno: "MANHA", escolaId: escola.id }
  });

  console.log("Seed concluído.");
}

main()
  .catch((error) => { console.error(error); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
