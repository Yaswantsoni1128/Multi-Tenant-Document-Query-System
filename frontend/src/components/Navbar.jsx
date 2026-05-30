import React from 'react'
import { useAuth } from '../lib/auth'

export default function Navbar(){
  const { user, logout } = useAuth()

  return (
    <header className="topbar">
      <div className="brand">Multi-Tenant Document Query System</div>
      <div className="actions">
        {user ? (
          <>
            <div className="user">{user.email}</div>
            <button className="btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <div className="muted">Not signed in</div>
        )}
      </div>
    </header>
  )
}
