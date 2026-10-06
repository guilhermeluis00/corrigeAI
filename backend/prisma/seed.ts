import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/prisma.js";
import { gerarCodigoEscola } from "../src/utils/codigoEscola.js";

async function main() {
  const senha = await bcrypt.hash("CorrigeAI@2026", 10);

  const escola = await prisma.escola.upsert({
    where: { cnpj: "00000000000100" },
    update: {
      nome: "Escola CorrigeAI",
      email: "contato@corrigeai.com"
    },
    create: {
      nome: "Escola CorrigeAI",
      cnpj: "00000000000100",
      codigo: gerarCodigoEscola(),
      email: "contato@corrigeai.com",
      telefone: "(85) 0000-0000"
    }
  });

  const usuarios = [
    ["Diretor CorrigeAI", "diretor@corrigeai.com", "DIRETOR"],
    ["Coordenador CorrigeAI", "coordenador@corrigeai.com", "COORDENADOR"],
    ["Professor CorrigeAI", "professor@corrigeai.com", "PROFESSOR"]
  ] as const;

  for (const [nome, email, tipo] of usuarios) {
    await prisma.usuario.upsert({
      where: { email },
      update: { nome, tipo, ativo: true, escolaId: escola.id, senha },
      create: { nome, email, senha, tipo, escolaId: escola.id }
    });
  }

  console.log("Seed concluído.");
  console.log(`Escola: ${escola.nome} (código ${escola.codigo})`);
  console.log("Senha dos usuários de desenvolvimento: CorrigeAI@2026");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
