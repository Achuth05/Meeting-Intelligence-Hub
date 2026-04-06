import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Topbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const initial = (user?.username || user?.email)?.[0]?.toUpperCase() || 'U'

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/upload', label: 'Upload' },
  ]

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(15,17,23,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', height: '56px', gap: '16px'
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          textDecoration: 'none', flexShrink: 0
        }}>
          <div style={{
            width: '28px', height: '28px', background: 'var(--accent)',
            borderRadius: '7px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: '800', fontSize: '14px', color: 'white'
          }}>M</div>
          <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-h)' }}>
            Meet<span style={{ color: 'var(--accent)' }}>Cognit</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav style={{ display: 'flex', gap: '4px' }} className="topbar-nav">
          {navItems.map(item => {
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

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Desktop user info + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="topbar-user">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0
            }}>{initial}</div>
            <div className="topbar-username">
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
            fontFamily: 'var(--font)', whiteSpace: 'nowrap'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
          >
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="topbar-hamburger"
          style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: '7px', padding: '6px 10px', color: 'var(--text-h)',
            fontSize: '16px', cursor: 'pointer', lineHeight: 1
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '56px', left: 0, right: 0,
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          zIndex: 99, padding: '12px 16px',
          display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
                fontWeight: '500', display: 'block',
                color: location.pathname === item.path ? 'var(--accent)' : 'var(--text-h)',
                background: location.pathname === item.path ? 'var(--accent-bg)' : 'var(--surface2)',
                border: '1px solid var(--border)'
              }}
            >
              {item.label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', color: 'white'
              }}>{initial}</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>
                  {user?.username || user?.email?.split('@')[0]}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{user?.email}</p>
              </div>
            </div>
            <button onClick={() => { logout(); setMenuOpen(false) }} style={{
              padding: '6px 14px', borderRadius: '7px', fontSize: '13px',
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
              color: 'var(--danger)', cursor: 'pointer', fontFamily: 'var(--font)'
            }}>
              Logout
            </button>
          </div>
        </div>
      )}

      <style>{`
        .topbar-hamburger { display: none; }
        @media (max-width: 640px) {
          .topbar-nav { display: none; }
          .topbar-user { display: none; }
          .topbar-hamburger { display: flex; }
          .topbar-username { display: none; }
        }
        @media (min-width: 641px) {
          .topbar-hamburger { display: none; }
        }
      `}</style>
    </>
  )
}