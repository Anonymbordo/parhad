import { useNavigate } from 'react-router-dom'
import { getContent } from '../store'

export default function Dashboard() {
  const content = getContent()
  const navigate = useNavigate()

  const eventCount = content?.ribEvents.length ?? 0
  const bulletinCount = content?.overflowBulletins.length ?? 0
  const pageCount = content?.overflowPages.length ?? 0
  const navCount = content?.navLinks.length ?? 0

  return (
    <>
      <div className="a-page-header">
        <h2>Dashboard</h2>
        <span style={{ fontSize: '0.8rem', color: 'rgba(200,215,255,0.4)' }}>
          PARHAD Admin Paneli
        </span>
      </div>

      <div className="a-stats">
        <div className="a-stat">
          <div className="a-stat-num">{eventCount}</div>
          <div className="a-stat-label">Etkinlik</div>
        </div>
        <div className="a-stat">
          <div className="a-stat-num">{bulletinCount}</div>
          <div className="a-stat-label">Bülten Şeridi</div>
        </div>
        <div className="a-stat">
          <div className="a-stat-num">{pageCount}</div>
          <div className="a-stat-label">İçerik Kartı</div>
        </div>
        <div className="a-stat">
          <div className="a-stat-num">{navCount}</div>
          <div className="a-stat-label">Nav Bağlantısı</div>
        </div>
      </div>

      <div className="a-card">
        <div className="a-card-head">
          <h3>Hızlı Erişim</h3>
        </div>
        <ul className="a-list">
          {[
            { label: 'Etkinlikleri Düzenle', sub: 'Vertebral node etkinlikleri', path: '/admin/events' },
            { label: 'Bültenleri Düzenle', sub: 'Kayan bülten şeritleri', path: '/admin/bulletins' },
            { label: 'İçerik Kartları', sub: 'Alt bölüm kart içerikleri', path: '/admin/pages' },
            { label: 'Navigasyon Bağlantıları', sub: 'Üst menü linkleri', path: '/admin/navigation' },
          ].map(item => (
            <li key={item.path} className="a-list-item" style={{ cursor: 'pointer' }} onClick={() => navigate(item.path)}>
              <div className="a-list-item-info">
                <div className="a-list-item-title">{item.label}</div>
                <div className="a-list-item-sub">{item.sub}</div>
              </div>
              <span style={{ color: 'rgba(200,215,255,0.3)', fontSize: '1rem' }}>›</span>
            </li>
          ))}
        </ul>
      </div>

      {content && (
        <div className="a-card">
          <div className="a-card-head">
            <h3>Son Etkinlikler</h3>
            <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => navigate('/admin/events')}>
              Tümünü Gör
            </button>
          </div>
          <ul className="a-list">
            {content.ribEvents.slice(0, 4).map(ev => (
              <li key={ev.id} className="a-list-item">
                <span className="a-badge">{ev.level}</span>
                <div className="a-list-item-info">
                  <div className="a-list-item-title">{ev.title}</div>
                  <div className="a-list-item-sub">{ev.meta}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
