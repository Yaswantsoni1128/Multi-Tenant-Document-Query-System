import axios from 'axios'
import { parseApiError, readJsonResponse } from './errors'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export async function checkHealth() {
  const res = await fetch(`${api.defaults.baseURL}/`)
  const json = await readJsonResponse(res)
  if (!res.ok) throw new Error(parseApiError(json, 'Backend unavailable'))
  return json.message || 'ok'
}

export async function loginUser(email, password) {
  const res = await fetch(`${api.defaults.baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await readJsonResponse(res)
  if (!res.ok) throw new Error(parseApiError(json, 'Login failed'))
  return json.access_token
}

export async function registerUser(email, password) {
  const res = await fetch(`${api.defaults.baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await readJsonResponse(res)
  if (!res.ok) throw new Error(parseApiError(json, 'Registration failed'))
  return json
}

export async function uploadFiles(files, token) {
  const form = new FormData()
  for (const file of files) form.append('files', file, file.name)

  const res = await fetch(`${api.defaults.baseURL}/rag/upload`, {
    method: 'POST',
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const json = await readJsonResponse(res)
  if (!res.ok) throw new Error(parseApiError(json, 'Upload failed'))
  return json
}

export async function processDocuments(token) {
  const res = await fetch(`${api.defaults.baseURL}/rag/process`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const json = await readJsonResponse(res)
  if (!res.ok) throw new Error(parseApiError(json, 'Processing failed'))
  return json
}

export async function chatWithDocuments(question, token) {
  const res = await fetch(`${api.defaults.baseURL}/rag/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ question }),
  })
  const json = await readJsonResponse(res)
  if (!res.ok) throw new Error(parseApiError(json, 'Chat request failed'))
  return json
}

export async function fetchRagStatus(token) {
  const res = await fetch(`${api.defaults.baseURL}/rag/status`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const json = await readJsonResponse(res)
  if (!res.ok) throw new Error(parseApiError(json, 'Failed to load status'))
  return json
}

export async function fetchChatHistory(token) {
  const res = await fetch(`${api.defaults.baseURL}/rag/chat/history`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const json = await readJsonResponse(res)
  if (!res.ok) throw new Error(parseApiError(json, 'Failed to load chat history'))
  return json.messages || []
}

export default api
