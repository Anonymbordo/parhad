import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from './useAuth'
import './admin.css'

export default function AdminLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="a-shell a-layout">
      <aside className="a-sidebar">
        <img className="a-sidebar-logo" src="/parhad-logo-horizontal.png" alt="PARHAD" />

        <p className="a-sidebar-label">Genel</p>
        <nav>
          <NavLink className={({ isActive }) => `a-nav-link${isActive ? ' active' : ''}`} to="/admin" end>
            <span className="a-nav-icon">◈</span> Dashboard
          </NavLink>

          <p className="a-sidebar-label">İçerik</p>
          <NavLink className={({ isActive }) => `a-nav-link${isActive ? ' active' : ''}`} to="/admin/events">
            <span className="a-nav-icon">◉</span> Etkinlikler
          </NavLink>
          <NavLink className={({ isActive }) => `a-nav-link${isActive ? ' active' : ''}`} to="/admin/bulletins">
            <span className="a-nav-icon">◈</span> Bültenler
          </NavLink>
          <NavLink className={({ isActive }) => `a-nav-link${isActive ? ' active' : ''}`} to="/admin/pages">
            <span className="a-nav-icon">▣</span> İçerik Kartları
          </NavLink>
          <NavLink className={({ isActive }) => `a-nav-link${isActive ? ' active' : ''}`} to="/admin/navigation">
            <span className="a-nav-icon">≡</span> Navigasyon
          </NavLink>

          <p className="a-sidebar-label">Site</p>
          <a className="a-nav-link" href="/" target="_blank" rel="noreferrer">
            <span className="a-nav-icon">↗</span> Siteyi Görüntüle
          </a>
        </nav>

        <div className="a-sidebar-bottom">
          <button className="a-nav-link a-btn-danger" style={{ border: 'none' }} onClick={handleLogout}>
            <span className="a-nav-icon">⏻</span> Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="a-main">
        <Outlet />
      </main>
    </div>
  )
}
