import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { LandPlot, Lock, User, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Already signed in → go straight to the app
  if (user) return <Navigate to="/" replace />

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    // small delay to mimic a real auth round-trip
    setTimeout(() => {
      const res = login(username, password)
      setBusy(false)
      if (res.ok) navigate(from, { replace: true })
      else setError(res.error ?? 'Login failed.')
    }, 400)
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo"><LandPlot size={30} /></div>
          <div>
            <h1>LandWatch</h1>
            <span>Delay Prediction Suite</span>
          </div>
        </div>
        <h2 className="login-hero">Predictive Analytics for Early Detection of Land Acquisition Delays</h2>
        <p className="login-hero-sub">
          A restricted-access government portal that forecasts acquisition delays,
          explains the underlying risk factors, and recommends timely interventions.
        </p>
        <ul className="login-points">
          <li><ShieldCheck size={17} /> Authorized government personnel only</li>
          <li><ShieldCheck size={17} /> Portfolio-wide risk monitoring</li>
          <li><ShieldCheck size={17} /> Explainable, auditable predictions</li>
        </ul>
        <div className="login-gov-note">Government of India · Restricted Use</div>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={onSubmit}>
          <div className="login-card-head">
            <div className="login-lock"><Lock size={20} /></div>
            <h3>Secure Sign In</h3>
            <p>Enter your authorized credentials to continue</p>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="login-field">
            <label>Username / Employee ID</label>
            <div className="login-input">
              <User size={17} />
              <input
                type="text"
                autoComplete="username"
                placeholder="e.g. officer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="login-input">
              <Lock size={17} />
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="login-eye" onClick={() => setShowPw((s) => !s)} aria-label="Toggle password visibility">
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button className="login-submit" type="submit" disabled={busy}>
            {busy ? 'Verifying…' : 'Sign In'}
          </button>

          <div className="login-demo">
            <strong>Demo credentials</strong>
            <span>admin / landwatch@2025</span>
            <span>officer / gov@2025</span>
          </div>

          <div className="login-footer-note">
            Unauthorized access is prohibited and may be monitored.
          </div>
        </form>
      </div>
    </div>
  )
}
