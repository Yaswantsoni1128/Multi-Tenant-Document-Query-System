import React, { useEffect, useState } from 'react'

export default function ProcessPage({ apiUrl, token, onDone }){
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function runProcess(){
    setRunning(true)
    setResult(null)
    setError(null)
    try{
      const res = await fetch(`${apiUrl}/rag/process`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      const json = await res.json()
      if(!res.ok) throw new Error(json.error || JSON.stringify(json))
      setResult(json)
      if(onDone) onDone(json)
    }catch(e){
      setError(e.message)
    }finally{setRunning(false)}
  }

  useEffect(()=>{ if(token) runProcess() }, [token])

  return (
    <div>
      <div className="card">
        <h3>Processing Documents</h3>
        <p className="muted">This will index your uploaded PDFs and generate embeddings.</p>
        <div style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={runProcess} disabled={running}>{running? 'Processing...' : 'Run Processing'}</button>
        </div>
        {result && <div className="result" style={{ marginTop: 12 }}>
          <div>Message: {result.message}</div>
          <div>Total documents: {result.total_documents}</div>
          <div>Total chunks: {result.total_chunks}</div>
        </div>}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  )
}
