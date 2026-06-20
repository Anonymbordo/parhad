import { useState } from 'react'
import { getContent, updateComments } from '../store'

type Filter = 'all' | 'approved' | 'pending' | 'spam' | 'trash'

export default function Comments() {
  const [content, setContent] = useState(() => getContent())
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const all = content?.comments ?? []
  const filtered = all.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search && !c.content.toLowerCase().includes(search.toLowerCase()) &&
        !c.author.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function refresh() { setContent(getContent()) }

  function setStatus(id: string, status: 'approved' | 'pending' | 'spam' | 'trash') {
    if (!content) return
    updateComments(content.comments.map(c => c.id === id ? { ...c, status } : c))
    refresh()
  }

  function deleteForever(id: string) {
    if (!content || !confirm('Bu yorumu kalıcı olarak silmek istiyor musunuz?')) return
    updateComments(content.comments.filter(c => c.id !== id))
    refresh()
  }

  const counts = {
    all: all.length,
    approved: all.filter(c => c.status === 'approved').length,
    pending: all.filter(c => c.status === 'pending').length,
    spam: all.filter(c => c.status === 'spam').length,
    trash: all.filter(c => c.status === 'trash').length,
  }

  return (
    <>
      <div className="a-page-header"><h2>Yorumlar</h2></div>

      <div className="a-filter-tabs">
        {(['all', 'approved', 'pending', 'spam', 'trash'] as Filter[]).map(f => (
          <button key={f} className={`a-filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Tümü' : f === 'approved' ? 'Onaylı' : f === 'pending' ? 'Bekleyen' : f === 'spam' ? 'Spam' : 'Çöp'}
            <span className="a-filter-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="a-card">
        <div className="a-card-head">
          <input className="a-input" style={{ maxWidth: '280px' }} placeholder="Yorum ara..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <div className="a-empty">Yorum bulunamadı.</div>
        ) : (
          <ul className="a-list">
            {filtered.map(c => (
              <li key={c.id} className="a-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '1rem' }}>
                  <div className="a-list-item-info">
                    <div className="a-list-item-title">{c.author} <span style={{ fontWeight: 400, color: 'rgba(200,215,255,0.4)' }}>&lt;{c.email}&gt;</span></div>
                    <div className="a-list-item-sub">{c.postTitle} · {c.date}</div>
                  </div>
                  <span className={`a-badge ${c.status === 'approved' ? 'a-badge-green' : c.status === 'spam' || c.status === 'trash' ? 'a-badge-red' : ''}`}>
                    {c.status === 'approved' ? 'Onaylı' : c.status === 'pending' ? 'Bekleyen' : c.status === 'spam' ? 'Spam' : 'Çöp'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(220,230,255,0.7)', lineHeight: 1.5 }}>{c.content}</p>
                <div className="a-list-actions">
                  {c.status !== 'approved' && (
                    <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setStatus(c.id, 'approved')}>Onayla</button>
                  )}
                  {c.status !== 'pending' && (
                    <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setStatus(c.id, 'pending')}>Beklet</button>
                  )}
                  {c.status !== 'spam' && (
                    <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setStatus(c.id, 'spam')}>Spam</button>
                  )}
                  {c.status !== 'trash' && (
                    <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setStatus(c.id, 'trash')}>Çöp</button>
                  )}
                  <button className="a-btn a-btn-danger a-btn-sm" onClick={() => deleteForever(c.id)}>Kalıcı Sil</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
