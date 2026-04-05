import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const resetMessages = () => { setErrorMessage(''); setSuccessMessage('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    resetMessages()
    setIsLoading(true)
    try {
      if (isForgotPassword) {
        if (!email) throw new Error('Please enter your email address')
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`,
          { email }
        )
        setSuccessMessage('Password reset link sent! Check your email.')
        return
      }
      if (isLogin) {
        if (!email || !password) throw new Error('Please fill in all fields')
        await login(email, password)
        navigate('/dashboard')
      } else {
        if (!username) throw new Error('Please enter a username')
        if (!email || !password || !confirmPassword) throw new Error('Please fill in all fields')
        if (password !== confirmPassword) throw new Error('Passwords do not match')
        if (password.length < 6) throw new Error('Password must be at least 6 characters')
        await register(email, password, username)
        setSuccessMessage('Account created! Redirecting...')
        setTimeout(() => navigate('/dashboard'), 1500)
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const switchTab = (loginMode) => {
    setIsLogin(loginMode)
    setIsForgotPassword(false)
    setUsername('')
    resetMessages()
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 30% 40%, rgba(79,142,247,0.07) 0%, transparent 60%)'
      }} />

      <Link to="/" style={{
        position: 'fixed', top: '24px', left: '32px',
        color: 'var(--text)', fontSize: '14px', display: 'flex',
        alignItems: 'center', gap: '6px', transition: 'color 0.15s', textDecoration: 'none'
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-h)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
      >
        ← Back
      </Link>

      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        animation: 'fadeUp 0.3s ease', position: 'relative', zIndex: 1
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '44px', height: '44px', background: 'var(--accent)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '20px', fontWeight: '800',
            color: 'white', margin: '0 auto 12px'
          }}>M</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-h)' }}>
            Meet<span style={{ color: 'var(--accent)' }}>Cognit</span>
          </h2>
          {isForgotPassword && (
            <p style={{ fontSize: '13px', color: 'var(--text)', marginTop: '6px' }}>
              Enter your email to reset your password
            </p>
          )}
        </div>

        {/* Tabs */}
        {!isForgotPassword && (
          <div style={{
            display: 'flex', gap: '4px', background: 'var(--surface2)',
            padding: '4px', borderRadius: '10px', marginBottom: '28px'
          }}>
            {['Login', 'Sign Up'].map((label, i) => {
              const active = (i === 0) === isLogin
              return (
                <button key={label} onClick={() => switchTab(i === 0)} style={{
                  flex: 1, padding: '9px', border: 'none', borderRadius: '7px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                  background: active ? 'var(--surface)' : 'transparent',
                  color: active ? 'var(--text-h)' : 'var(--text)',
                  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                  fontFamily: 'var(--font)'
                }}>{label}</button>
              )
            })}
          </div>
        )}

        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {!isLogin && !isForgotPassword && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-h)', marginBottom: '6px' }}>Username</label>
              <input type="text" className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. johndoe" minLength={2} required />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-h)', marginBottom: '6px' }}>Email Address</label>
            <input type="email" className="input" value={email} required onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>

          {!isForgotPassword && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-h)', marginBottom: '6px' }}>Password</label>
              <input type="password" className="input" value={password} required onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              {!isLogin && <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Minimum 6 characters</p>}
            </div>
          )}

          {!isLogin && !isForgotPassword && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-h)', marginBottom: '6px' }}>Confirm Password</label>
              <input type="password" className="input" value={confirmPassword} required onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
            </div>
          )}

          {isLogin && !isForgotPassword && (
            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <button type="button"
                onClick={() => { setIsForgotPassword(true); resetMessages() }}
                style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font)', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px', marginTop: '4px' }}
          >
            {isLoading
              ? <><span className="spinner" /> {isForgotPassword ? 'Sending...' : isLogin ? 'Logging in...' : 'Creating account...'}</>
              : isForgotPassword ? 'Send Reset Link →' : isLogin ? 'Login →' : 'Create Account →'
            }
          </button>
        </form>

        {isForgotPassword && (
          <button type="button"
            onClick={() => { setIsForgotPassword(false); resetMessages() }}
            style={{
              width: '100%', marginTop: '16px', padding: '10px',
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: '8px', fontSize: '14px', color: 'var(--text)',
              cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text-h)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
          >
            ← Back to Login
          </button>
        )}

        {!isLogin && !isForgotPassword && (
          <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', marginTop: '20px', lineHeight: 1.6 }}>
            By signing up you agree to our{' '}
            <a href="#terms" style={{ color: 'var(--accent)' }}>Terms</a> and{' '}
            <a href="#privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</a>
          </p>
        )}
      </div>
    </div>
  )
}