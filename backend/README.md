# CorrigeAI — Backend

Backend separado em Node.js + Express + TypeScript, com PostgreSQL + Prisma.

## Executar

```bash
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

API: http://localhost:3000

O serviço `python-omr` fica separado e será responsável por visão computacional da folha de respostas.
