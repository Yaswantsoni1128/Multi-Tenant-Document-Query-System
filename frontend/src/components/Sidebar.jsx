import React from 'react'
import UploadPanel from './UploadPanel'

export default function Sidebar({ apiUrl }){
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <h4>Upload</h4>
        <UploadPanel apiUrl={apiUrl} />
        <div className="meta mt-4">
          <div>Documents: <strong>0</strong></div>
          <div>Status: <span className="muted">Idle</span></div>
        </div>
      </div>
    </aside>
  )
}
