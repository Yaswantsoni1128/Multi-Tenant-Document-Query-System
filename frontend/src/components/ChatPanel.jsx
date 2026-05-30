import { useEffect, useRef, useState } from 'react'
import { chatWithDocuments, fetchChatHistory } from '../lib/api'

export default function ChatPanel({ token, canChat, sessionLoading, onChatComplete }) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!token) {
      setMessages([])
      return
    }

    let cancelled = false
    setHistoryLoading(true)

    fetchChatHistory(token)
      .then((history) => {
        if (!cancelled) {
          setMessages(
            history.map((msg) => ({
              role: msg.role,
              content: msg.content,
              sources: msg.sources_used,
            }))
          )
        }
      })
      .catch(() => {
        if (!cancelled) setMessages([])
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendQuestion() {
    const q = question.trim()
    if (!q || !canChat || loading) return

    setLoading(true)
    setError(null)
    setQuestion('')
    setMessages((prev) => [...prev, { role: 'user', content: q }])

    try {
      const json = await chatWithDocuments(q, token)
      const answer = json.answer || 'No answer returned.'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer,
          sources: json.sources_used,
        },
      ])
      onChatComplete?.({
        question: q,
        answer,
        sourcesUsed: json.sources_used,
      })
    } catch (err) {
      setError(err.message)
      setMessages((prev) => prev.slice(0, -1))
      setQuestion(q)
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendQuestion()
    }
  }

  return (
    <>
      <div className="chat-messages">
        {historyLoading || sessionLoading ? (
          <div className="chat-empty">
            <p>Loading chat history…</p>
          </div>
        ) : messages.length === 0 && !loading ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <p>
              {canChat
                ? 'Ask anything about your uploaded documents.'
                : 'Complete upload and processing to start chatting.'}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              <div className="label">{msg.role === 'user' ? 'You' : 'Assistant'}</div>
              <div>{msg.content}</div>
              {msg.sources != null && (
                <div className="meta">Sources used: {msg.sources}</div>
              )}
            </div>
          ))
        )}

        {loading && <div className="typing-indicator">Thinking…</div>}
        <div ref={bottomRef} />
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="chat-composer">
        <div className="chat-input-box">
          <textarea
            placeholder={
              canChat
                ? 'Ask a question… (Enter to send, Shift+Enter for new line)'
                : 'Process documents first to enable chat'
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={!canChat || loading}
            rows={2}
          />
          <div className="chat-input-actions">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setQuestion('')}
              disabled={loading || !question}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-sm primary"
              onClick={sendQuestion}
              disabled={!canChat || loading || !question.trim()}
            >
              {loading ? '…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
