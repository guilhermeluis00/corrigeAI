# CorrigeAI Backend

Backend oficial do CorrigeAI, alinhado à arquitetura do frontend Vite + React + TypeScript.

## Stack

- Node.js
- TypeScript
- Express
- Prisma 7
- PostgreSQL
- JWT
- Multer
- Python + FastAPI + OpenCV para visão computacional

## Estrutura

```text
backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   ├── routes.ts
│   ├── prisma.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── python-omr/
├── uploads/
├── .env
├── prisma.config.ts
├── package.json
└── tsconfig.json
```

## Configuração

Crie `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/corrigeai"
JWT_SECRET="uma-chave-longa-e-segura"
PORT=3000
FRONTEND_URL="http://localhost:5173"
PYTHON_OMR_URL="http://127.0.0.1:8000"
UPLOAD_DIR="uploads"
```

## Instalação

```powershell
npm install
npx prisma generate
npx prisma migrate dev --name initial
npx prisma db seed
npm run dev
```

API:

```text
http://localhost:3000
http://localhost:3000/api
```

## Usuários de desenvolvimento

O seed cria:

```text
Diretor:
  diretor@corrigeai.com

Coordenador:
  coordenador@corrigeai.com

Professor:
  professor@corrigeai.com

Senha:
  CorrigeAI@2026
```

Essas contas existem somente para desenvolvimento/teste local. Em produção, remova a estratégia de seed com credenciais conhecidas e use onboarding/invite da escola.

## API principal

### Autenticação

```text
POST /api/auth/login
POST /api/auth/cadastro
GET  /api/auth/me
```

### Dashboard

```text
GET /api/dashboard
```

### Turmas

```text
GET    /api/turmas
GET    /api/turmas/:id
POST   /api/turmas
PUT    /api/turmas/:id
DELETE /api/turmas/:id
POST   /api/turmas/:id/professores
```

### Alunos

```text
GET    /api/alunos
GET    /api/alunos/:id
POST   /api/alunos
PUT    /api/alunos/:id
DELETE /api/alunos/:id
```

### Disciplinas

```text
GET    /api/disciplinas
POST   /api/disciplinas
PUT    /api/disciplinas/:id
DELETE /api/disciplinas/:id
```

### Provas

```text
GET    /api/provas
GET    /api/provas/:id
POST   /api/provas
PUT    /api/provas/:id
DELETE /api/provas/:id
```

### Resultados

```text
GET /api/resultados
GET /api/resultados/:id
```

### Relatórios

```text
GET /api/relatorios
```

### Gestão

```text
GET /api/gestao/usuarios
POST /api/gestao/usuarios
PUT /api/gestao/usuarios/:id
GET /api/gestao/escola
PUT /api/gestao/escola
```

### Perfil

```text
GET /api/perfil
PUT /api/perfil
```

### Correção por foto

```text
POST /api/correcoes/foto
GET  /api/correcoes/:id
```

Campo multipart da imagem:

```text
imagem
provaId
alunoId
```

## Python/OMR

O Node envia a imagem para:

```text
POST http://127.0.0.1:8000/omr/detect
```

O serviço Python inicial não gera respostas fictícias. Ele retorna 501 até o algoritmo real de OMR/OpenCV ser implementado.

## Perfis

### PROFESSOR

- Dashboard
- Provas
- Correção
- Resultados
- Perfil
- somente turmas vinculadas

### COORDENADOR

- Dashboard
- Turmas
- Alunos
- Provas
- Correção
- Resultados
- Relatórios
- Perfil

### DIRETOR

- Dashboard
- Turmas
- Alunos
- Provas
- Correção
- Resultados
- Relatórios
- Gestão
- Perfil

## Compatibilidade com o frontend

O frontend Vite atual utiliza:

```env
VITE_API_URL=http://localhost:3000/api
```

O backend mantém os caminhos `/api/auth`, `/api/dashboard`, `/api/turmas`, `/api/alunos`, `/api/provas`, `/api/resultados`, `/api/relatorios` e `/api/correcoes/foto` para integração direta.
