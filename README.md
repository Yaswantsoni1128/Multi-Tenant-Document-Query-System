# Multi-Tenant Document Query System

A full-stack Retrieval-Augmented Generation (RAG) application. Users can register, upload PDF documents, build a personal vector index, and query an LLM grounded on their own files.

Each tenant gets an isolated document store, embedding index, and chat history. Data is persisted on the server (database + filesystem), not in the browser.

## Features

- **Multi-tenant auth** — JWT-based login and registration
- **PDF upload** — per-user file storage
- **Document processing** — chunking + HuggingFace embeddings + ChromaDB
- **Document query** — Groq LLM answers using retrieved context
- **Persistent state** — uploaded files, index stats, and chat history stored in the backend
- **Modern UI** — React dashboard with independent scroll panels

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React, Vite, Tailwind CSS                       |
| Backend  | FastAPI, SQLAlchemy                             |
| Auth     | JWT (python-jose), bcrypt (passlib)             |
| RAG      | LangChain, ChromaDB, HuggingFace Embeddings     |
| LLM      | Groq (`llama-3.1-8b-instant`)                   |

## Project Structure

```
Rag-Chatbot/
├── backend/          # FastAPI API, RAG pipeline, database models
├── frontend/         # React + Vite client
└── README.md         # This file
```

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- A running SQL database (PostgreSQL recommended; any SQLAlchemy-compatible DB works)
- [Groq API key](https://console.groq.com/)

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

pip install fastapi uvicorn sqlalchemy python-dotenv python-jose passlib bcrypt \
  langchain-community langchain-text-splitters langchain-groq chromadb pypdf python-multipart

# Create backend/.env (see backend/README.md)
uvicorn main:app --reload
```

API runs at **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

### 2. Frontend

```bash
cd frontend
npm install

# Create frontend/.env
# VITE_API_URL=http://localhost:8000

npm run dev
```

App runs at **http://localhost:5173**

## Usage Flow

1. **Register** or **log in**
2. **Upload PDFs** in the left panel
3. Click **Process documents** to build the vector index
4. **Query documents** in the center panel once indexing is complete

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                          |
| -------------- | ------------------------------------ |
| `DATABASE_URL` | SQLAlchemy connection string         |
| `SECRET_KEY`   | JWT signing secret                   |
| `ALGORITHM`    | JWT algorithm (e.g. `HS256`)         |
| `GROQ_API_KEY` | Groq API key for chat completions    |

### Frontend (`frontend/.env`)

| Variable        | Description              |
| --------------- | ------------------------ |
| `VITE_API_URL`  | Backend base URL         |

## API Overview

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| POST   | `/auth/register`      | Create account                 |
| POST   | `/auth/login`         | Get access token               |
| GET    | `/rag/status`         | Files + pipeline status        |
| POST   | `/rag/upload`         | Upload PDF files               |
| POST   | `/rag/process`        | Index uploaded documents       |
| POST   | `/rag/chat`           | Ask a question                 |
| GET    | `/rag/chat/history`   | Load chat history              |

All `/rag/*` routes require `Authorization: Bearer <token>`.

## Documentation

- [Backend README](./backend/README.md) — setup, API details, data model
- [Frontend README](./frontend/README.md) — UI setup, structure, scripts

## License

MIT (or your preferred license)

Made With Love By (@Yaswantsoni1128)