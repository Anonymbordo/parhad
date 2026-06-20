import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getContent, updatePages } from '../store'

export default function SitePages() {
  const navigate = useNavigate()
  const [content, setContent] = useState(() => getContent())
  const [search, setSearch] = useState('')

  const allPages = content?.pages ?? []
  const filtered = allPages.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  )

  function refresh() { setContent(getContent()) }

  function moveToTrash(id: string) {
    if (!content) return
    updatePages(content.pages.map(p => p.id === id ? { ...p, status: 'trash' } : p))
    refresh()
  }

  function deleteForever(id: string) {
    if (!content || !confirm('Bu sayfayı kalıcı olarak silmek istiyor musunuz?')) return
    updatePages(content.pages.filter(p => p.id !== id))
    refresh()
  }

  function restore(id: string) {
    if (!content) return
    updatePages(content.pages.map(p => p.id === id ? { ...p, status: 'draft' } : p))
    refresh()
  }

  return (
    <>
      <div className="a-page-header">
        <h2>Sayfalar</h2>
        <button className="a-btn a-btn-primary" onClick={() => navigate('/admin/site-pages/new')}>+ Yeni Sayfa</button>
      </div>

      <div className="a-card">
        <div className="a-card-head">
          <input className="a-input" style={{ maxWidth: '280px' }} placeholder="Sayfa ara..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <div className="a-empty">Henüz sayfa yok. Yeni sayfa ekleyin.</div>
        ) : (
          <ul className="a-list">
            {filtered.map(page => (
              <li key={page.id} className="a-list-item">
                <div className="a-list-item-info">
                  <div className="a-list-item-title" style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/site-pages/${page.id}`)}>
                    {page.title || '(Başlıksız)'}
                  </div>
                  <div className="a-list-item-sub">/{page.slug} · {page.date}</div>
                </div>
                <span className={`a-badge ${page.status === 'published' ? 'a-badge-green' : page.status === 'trash' ? 'a-badge-red' : ''}`}>
                  {page.status === 'published' ? 'Yayında' : page.status === 'draft' ? 'Taslak' : 'Çöp'}
                </span>
                <div className="a-list-actions">
                  {page.status !== 'trash' ? (
                    <>
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => navigate(`/admin/site-pages/${page.id}`)}>Düzenle</button>
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => moveToTrash(page.id)}>Çöp</button>
                    </>
                  ) : (
                    <>
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => restore(page.id)}>Geri Yükle</button>
                      <button className="a-btn a-btn-danger a-btn-sm" onClick={() => deleteForever(page.id)}>Kalıcı Sil</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
