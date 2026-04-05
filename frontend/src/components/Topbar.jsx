import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Topbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const initial = (user?.username || user?.email)?.[0]?.toUpperCase() || 'U'

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(15,17,23,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 32px', height: '56px', gap: '24px'
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{
        display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none'
      }}>
        <div style={{
          width: '28px', height: '28px', background: 'var(--accent)',
          borderRadius: '7px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: '800', fontSize: '14px',
          color: 'white', flexShrink: 0
        }}>M</div>
        <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-h)' }}>
          Meet<span style={{ color: 'var(--accent)' }}>Cognit</span>
        </span>
      </Link>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: '4px', flex: 1 }}>
        {[
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/upload', label: 'Upload' },
        ].map(item => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} style={{
              padding: '6px 14px', borderRadius: '7px', fontSize: '14px',
              fontWeight: '500', textDecoration: 'none', transition: 'all 0.15s',
              background: active ? 'var(--accent-bg)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text)',
              border: active ? '1px solid var(--accent-border)' : '1px solid transparent'
            }}>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Right side — user + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0
          }}>{initial}</div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-h)', lineHeight: 1 }}>
              {user?.username || user?.email?.split('@')[0]}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button onClick={logout} style={{
          padding: '6px 12px', borderRadius: '7px', fontSize: '13px',
          background: 'transparent', border: '1px solid var(--border)',
          color: 'var(--text)', cursor: 'pointer', transition: 'all 0.15s',
          fontFamily: 'var(--font)'
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}