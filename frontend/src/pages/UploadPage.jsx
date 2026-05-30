import UploadPanel from '../components/UploadPanel'

export default function UploadPage({
  token,
  uploadedFiles,
  onUploaded,
  processStatus,
  processError,
  processResult,
  onProcess,
}) {
  const canProcess = uploadedFiles.length > 0 && processStatus !== 'processing'
  const isReady = processStatus === 'ready'

  return (
    <>
      <div className="card">
        <h3>Upload Documents</h3>
        <p className="muted">Upload PDF files. After upload, process them to build your search index.</p>
        <UploadPanel token={token} onUploaded={onUploaded} disabled={processStatus === 'processing'} />
      </div>

      <div className="card">
        <h3>Process & Index</h3>
        <p className="muted">
          {uploadedFiles.length === 0
            ? 'Upload PDFs first, then run processing.'
            : isReady
              ? 'Documents indexed and ready for chat.'
              : 'Extract text, chunk documents, and create embeddings.'}
        </p>

        <div className="btn-group">
          <button
            type="button"
            className="btn primary"
            onClick={onProcess}
            disabled={!canProcess || !token}
          >
            {processStatus === 'processing'
              ? 'Processing…'
              : isReady
                ? 'Re-process documents'
                : 'Process documents'}
          </button>
        </div>

        {processStatus === 'processing' && (
          <div className="alert info">Indexing your documents — this may take a minute…</div>
        )}

        {processError && <div className="alert error">{processError}</div>}

        {processResult && (
          <div className="alert success">
            {processResult.message}
            {' · '}
            {processResult.total_documents} doc(s), {processResult.total_chunks} chunks
          </div>
        )}
      </div>

      <div className="card">
        <h3>Uploaded Files</h3>
        {!uploadedFiles?.length ? (
          <p className="muted">No files uploaded yet.</p>
        ) : (
          <ul className="file-list">
            {uploadedFiles.map((name) => (
              <li key={name}>
                <span>{name}</span>
                <span className="badge muted">PDF</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
