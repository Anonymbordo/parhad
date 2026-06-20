import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getContent, updatePosts } from '../store'

type Filter = 'all' | 'published' | 'draft' | 'trash'

export default function Posts() {
  const navigate = useNavigate()
  const [content, setContent] = useState(() => getContent())
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const allPosts = content?.posts ?? []
  const filtered = allPosts.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function refresh() { setContent(getContent()) }

  function moveToTrash(id: string) {
    if (!content) return
    updatePosts(content.posts.map(p => p.id === id ? { ...p, status: 'trash' } : p))
    refresh()
  }

  function restore(id: string) {
    if (!content) return
    updatePosts(content.posts.map(p => p.id === id ? { ...p, status: 'draft' } : p))
    refresh()
  }

  function deleteForever(id: string) {
    if (!content || !confirm('Bu yazıyı kalıcı olarak silmek istediğinize emin misiniz?')) return
    updatePosts(content.posts.filter(p => p.id !== id))
    refresh()
  }

  const counts = {
    all: allPosts.length,
    published: allPosts.filter(p => p.status === 'published').length,
    draft: allPosts.filter(p => p.status === 'draft').length,
    trash: allPosts.filter(p => p.status === 'trash').length,
  }

  return (
    <>
      <div className="a-page-header">
        <h2>Yazılar</h2>
        <button className="a-btn a-btn-primary" onClick={() => navigate('/admin/posts/new')}>+ Yeni Yazı</button>
      </div>

      <div className="a-filter-tabs">
        {(['all', 'published', 'draft', 'trash'] as Filter[]).map(f => (
          <button key={f} className={`a-filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Tümü' : f === 'published' ? 'Yayında' : f === 'draft' ? 'Taslak' : 'Çöp Kutusu'}
            <span className="a-filter-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="a-card">
        <div className="a-card-head">
          <input className="a-input" style={{ maxWidth: '280px' }} placeholder="Yazı ara..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div className="a-empty">
            {search ? 'Aramanızla eşleşen yazı bulunamadı.' : 'Henüz yazı yok. Yeni yazı ekleyin.'}
          </div>
        ) : (
          <ul className="a-list">
            {filtered.map(post => (
              <li key={post.id} className="a-list-item">
                <div className="a-list-item-info">
                  <div className="a-list-item-title" style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/posts/${post.id}`)}>
                    {post.title || '(Başlıksız)'}
                  </div>
                  <div className="a-list-item-sub">
                    {post.author} · {post.date}
                    {post.tags.length > 0 && <> · {post.tags.slice(0, 3).join(', ')}</>}
                  </div>
                </div>
                <span className={`a-badge ${post.status === 'published' ? 'a-badge-green' : post.status === 'trash' ? 'a-badge-red' : ''}`}>
                  {post.status === 'published' ? 'Yayında' : post.status === 'draft' ? 'Taslak' : 'Çöp'}
                </span>
                <div className="a-list-actions">
                  {post.status !== 'trash' ? (
                    <>
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => navigate(`/admin/posts/${post.id}`)}>Düzenle</button>
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => moveToTrash(post.id)}>Çöp</button>
                    </>
                  ) : (
                    <>
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => restore(post.id)}>Geri Yükle</button>
                      <button className="a-btn a-btn-danger a-btn-sm" onClick={() => deleteForever(post.id)}>Kalıcı Sil</button>
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
