# Frontend — Multi-Tenant Document Query System

React + Vite client for the Multi-Tenant Document Query System. Provides authentication, PDF upload, document processing, and a query interface backed by the FastAPI server.

## Stack

- **React 19** — UI
- **Vite 8** — dev server and build tool
- **Tailwind CSS 4** — styling (via `@tailwindcss/vite`)
- **Fetch API** — backend communication

## Project Layout

```
frontend/
├── src/
│   ├── App.jsx                 # Main layout, workflow state
│   ├── main.jsx                # Entry point + AuthProvider
│   ├── components/
│   │   ├── ChatPanel.jsx       # Chat messages + inline composer
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── UploadPanel.jsx     # Drag-and-drop PDF upload
│   │   └── RightPanel.jsx      # Pipeline status sidebar
│   ├── pages/
│   │   ├── AuthPage.jsx        # Login / register tabs
│   │   ├── ChatPage.jsx        # Chat container
│   │   └── UploadPage.jsx      # Upload + process panels
│   ├── lib/
│   │   ├── api.js              # API helpers
│   │   ├── auth.jsx            # Auth context (JWT in localStorage)
│   │   └── errors.js           # FastAPI error parsing
│   └── styles/
│       └── globals.css         # App-wide styles
├── .env                        # VITE_API_URL
├── index.html
├── vite.config.js
└── package.json
```

## Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Environment

Create or edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

| Variable        | Description                    |
| --------------- | ------------------------------ |
| `VITE_API_URL`  | Backend API base URL           |

Restart the dev server after changing `.env`.

### 3. Run development server

```bash
npm run dev
```

Open **http://localhost:5173**

Make sure the backend is running at the URL set in `VITE_API_URL`.

## Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start Vite dev server (HMR)    |
| `npm run build` | Production build → `dist/`     |
| `npm run preview` | Preview production build     |
| `npm run lint`  | Run ESLint                     |

## UI Overview

### Layout

- **Header** — app title, backend status, user email, logout
- **Step bar** — Upload → Process → Chat workflow
- **Left column** — PDF upload, process button, file list (scrollable)
- **Center column** — chat history (scrollable) + fixed input box at bottom
- **Right column** — pipeline status, documents, last response (scrollable)

Each column scrolls independently; the page itself does not scroll.

### User Flow

1. Register or sign in
2. Upload PDF files (drag-and-drop or file picker)
3. Click **Process documents** to index files
4. Ask questions in the chat panel once status is **Ready**

On login or refresh, the app loads **files**, **pipeline status**, and **chat history** from the backend API — not from localStorage (only the JWT token is stored locally).

## API Integration

All API calls live in `src/lib/api.js`:

| Function            | Endpoint              |
| ------------------- | --------------------- |
| `loginUser`         | POST `/auth/login`    |
| `registerUser`      | POST `/auth/register` |
| `fetchRagStatus`    | GET `/rag/status`     |
| `uploadFiles`       | POST `/rag/upload`    |
| `processDocuments`  | POST `/rag/process`   |
| `chatWithDocuments` | POST `/rag/chat`      |
| `fetchChatHistory`  | GET `/rag/chat/history` |

Auth token is attached as `Authorization: Bearer <token>` on protected routes.

## Auth

- Token key: `rag_token_v1` in `localStorage`
- `AuthProvider` (`src/lib/auth.jsx`) restores session on page load
- Logout clears token and resets app state

## Production Build

```bash
npm run build
```

Serve the `dist/` folder with any static host (Nginx, Vercel, Netlify, etc.).

Set `VITE_API_URL` to your production API URL **before** building:

```env
VITE_API_URL=https://api.yourdomain.com
```

## Troubleshooting

| Issue                         | Fix                                           |
| ----------------------------- | --------------------------------------------- |
| CORS errors                   | Ensure backend CORS allows your frontend URL  |
| `Backend offline` in header   | Start backend; check `VITE_API_URL`           |
| Upload fails with 401         | Log in again (token expired or invalid)       |
| Chat disabled                 | Upload PDFs and run **Process documents**     |
| Empty files after refresh     | Confirm backend `/rag/status` returns data      |
| `.env` changes not applied    | Restart `npm run dev`                         |

## Related

- [Root README](../README.md) — full project overview
- [Backend README](../backend/README.md) — API and server setup


Made With Love By (@Yaswantsoni1128)