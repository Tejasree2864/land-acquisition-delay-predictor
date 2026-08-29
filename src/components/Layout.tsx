import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LayoutDashboard, Map, Sparkles, LandPlot, LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/parcels', label: 'Land Parcels', icon: Map, end: false },
  { to: '/predict', label: 'Risk Predictor', icon: Sparkles, end: false },
]

const titles: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Overview Dashboard', sub: 'Portfolio-wide land acquisition risk at a glance' },
  '/parcels': { title: 'Land Parcels', sub: 'Monitor and filter every acquisition case' },
  '/predict': { title: 'Risk Predictor', sub: 'Run a what-if delay-risk assessment' },
}

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const initials = (user?.name ?? 'LA')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const head =
    titles[pathname] ??
    (pathname.startsWith('/parcels/')
      ? { title: 'Parcel Detail', sub: 'Full risk breakdown and prediction' }
      : { title: 'LandWatch', sub: '' })

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo">
            <LandPlot size={22} />
          </div>
          <div>
            <h1>LandWatch</h1>
            <span>Delay Prediction Suite</span>
          </div>
        </div>

        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <n.icon size={18} />
            {n.label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          Predictive Analytics System<br />
          for Early Detection of Land Acquisition Delays
        </div>
      </aside>

      <div className="main">
        <header className="header">
          <div>
            <h2>{head.title}</h2>
            {head.sub && <div className="subtitle">{head.sub}</div>}
          </div>
          <div className="header-right">
            {user && (
              <div className="user-box">
                <div className="user-meta">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <div className="avatar">{initials}</div>
              </div>
            )}
            <button className="logout-btn" onClick={handleLogout} title="Sign out">
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}
