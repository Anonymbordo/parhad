import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from './useAuth'
import './admin.css'

type NavItem = { to: string; icon: string; label: string; end?: boolean }

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: '',
    items: [{ to: '/admin', icon: '◈', label: 'Dashboard', end: true }],
  },
  {
    section: 'İçerik',
    items: [
      { to: '/admin/posts', icon: '✏', label: 'Yazılar' },
      { to: '/admin/site-pages', icon: '▣', label: 'Sayfalar' },
      { to: '/admin/media', icon: '🖼', label: 'Medya' },
      { to: '/admin/files', icon: '📁', label: 'Dosya Gezgini' },
      { to: '/admin/comments', icon: '💬', label: 'Yorumlar' },
    ],
  },
  {
    section: 'Etkinlik & Bülten',
    items: [
      { to: '/admin/events', icon: '◉', label: 'Etkinlikler' },
      { to: '/admin/bulletins', icon: '◈', label: 'Bültenler' },
      { to: '/admin/content-cards', icon: '▤', label: 'İçerik Kartları' },
    ],
  },
  {
    section: 'Yönetim',
    items: [
      { to: '/admin/navigation', icon: '≡', label: 'Header Sayfaları' },
      { to: '/admin/users', icon: '👥', label: 'Kullanıcılar' },
      { to: '/admin/settings', icon: '⚙', label: 'Ayarlar' },
    ],
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  return (
    <div className="a-shell a-layout">
      <aside className="a-sidebar">
        <img className="a-sidebar-logo" src="/parhad-logo-horizontal.png" alt="PARHAD" />

        <nav>
          {NAV.map(group => (
            <div key={group.section}>
              {group.section && <p className="a-sidebar-label">{group.section}</p>}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `a-nav-link${isActive ? ' active' : ''}`}
                >
                  <span className="a-nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="a-sidebar-bottom">
          <a className="a-nav-link" href="/" target="_blank" rel="noreferrer">
            <span className="a-nav-icon">↗</span> Siteyi Görüntüle
          </a>
          <button
            className="a-nav-link"
            style={{ color: 'rgba(255,100,100,0.8)', border: 'none', marginTop: '0.25rem' }}
            onClick={() => { logout(); navigate('/admin/login') }}
          >
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
