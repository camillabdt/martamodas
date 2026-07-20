# Marta Modas Ateliê — sistema pronto para GitHub

Sistema web para controlar clientes e pedidos do ateliê: cadastro, edição, exclusão, busca, etapas de produção, data prevista, observações, painel de indicadores e mensagem pronta para WhatsApp.

## Estrutura

- `frontend/`: React + Vite
- `backend/`: FastAPI + SQLAlchemy
- Banco local: SQLite
- Banco online: PostgreSQL/Supabase
- Deploy: Vercel + Render

## Rodar no computador

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Acesse `http://localhost:8000/docs`.

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Publicar

### 1. Supabase

Crie o projeto e copie a URI do **Transaction Pooler**, normalmente na porta `6543`. Use o usuário real no formato `postgres.PROJECT_REF`.

Exemplo (não copie literalmente):

```text
postgresql+psycopg://postgres.PROJECT_REF:SENHA@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
```

### 2. Render (backend)

Crie um Blueprint usando o `render.yaml`. Configure:

- `DATABASE_URL`: URI completa do Supabase
- `CORS_ORIGINS`: `http://localhost:5173,https://martamodas.vercel.app`
- `SEED_DEMO_DATA`: `false`

Teste:

- `/` mostra que a API está online
- `/health` retorna `{"status":"ok"}`
- `/docs` abre a documentação

### 3. Vercel (frontend)

Importe este repositório e escolha `frontend` como **Root Directory**. Adicione:

```text
VITE_API_URL=https://martamodas-api.onrender.com
```

Depois clique em **Deploy**.

## Atualizar o repositório existente

Extraia o ZIP, copie todo o conteúdo para a pasta do repositório e execute:

```bash
git add .
git commit -m "Atualizar sistema Marta Modas"
git push
```

Render e Vercel farão novo deploy automaticamente.

## Segurança

Nunca envie `.env`, senha do Supabase, tokens ou a `DATABASE_URL` real ao GitHub.
