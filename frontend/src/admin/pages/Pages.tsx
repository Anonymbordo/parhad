import { useState } from 'react'
import { getContent, updateOverflowPages, type OverflowPage } from '../store'

const EMPTY: OverflowPage = { eyebrow: '', title: '', body: '', meta: '' }

export default function Pages() {
  const [content, setContent] = useState(() => getContent())
  const [editing, setEditing] = useState<(OverflowPage & { idx: number }) | null>(null)
  const [isNew, setIsNew] = useState(false)

  const pages = content?.overflowPages ?? []
  function refresh() { setContent(getContent()) }

  function openEdit(idx: number) {
    setEditing({ ...pages[idx], idx })
    setIsNew(false)
  }

  function openNew() {
    setEditing({ ...EMPTY, idx: -1 })
    setIsNew(true)
  }

  function closeDrawer() { setEditing(null) }

  function handleSave() {
    if (!editing || !content) return
    let updated: OverflowPage[]
    const { idx, ...page } = editing
    if (isNew) {
      updated = [...pages, page]
    } else {
      updated = pages.map((p, i) => i === idx ? page : p)
    }
    updateOverflowPages(updated)
    refresh()
    closeDrawer()
  }

  function handleDelete(idx: number) {
    if (!content) return
    updateOverflowPages(pages.filter((_, i) => i !== idx))
    refresh()
  }

  return (
    <>
      <div className="a-page-header">
        <h2>İçerik Kartları</h2>
        <button className="a-btn a-btn-primary" onClick={openNew}>+ Yeni Kart</button>
      </div>

      <div className="a-card">
        {pages.length === 0 ? (
          <div className="a-empty">Henüz içerik kartı yok.</div>
        ) : (
          <ul className="a-list">
            {pages.map((p, idx) => (
              <li key={idx} className="a-list-item">
                <div className="a-list-item-info">
                  <div className="a-list-item-title">{p.title}</div>
                  <div className="a-list-item-sub">{p.eyebrow} · {p.meta}</div>
                </div>
                <div className="a-list-actions">
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => openEdit(idx)}>Düzenle</button>
                  <button className="a-btn a-btn-danger a-btn-sm" onClick={() => handleDelete(idx)}>✕</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <div className="a-drawer">
          <div className="a-drawer-card">
            <div className="a-drawer-head">
              <h3>{isNew ? 'Yeni Kart' : 'Kartı Düzenle'}</h3>
              <button className="a-btn a-btn-ghost a-btn-sm" onClick={closeDrawer}>✕ Kapat</button>
            </div>
            <div className="a-form">
              <div className="a-field">
                <label>Üst Başlık (Eyebrow)</label>
                <input className="a-input" value={editing.eyebrow}
                  onChange={e => setEditing({ ...editing, eyebrow: e.target.value })} placeholder="ör. BÜLTEN" />
              </div>
              <div className="a-field">
                <label>Başlık</label>
                <input className="a-input" value={editing.title}
                  onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="a-field">
                <label>Açıklama</label>
                <textarea className="a-input a-textarea" value={editing.body}
                  onChange={e => setEditing({ ...editing, body: e.target.value })} />
              </div>
              <div className="a-field">
                <label>Meta (ör. Canlı akış, 12 kayıt)</label>
                <input className="a-input" value={editing.meta}
                  onChange={e => setEditing({ ...editing, meta: e.target.value })} />
              </div>
              <div className="a-form-actions">
                <button className="a-btn a-btn-primary" onClick={handleSave}>
                  {isNew ? 'Ekle' : 'Kaydet'}
                </button>
                <button className="a-btn a-btn-ghost" onClick={closeDrawer}>İptal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
