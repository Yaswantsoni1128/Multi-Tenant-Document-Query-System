import { useEffect, useState, useCallback } from 'react'
import AuthPage from './pages/AuthPage'
import UploadPage from './pages/UploadPage'
import ChatPage from './pages/ChatPage'
import RightPanel from './components/RightPanel'
import { useAuth } from './lib/auth'
import { checkHealth, processDocuments, fetchRagStatus } from './lib/api'

function mapProcessStatus(status) {
  if (status === 'ready') return 'ready'
  if (status === 'uploaded') return 'idle'
  return 'idle'
}

export default function App() {
  const { user, token, logout, ready } = useAuth()
  const [serverStatus, setServerStatus] = useState('connecting')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [processStatus, setProcessStatus] = useState('idle')
  const [processResult, setProcessResult] = useState(null)
  const [processError, setProcessError] = useState(null)
  const [lastChatMeta, setLastChatMeta] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(false)

  const loadSession = useCallback(async () => {
    if (!token) return
    setSessionLoading(true)
    try {
      const status = await fetchRagStatus(token)
      setUploadedFiles(status.files || [])
      setProcessStatus(mapProcessStatus(status.process_status))

      if (status.process_status === 'ready') {
        setProcessResult({
          message: 'Documents indexed',
          total_documents: status.total_documents,
          total_chunks: status.total_chunks,
        })
      } else {
        setProcessResult(null)
      }
      setProcessError(null)
    } catch {
      setUploadedFiles([])
      setProcessStatus('idle')
      setProcessResult(null)
    } finally {
      setSessionLoading(false)
    }
  }, [token])

  useEffect(() => {
    checkHealth()
      .then((msg) => setServerStatus(msg))
      .catch(() => setServerStatus('offline'))
  }, [])

  useEffect(() => {
    if (token && user) loadSession()
  }, [token, user, loadSession])

  const runProcess = useCallback(async () => {
    if (!token) return
    setProcessStatus('processing')
    setProcessError(null)
    setProcessResult(null)
    try {
      const result = await processDocuments(token)
      setProcessResult(result)
      setProcessStatus('ready')
      setUploadedFiles(result.files || [])
    } catch (err) {
      setProcessError(err.message)
      setProcessStatus('error')
    }
  }, [token])

  function handleLogout() {
    logout()
    setUploadedFiles([])
    setProcessStatus('idle')
    setProcessResult(null)
    setProcessError(null)
    setLastChatMeta(null)
  }

  function handleUploaded(files) {
    setUploadedFiles(files)
    setProcessStatus('idle')
    setProcessResult(null)
    setProcessError(null)
  }

  if (!ready) {
    return (
      <div className="app-loading">
        <span>Loading…</span>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  const stepUpload = uploadedFiles.length > 0 ? 'done' : 'active'
  const stepProcess =
    processStatus === 'ready'
      ? 'done'
      : processStatus === 'processing'
        ? 'active'
        : processStatus === 'error'
          ? 'error'
          : uploadedFiles.length > 0
            ? 'active'
            : ''
  const stepChat = processStatus === 'ready' ? 'active' : ''

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand">Multi-Tenant Document Query System</div>
        <div className="topbar-actions">
          <span className="muted">
            <span className={`status-dot ${serverStatus === 'offline' ? 'offline' : 'online'}`} />
            {serverStatus === 'offline' ? 'Backend offline' : serverStatus}
          </span>
          <span className="muted">{user.email}</span>
          <button type="button" className="btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="app-body">
        <div className="workflow-steps">
          <div className={`step ${stepUpload}`}>1. Upload PDFs</div>
          <div className={`step ${stepProcess}`}>2. Process & Index</div>
          <div className={`step ${stepChat}`}>3. Chat</div>
        </div>

        <main className="layout">
          <aside className="sidebar column-scroll">
            {sessionLoading ? (
              <div className="card muted">Loading your documents…</div>
            ) : (
              <UploadPage
                token={token}
                uploadedFiles={uploadedFiles}
                onUploaded={handleUploaded}
                processStatus={processStatus}
                processError={processError}
                processResult={processResult}
                onProcess={runProcess}
              />
            )}
          </aside>

          <section className="center column-scroll">
            <ChatPage
              token={token}
              canChat={processStatus === 'ready'}
              processStatus={processStatus}
              sessionLoading={sessionLoading}
              onChatComplete={setLastChatMeta}
            />
          </section>

          <aside className="rightpanel column-scroll">
            <RightPanel
              uploadedFiles={uploadedFiles}
              processStatus={processStatus}
              processResult={processResult}
              lastChatMeta={lastChatMeta}
            />
          </aside>
        </main>
      </div>
    </div>
  )
}
