# Marta Modas Ateliê

Sistema simples para gerenciar clientes, peças sob medida e avisos pelo WhatsApp.

## Recursos
- Dashboard com contadores por status
- Cadastro, edição e exclusão de clientes/pedidos
- Busca por nome, telefone ou peça
- Alteração rápida de status
- Link de WhatsApp com mensagem pronta
- Backend FastAPI com banco SQLite
- Interface responsiva em React

## Rodar localmente

### Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Configuração
O frontend usa por padrão `http://localhost:8000`. Para alterar:

```bash
VITE_API_URL=https://sua-api.exemplo.com npm run build
```

## Deploy gratuito sugerido
- Frontend: Vercel
- Backend: Render
- Banco: o SQLite funciona para uso pequeno, mas em produção prefira PostgreSQL para maior segurança.
