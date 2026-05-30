# Backend — Multi-Tenant Document Query System

FastAPI backend for multi-tenant user authentication, PDF ingestion, vector indexing, and document query (RAG-powered chat).

## Stack

- **FastAPI** — REST API
- **SQLAlchemy** — ORM + user/document/chat persistence
- **JWT** — authenticated sessions
- **LangChain + ChromaDB** — document chunking, embeddings, retrieval
- **Groq** — LLM inference
- **HuggingFace** — `sentence-transformers/all-MiniLM-L6-v2` embeddings

## Project Layout

```
backend/
├── main.py              # App entry point, CORS, router registration
├── database.py          # SQLAlchemy engine + session
├── models.py            # User, UserDocument, UserRagState, ChatMessage
├── schemas.py           # Pydantic request/response models
├── auth.py              # Password hashing + JWT helpers
├── auth_dependency.py   # get_current_user dependency
├── routers/
│   ├── auth.py          # /auth/register, /auth/login
│   └── rag.py           # /rag/* endpoints
├── uploads/             # Temporary PDF storage (per user, gitignored)
└── chroma_db/           # Vector indexes (per user, gitignored)
```

## Setup

### 1. Virtual environment

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
```

### 2. Install dependencies

```bash
pip install fastapi uvicorn sqlalchemy python-dotenv python-jose passlib bcrypt \
  langchain-community langchain-text-splitters langchain-groq chromadb pypdf python-multipart
```

> Tip: freeze your environment with `pip freeze > requirements.txt` after a successful install.

### 3. Environment variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mtdqs
SECRET_KEY=your-long-random-secret-key
ALGORITHM=HS256
GROQ_API_KEY=your-groq-api-key
```

| Variable       | Required | Description                                |
| -------------- | -------- | ------------------------------------------ |
| `DATABASE_URL` | Yes      | SQLAlchemy DB URL                          |
| `SECRET_KEY`   | Yes      | JWT signing key                            |
| `ALGORITHM`    | Yes      | JWT algorithm (`HS256` recommended)        |
| `GROQ_API_KEY` | Yes      | Used by LangChain Groq chat model          |

### 4. Test database connection

```bash
python test_db.py
```

Expected output: `Connected Successfully`

### 5. Run the server

```bash
uvicorn main:app --reload
```

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

Tables are created automatically on startup via `Base.metadata.create_all()`.

## API Reference

### Health

| Method | Path | Auth | Description        |
| ------ | ---- | ---- | ------------------ |
| GET    | `/`  | No   | Returns API status |

### Auth (`/auth`)

| Method | Path        | Body                              | Response              |
| ------ | ----------- | --------------------------------- | --------------------- |
| POST   | `/register` | `{ "email", "password" }`         | Success message       |
| POST   | `/login`    | `{ "email", "password" }`         | `{ "access_token" }`  |

### RAG (`/rag`) — all routes require Bearer token

| Method | Path            | Description                                      |
| ------ | --------------- | ------------------------------------------------ |
| GET    | `/status`       | User files, process status, doc/chunk counts     |
| GET    | `/chat/history` | Full chat message history for the user           |
| POST   | `/upload`       | Upload one or more PDF files (`files` multipart) |
| POST   | `/process`      | Chunk PDFs, embed, store in ChromaDB             |
| POST   | `/chat`         | Ask a question: `{ "question": "..." }`          |

#### Example: login + chat

```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"secret123"}'

# Upload PDF
curl -X POST http://localhost:8000/rag/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "files=@document.pdf"

# Process
curl -X POST http://localhost:8000/rag/process \
  -H "Authorization: Bearer <TOKEN>"

# Chat
curl -X POST http://localhost:8000/rag/chat \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is this document about?"}'
```

## Data Model

### `users`
- `id`, `email`, `password` (bcrypt hash)

### `user_documents`
- Tracks uploaded filenames per user
- `indexed` flag set after successful processing

### `user_rag_state`
- Stores `total_documents` and `total_chunks` after indexing

### `chat_messages`
- Persists user and assistant messages
- `sources_used` on assistant replies

### Filesystem (per user)

| Path                    | Purpose                          |
| ----------------------- | -------------------------------- |
| `uploads/{user_id}/`    | Raw PDFs before processing       |
| `chroma_db/{user_id}/`  | Chroma vector store after process|

Uploads are deleted from disk after processing; filenames remain in the database.

## RAG Pipeline

1. **Upload** — PDFs saved to `uploads/{user_id}/`
2. **Process**
   - Load PDFs with `PyPDFLoader`
   - Split into 1000-char chunks (200 overlap)
   - Embed with HuggingFace MiniLM
   - Persist to ChromaDB
   - Save metadata to SQL
3. **Chat**
   - Similarity search (top 4 chunks)
   - Build prompt with context
   - Groq LLM generates answer
   - Save Q&A to `chat_messages`

## CORS

All origins are allowed in development (`allow_origins=["*"]`). Restrict this in production.

## Troubleshooting

| Issue                              | Fix                                              |
| ---------------------------------- | ------------------------------------------------ |
| DB connection error                | Check `DATABASE_URL` in `.env`                   |
| `Invalid token`                    | Re-login; verify `SECRET_KEY` hasn't changed     |
| `Please process documents first` | Run `/rag/process` after uploading PDFs          |
| Groq / embedding errors            | Verify `GROQ_API_KEY`; first run downloads models |
| Upload 401                         | Pass `Authorization: Bearer <token>` header      |

## Production Notes

- Use a strong `SECRET_KEY` and HTTPS
- Restrict CORS to your frontend domain
- Use a managed PostgreSQL instance
- Add rate limiting and file size limits on upload
- Consider `langchain-huggingface` and `langchain-chroma` (newer LangChain packages)


Made With Love By (@Yaswantsoni1128)