import { useRef, useState } from 'react'
import { uploadFiles } from '../lib/api'

export default function UploadPanel({ token, onUploaded, disabled }) {
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type, text }

  function pickFiles(fileList) {
    const pdfs = Array.from(fileList || []).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    )
    if (pdfs.length === 0 && fileList?.length) {
      setFeedback({ type: 'error', text: 'Only PDF files are supported.' })
      return
    }
    setFiles(pdfs)
    setFeedback(null)
  }

  async function upload() {
    if (files.length === 0) return
    if (!token) {
      setFeedback({ type: 'error', text: 'You must be logged in to upload files.' })
      return
    }

    setLoading(true)
    setFeedback(null)
    try {
      const json = await uploadFiles(files, token)
      setFeedback({ type: 'success', text: json.message || 'Upload successful' })
      setFiles([])
      if (inputRef.current) inputRef.current.value = ''
      onUploaded?.(json.files || [])
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    pickFiles(e.dataTransfer.files)
  }

  return (
    <div>
      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          disabled={disabled || loading}
          onChange={(e) => pickFiles(e.target.files)}
        />
        <p style={{ margin: '0 0 4px', fontWeight: 500 }}>
          {dragOver ? 'Drop PDFs here' : 'Click or drag PDF files here'}
        </p>
        <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
          Multiple files supported
        </p>
      </div>

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f) => (
            <li key={f.name}>
              <span>{f.name}</span>
              <span className="size">{(f.size / 1024).toFixed(1)} KB</span>
            </li>
          ))}
        </ul>
      )}

      <div className="btn-group">
        <button
          type="button"
          className="btn"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || loading}
        >
          Choose files
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={upload}
          disabled={disabled || loading || files.length === 0 || !token}
        >
          {loading ? 'Uploading…' : 'Upload'}
        </button>
      </div>

      {feedback && <div className={`alert ${feedback.type}`}>{feedback.text}</div>}
    </div>
  )
}
