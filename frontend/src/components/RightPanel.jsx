function statusBadge(status) {
  switch (status) {
    case 'ready':
      return <span className="badge success">Ready</span>
    case 'processing':
      return <span className="badge warning">Processing</span>
    case 'error':
      return <span className="badge" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>Error</span>
    default:
      return <span className="badge muted">Idle</span>
  }
}

export default function RightPanel({ uploadedFiles, processStatus, processResult, lastChatMeta }) {
  return (
    <>
      <div className="card">
        <div className="section-title">Pipeline Status</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {statusBadge(processStatus)}
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            {processStatus === 'ready'
              ? 'Index built — chat enabled'
              : processStatus === 'processing'
                ? 'Building embeddings…'
                : uploadedFiles?.length
                  ? 'Ready to process'
                  : 'Waiting for uploads'}
          </span>
        </div>

        {processResult && (
          <div className="stats-grid">
            <div className="stat-box">
              <div className="value">{processResult.total_documents ?? '—'}</div>
              <div className="label">Documents</div>
            </div>
            <div className="stat-box">
              <div className="value">{processResult.total_chunks ?? '—'}</div>
              <div className="label">Chunks</div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="section-title">Documents</div>
        {!uploadedFiles?.length ? (
          <p className="muted">No files uploaded.</p>
        ) : (
          <ul className="file-list">
            {uploadedFiles.map((name) => (
              <li key={name}>
                <span>{name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <div className="section-title">Last Response</div>
        {!lastChatMeta ? (
          <p className="muted">Ask a question to see source info here.</p>
        ) : (
          <>
            <p style={{ margin: '0 0 8px', fontSize: '0.875rem' }}>
              <strong>Q:</strong> {lastChatMeta.question}
            </p>
            <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
              Retrieved {lastChatMeta.sourcesUsed} context chunk
              {lastChatMeta.sourcesUsed === 1 ? '' : 's'} for this answer.
            </p>
          </>
        )}
      </div>
    </>
  )
}
