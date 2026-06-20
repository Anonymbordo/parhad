import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getContent, updatePosts, genId, slugify, type Post } from '../store'
import RichEditor from '../components/RichEditor'

const EMPTY: Post = {
  id: '', title: '', slug: '', content: '', excerpt: '',
  status: 'draft', categories: [], tags: [], author: 'Admin',
  date: new Date().toLocaleDateString('tr-TR'),
  featuredImage: '', commentCount: 0,
}

export default function PostEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const content = getContent()
  const existing = !isNew ? content?.posts.find(p => p.id === id) : null

  const [post, setPost] = useState<Post>(existing ?? { ...EMPTY, id: genId() })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  function handleSave(status?: Post['status']) {
    if (!content) return
    setSaving(true)
    const finalPost = { ...post, status: status ?? post.status }
    if (!finalPost.slug && finalPost.title) finalPost.slug = slugify(finalPost.title)

    let updated: Post[]
    if (isNew) {
      updated = [finalPost, ...content.posts]
    } else {
      updated = content.posts.map(p => p.id === finalPost.id ? finalPost : p)
    }
    updatePosts(updated)
    setTimeout(() => { setSaving(false); navigate('/admin/posts') }, 400)
  }

  function addTag() {
    if (!tagInput.trim() || post.tags.includes(tagInput.trim())) return
    setPost({ ...post, tags: [...post.tags, tagInput.trim()] })
    setTagInput('')
  }

  function removeTag(t: string) { setPost({ ...post, tags: post.tags.filter(x => x !== t) }) }

  return (
    <div className="pe-wrap">
      <div className="pe-header">
        <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => navigate('/admin/posts')}>← Yazılara Dön</button>
        <h2>{isNew ? 'Yeni Yazı' : 'Yazıyı Düzenle'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="a-btn a-btn-ghost" onClick={() => handleSave('draft')} disabled={saving}>
            Taslak Kaydet
          </button>
          <button className="a-btn a-btn-primary" onClick={() => handleSave('published')} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Yayınla'}
          </button>
        </div>
      </div>

      <div className="pe-layout">
        <div className="pe-main">
          <input
            className="pe-title-input"
            placeholder="Yazı başlığını girin"
            value={post.title}
            onChange={e => setPost({ ...post, title: e.target.value, slug: slugify(e.target.value) })}
          />
          <div className="pe-slug-row">
            <span>Kalıcı bağlantı:</span>
            <span className="pe-slug-val">/{post.slug || slugify(post.title) || 'yazi-basligi'}</span>
            <button className="a-btn a-btn-ghost a-btn-sm" type="button"
              onClick={() => {
                const s = prompt('Slug:', post.slug)
                if (s !== null) setPost({ ...post, slug: slugify(s) })
              }}>Düzenle</button>
          </div>
          <RichEditor
            content={post.content}
            onChange={html => setPost({ ...post, content: html })}
            placeholder="Yazınızı buraya yazın..."
          />
        </div>

        <aside className="pe-sidebar">
          <div className="a-card" style={{ marginBottom: '1rem' }}>
            <div className="a-card-head"><h3>Yayın Durumu</h3></div>
            <div className="a-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="a-field">
                <label>Durum</label>
                <select className="a-input" value={post.status}
                  onChange={e => setPost({ ...post, status: e.target.value as Post['status'] })}>
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                  <option value="trash">Çöp</option>
                </select>
              </div>
              <div className="a-field">
                <label>Yazar</label>
                <input className="a-input" value={post.author}
                  onChange={e => setPost({ ...post, author: e.target.value })} />
              </div>
              <div className="a-field">
                <label>Tarih</label>
                <input className="a-input" value={post.date}
                  onChange={e => setPost({ ...post, date: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="a-card" style={{ marginBottom: '1rem' }}>
            <div className="a-card-head"><h3>Öne Çıkan Görsel</h3></div>
            <div className="a-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {post.featuredImage && (
                <img src={post.featuredImage} alt="" style={{ width: '100%', borderRadius: '0.5rem', objectFit: 'cover', maxHeight: '140px' }} />
              )}
              <input className="a-input" placeholder="Görsel URL (Amazon S3 hazır)"
                value={post.featuredImage}
                onChange={e => setPost({ ...post, featuredImage: e.target.value })} />
            </div>
          </div>

          <div className="a-card" style={{ marginBottom: '1rem' }}>
            <div className="a-card-head"><h3>Etiketler</h3></div>
            <div className="a-panel">
              <div className="a-tags" style={{ marginBottom: '0.5rem' }}>
                {post.tags.map(t => (
                  <span key={t} className="a-tag">{t}<button onClick={() => removeTag(t)}>×</button></span>
                ))}
                <input className="a-tag-input" placeholder="Etiket ekle..." value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
              </div>
            </div>
          </div>

          <div className="a-card">
            <div className="a-card-head"><h3>Özet</h3></div>
            <div className="a-panel">
              <textarea className="a-input a-textarea" placeholder="Kısa özet..."
                value={post.excerpt} onChange={e => setPost({ ...post, excerpt: e.target.value })} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
