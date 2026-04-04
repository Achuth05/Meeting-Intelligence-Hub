import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', icon: '▦', label: 'Dashboard' },
    { path: '/upload', icon: '↑', label: 'Upload Meeting' },
  ]

  const initial = user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Meet<span>Cognit</span></h2>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-label">Navigation</span>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initial}</div>
          <div className="user-info">
            <div className="user-email">{user?.username || user?.email?.split('@')[0]}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            ⏻
          </button>
        </div>
      </div>
    </aside>
  )
}