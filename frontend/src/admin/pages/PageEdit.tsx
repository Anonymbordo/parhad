import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getContent, updatePages, genId, slugify, type Page } from '../store'
import RichEditor from '../components/RichEditor'

const EMPTY: Page = {
  id: '', title: '', slug: '', content: '',
  status: 'draft', template: 'default',
  date: new Date().toLocaleDateString('tr-TR'), order: 0,
}

export default function PageEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const content = getContent()
  const existing = !isNew ? content?.pages.find(p => p.id === id) : null
  const [page, setPage] = useState<Page>(existing ?? { ...EMPTY, id: genId() })
  const [saving, setSaving] = useState(false)

  function handleSave(status?: Page['status']) {
    if (!content) return
    setSaving(true)
    const final = { ...page, status: status ?? page.status }
    if (!final.slug && final.title) final.slug = slugify(final.title)

    let updated: Page[]
    if (isNew) {
      updated = [final, ...content.pages]
    } else {
      updated = content.pages.map(p => p.id === final.id ? final : p)
    }
    updatePages(updated)
    setTimeout(() => { setSaving(false); navigate('/admin/site-pages') }, 400)
  }

  return (
    <div className="pe-wrap">
      <div className="pe-header">
        <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => navigate('/admin/site-pages')}>← Sayfalara Dön</button>
        <h2>{isNew ? 'Yeni Sayfa' : 'Sayfayı Düzenle'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="a-btn a-btn-ghost" onClick={() => handleSave('draft')} disabled={saving}>Taslak</button>
          <button className="a-btn a-btn-primary" onClick={() => handleSave('published')} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Yayınla'}
          </button>
        </div>
      </div>

      <div className="pe-layout">
        <div className="pe-main">
          <input className="pe-title-input" placeholder="Sayfa başlığı"
            value={page.title}
            onChange={e => setPage({ ...page, title: e.target.value, slug: slugify(e.target.value) })} />
          <div className="pe-slug-row">
            <span>Kalıcı bağlantı:</span>
            <span className="pe-slug-val">/{page.slug || 'sayfa-basligi'}</span>
            <button className="a-btn a-btn-ghost a-btn-sm" type="button"
              onClick={() => { const s = prompt('Slug:', page.slug); if (s !== null) setPage({ ...page, slug: slugify(s) }) }}>
              Düzenle
            </button>
          </div>
          <RichEditor content={page.content} onChange={html => setPage({ ...page, content: html })}
            placeholder="Sayfa içeriğini buraya yazın..." />
        </div>

        <aside className="pe-sidebar">
          <div className="a-card" style={{ marginBottom: '1rem' }}>
            <div className="a-card-head"><h3>Sayfa Özellikleri</h3></div>
            <div className="a-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="a-field">
                <label>Durum</label>
                <select className="a-input" value={page.status}
                  onChange={e => setPage({ ...page, status: e.target.value as Page['status'] })}>
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                  <option value="trash">Çöp</option>
                </select>
              </div>
              <div className="a-field">
                <label>Şablon</label>
                <select className="a-input" value={page.template}
                  onChange={e => setPage({ ...page, template: e.target.value as Page['template'] })}>
                  <option value="default">Varsayılan</option>
                  <option value="full-width">Tam Genişlik</option>
                  <option value="landing">Landing Page</option>
                </select>
              </div>
              <div className="a-field">
                <label>Sıra</label>
                <input type="number" className="a-input" value={page.order}
                  onChange={e => setPage({ ...page, order: Number(e.target.value) })} />
              </div>
              <div className="a-field">
                <label>Tarih</label>
                <input className="a-input" value={page.date}
                  onChange={e => setPage({ ...page, date: e.target.value })} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
