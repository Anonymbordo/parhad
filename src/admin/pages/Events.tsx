import { useState } from 'react'
import { getContent, updateRibEvents, type RibEvent } from '../store'

const EMPTY_EVENT: Omit<RibEvent, 'focus'> & { focus: RibEvent['focus'] } = {
  id: '',
  side: 'left',
  offset: '50%',
  level: '',
  region: '',
  title: '',
  meta: '',
  overview: '',
  slug: '',
  stats: [],
  items: [],
  focus: {
    groupX: 0, groupY: 0,
    cameraX: 0, cameraY: 0, cameraZ: 5.5,
    lookAtY: 0, rotationY: 0, rotationX: 0, fov: 17,
  },
}

export default function Events() {
  const [content, setContent] = useState(() => getContent())
  const [editing, setEditing] = useState<RibEvent | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [statInput, setStatInput] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const events = content?.ribEvents ?? []

  function refresh() {
    setContent(getContent())
  }

  function openNew() {
    setEditing({ ...EMPTY_EVENT, id: `event-${Date.now()}` })
    setIsNew(true)
    setStatInput('')
  }

  function openEdit(ev: RibEvent) {
    setEditing({ ...ev })
    setIsNew(false)
    setStatInput('')
  }

  function closeDrawer() {
    setEditing(null)
    setIsNew(false)
  }

  function handleSave() {
    if (!editing || !content) return
    let updated: RibEvent[]
    if (isNew) {
      updated = [...events, editing]
    } else {
      updated = events.map(e => e.id === editing.id ? editing : e)
    }
    updateRibEvents(updated)
    refresh()
    closeDrawer()
  }

  function handleDelete(id: string) {
    if (!content) return
    updateRibEvents(events.filter(e => e.id !== id))
    refresh()
    setConfirmDelete(null)
  }

  function addStat() {
    if (!editing || !statInput.trim()) return
    setEditing({ ...editing, stats: [...editing.stats, statInput.trim()] })
    setStatInput('')
  }

  function removeStat(i: number) {
    if (!editing) return
    setEditing({ ...editing, stats: editing.stats.filter((_, idx) => idx !== i) })
  }

  function updateItem(i: number, field: string, value: string) {
    if (!editing) return
    const items = editing.items.map((item, idx) =>
      idx === i ? { ...item, [field]: value } : item
    )
    setEditing({ ...editing, items })
  }

  function addItem() {
    if (!editing) return
    setEditing({
      ...editing,
      items: [...editing.items, { kind: 'Makale', title: '', meta: '', blurb: '' }]
    })
  }

  function removeItem(i: number) {
    if (!editing) return
    setEditing({ ...editing, items: editing.items.filter((_, idx) => idx !== i) })
  }

  return (
    <>
      <div className="a-page-header">
        <h2>Etkinlikler</h2>
        <button className="a-btn a-btn-primary" onClick={openNew}>+ Yeni Etkinlik</button>
      </div>

      <div className="a-card">
        {events.length === 0 ? (
          <div className="a-empty">Henüz etkinlik yok. Yeni etkinlik ekleyin.</div>
        ) : (
          <ul className="a-list">
            {events.map(ev => (
              <li key={ev.id} className="a-list-item">
                <span className="a-badge">{ev.level}</span>
                <div className="a-list-item-info">
                  <div className="a-list-item-title">{ev.title}</div>
                  <div className="a-list-item-sub">{ev.meta} · {ev.region}</div>
                </div>
                <div className="a-list-actions">
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => openEdit(ev)}>Düzenle</button>
                  {confirmDelete === ev.id ? (
                    <>
                      <button className="a-btn a-btn-danger a-btn-sm" onClick={() => handleDelete(ev.id)}>Sil</button>
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setConfirmDelete(null)}>İptal</button>
                    </>
                  ) : (
                    <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setConfirmDelete(ev.id)}>✕</button>
                  )}
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
              <h3>{isNew ? 'Yeni Etkinlik' : 'Etkinliği Düzenle'}</h3>
              <button className="a-btn a-btn-ghost a-btn-sm" onClick={closeDrawer}>✕ Kapat</button>
            </div>

            <div className="a-form">
              <div className="a-form-row">
                <div className="a-field">
                  <label>Seviye (ör. T12-L1)</label>
                  <input className="a-input" value={editing.level}
                    onChange={e => setEditing({ ...editing, level: e.target.value })} />
                </div>
                <div className="a-field">
                  <label>Konum (left / right)</label>
                  <select className="a-input" value={editing.side}
                    onChange={e => setEditing({ ...editing, side: e.target.value as 'left' | 'right' })}>
                    <option value="left">Sol</option>
                    <option value="right">Sağ</option>
                  </select>
                </div>
              </div>

              <div className="a-field">
                <label>Etkinlik Başlığı</label>
                <input className="a-input" value={editing.title}
                  onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </div>

              <div className="a-form-row">
                <div className="a-field">
                  <label>Bölge Adı</label>
                  <input className="a-input" value={editing.region}
                    onChange={e => setEditing({ ...editing, region: e.target.value })} />
                </div>
                <div className="a-field">
                  <label>Tarih</label>
                  <input className="a-input" value={editing.meta}
                    onChange={e => setEditing({ ...editing, meta: e.target.value })} />
                </div>
              </div>

              <div className="a-field">
                <label>Özet</label>
                <textarea className="a-input a-textarea" value={editing.overview}
                  onChange={e => setEditing({ ...editing, overview: e.target.value })} />
              </div>

              <div className="a-field">
                <label>Slug (ör. /hub/etkinlik-adi)</label>
                <input className="a-input" value={editing.slug}
                  onChange={e => setEditing({ ...editing, slug: e.target.value })} />
              </div>

              <div className="a-field">
                <label>İstatistikler (Enter ile ekle)</label>
                <div className="a-tags">
                  {editing.stats.map((s, i) => (
                    <span key={i} className="a-tag">
                      {s}
                      <button onClick={() => removeStat(i)}>×</button>
                    </span>
                  ))}
                  <input
                    className="a-tag-input"
                    placeholder="ör. 2 makale"
                    value={statInput}
                    onChange={e => setStatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStat() } }}
                  />
                </div>
              </div>

              <hr className="a-divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'rgba(200,215,255,0.5)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  İçerik Öğeleri
                </span>
                <button className="a-btn a-btn-ghost a-btn-sm" onClick={addItem}>+ Öğe Ekle</button>
              </div>

              {editing.items.map((item, i) => (
                <div key={i} className="a-card" style={{ padding: '1rem', marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(200,215,255,0.5)', fontWeight: 700 }}>Öğe {i + 1}</span>
                    <button className="a-btn a-btn-danger a-btn-sm" onClick={() => removeItem(i)}>Sil</button>
                  </div>
                  <div className="a-form-row">
                    <div className="a-field">
                      <label>Tür</label>
                      <input className="a-input" value={item.kind}
                        onChange={e => updateItem(i, 'kind', e.target.value)} placeholder="Makale, Video..." />
                    </div>
                    <div className="a-field">
                      <label>Meta</label>
                      <input className="a-input" value={item.meta}
                        onChange={e => updateItem(i, 'meta', e.target.value)} placeholder="5 dk okuma" />
                    </div>
                  </div>
                  <div className="a-field">
                    <label>Başlık</label>
                    <input className="a-input" value={item.title}
                      onChange={e => updateItem(i, 'title', e.target.value)} />
                  </div>
                  <div className="a-field">
                    <label>Açıklama</label>
                    <textarea className="a-input a-textarea" value={item.blurb}
                      onChange={e => updateItem(i, 'blurb', e.target.value)} />
                  </div>
                </div>
              ))}

              <div className="a-form-actions">
                <button className="a-btn a-btn-primary" onClick={handleSave}>
                  {isNew ? 'Etkinliği Ekle' : 'Değişiklikleri Kaydet'}
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
