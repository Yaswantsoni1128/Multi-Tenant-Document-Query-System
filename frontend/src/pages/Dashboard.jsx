import React from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import RightPanel from '../components/RightPanel'

export default function Dashboard(){
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return (
    <div className="app-root">
      <Navbar />
      <div className="layout">
        <Sidebar apiUrl={apiUrl} />
        <main className="main-area">
          <ChatArea />
        </main>
        <RightPanel />
      </div>
    </div>
  )
}
