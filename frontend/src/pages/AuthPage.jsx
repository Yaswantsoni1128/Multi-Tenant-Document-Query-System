import { useState } from 'react'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'
import { useAuth } from '../lib/auth'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const { login } = useAuth()

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <div className="auth-header">
          <div>
            <h2 style={{ margin: 0 }}>Multi-Tenant Document Query System</h2>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              Sign in to upload documents and chat with your knowledge base
            </p>
          </div>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        {mode === 'login' ? (
          <LoginForm onLoggedIn={login} />
        ) : (
          <RegisterForm onRegistered={login} />
        )}
      </div>
    </div>
  )
}
