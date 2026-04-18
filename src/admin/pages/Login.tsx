import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../useAuth'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (login(password)) {
      navigate('/admin')
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="a-shell a-login">
      <div className="a-login-card">
        <img className="a-login-logo" src="/parhad-logo-horizontal.png" alt="PARHAD" />
        <h1>Admin Paneli</h1>
        <p>Devam etmek için şifrenizi girin</p>

        {error && (
          <div className="a-login-error">Şifre hatalı. Tekrar deneyin.</div>
        )}

        <form onSubmit={handleSubmit} className="a-form">
          <div className="a-field">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              className="a-input"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              placeholder="••••••••"
              autoFocus
            />
          </div>
          <button className="a-btn a-btn-primary a-btn-full" type="submit">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  )
}
