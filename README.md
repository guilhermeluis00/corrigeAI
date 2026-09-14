# CorrigeAI — Node + TypeScript

Projeto reorganizado em duas aplicações independentes:

- `backend/`: Node.js + Express + TypeScript + Prisma + PostgreSQL
- `frontend/`: Next.js + React + TypeScript
- `backend/python-omr/`: serviço futuro de visão computacional em Python/OpenCV

A implementação antiga baseada em HTML/CSS/JS separados não faz parte desta estrutura.

## Rodar

Abra dois terminais.

### Backend
```bash
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend: http://localhost:3001
Backend: http://localhost:3000

## Usuários do seed

prof@escola.com
coord@escola.com
diretor@escola.com

Senha definida no `prisma/seed.ts`.
