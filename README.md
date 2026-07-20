# Marta Modas Ateliê

Sistema para gerenciar clientes, peças sob medida, status de produção e mensagens prontas para WhatsApp.

## O que já está pronto

- Frontend React + Vite
- API FastAPI
- Banco local SQLite para desenvolvimento
- Compatibilidade com PostgreSQL/Supabase em produção
- Cadastro, edição, exclusão, busca e filtros
- Dashboard por status
- Link de WhatsApp com mensagem pronta
- Configuração para Render e Vercel

## Rodar localmente

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Banco online no Supabase

1. No Supabase, clique em **Connect**.
2. Copie a connection string do pooler.
3. Substitua `[YOUR-PASSWORD]` pela senha do banco.
4. Não salve essa URL no GitHub.

Exemplo:

```text
postgresql://postgres.PROJECT_REF:SENHA@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
```

A aplicação cria a tabela `orders` automaticamente na primeira inicialização.

## Publicar o backend no Render

1. Faça push deste projeto para o GitHub.
2. No Render, escolha **New → Blueprint**.
3. Selecione o repositório. O arquivo `render.yaml` configura a API.
4. Preencha as variáveis solicitadas:
   - `DATABASE_URL`: URI completa do Supabase.
   - `CORS_ORIGINS`: inicialmente `http://localhost:5173`; depois acrescente o domínio da Vercel.
5. Aguarde o deploy e copie a URL pública, por exemplo:

```text
https://martamodas-api.onrender.com
```

Teste:

```text
https://martamodas-api.onrender.com/health
```

## Publicar o frontend na Vercel

1. Na Vercel, importe o mesmo repositório.
2. Defina **Root Directory** como `frontend`.
3. Adicione a variável:

```text
VITE_API_URL=https://SUA-API.onrender.com
```

4. Publique.
5. Copie o domínio da Vercel.
6. Volte ao Render e altere `CORS_ORIGINS` para:

```text
http://localhost:5173,https://SEU-PROJETO.vercel.app
```

7. Faça um novo deploy da API.

## Atualizar o GitHub

```bash
git add .
git commit -m "Preparar banco e deploy online"
git push
```

## Segurança

Nunca envie para o GitHub:

- senha do Supabase;
- `DATABASE_URL` real;
- arquivos `.env`;
- tokens de Render ou Vercel.
