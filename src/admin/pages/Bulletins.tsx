import { useState } from 'react'
import { getContent, updateBulletins, type BulletinStrip } from '../store'

export default function Bulletins() {
  const [content, setContent] = useState(() => getContent())
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [draft, setDraft] = useState<BulletinStrip | null>(null)
  const [itemInput, setItemInput] = useState('')

  const bulletins = content?.overflowBulletins ?? []

  function refresh() { setContent(getContent()) }

  function openEdit(idx: number) {
    setEditingIdx(idx)
    setDraft({ ...bulletins[idx], items: [...bulletins[idx].items] })
    setItemInput('')
  }

  function openNew() {
    setEditingIdx(-1)
    setDraft({ label: `Bülten Şeridi ${bulletins.length + 1}`, items: [] })
    setItemInput('')
  }

  function closeDrawer() { setEditingIdx(null); setDraft(null) }

  function handleSave() {
    if (!draft || !content) return
    let updated: BulletinStrip[]
    if (editingIdx === -1) {
      updated = [...bulletins, draft]
    } else {
      updated = bulletins.map((b, i) => i === editingIdx ? draft : b)
    }
    updateBulletins(updated)
    refresh()
    closeDrawer()
  }

  function handleDelete(idx: number) {
    if (!content) return
    updateBulletins(bulletins.filter((_, i) => i !== idx))
    refresh()
  }

  function addItem() {
    if (!draft || !itemInput.trim()) return
    setDraft({ ...draft, items: [...draft.items, itemInput.trim()] })
    setItemInput('')
  }

  function removeItem(i: number) {
    if (!draft) return
    setDraft({ ...draft, items: draft.items.filter((_, idx) => idx !== i) })
  }

  return (
    <>
      <div className="a-page-header">
        <h2>Bülten Şeritleri</h2>
        <button className="a-btn a-btn-primary" onClick={openNew}>+ Yeni Şerit</button>
      </div>

      {bulletins.map((b, idx) => (
        <div key={idx} className="a-card" style={{ marginBottom: '1rem' }}>
          <div className="a-card-head">
            <h3>{b.label}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => openEdit(idx)}>Düzenle</button>
              <button className="a-btn a-btn-danger a-btn-sm" onClick={() => handleDelete(idx)}>Sil</button>
            </div>
          </div>
          <div style={{ padding: '0.75rem 1.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {b.items.map((item, i) => (
              <span key={i} className="a-badge">{item}</span>
            ))}
          </div>
        </div>
      ))}

      {bulletins.length === 0 && (
        <div className="a-card"><div className="a-empty">Henüz bülten şeridi yok.</div></div>
      )}

      {draft && (
        <div className="a-drawer">
          <div className="a-drawer-card">
            <div className="a-drawer-head">
              <h3>{editingIdx === -1 ? 'Yeni Şerit' : 'Şeridi Düzenle'}</h3>
              <button className="a-btn a-btn-ghost a-btn-sm" onClick={closeDrawer}>✕ Kapat</button>
            </div>
            <div className="a-form">
              <div className="a-field">
                <label>Şerit Adı</label>
                <input className="a-input" value={draft.label}
                  onChange={e => setDraft({ ...draft, label: e.target.value })} />
              </div>
              <div className="a-field">
                <label>Öğeler (Enter ile ekle)</label>
                <div className="a-tags">
                  {draft.items.map((item, i) => (
                    <span key={i} className="a-tag">
                      {item}
                      <button onClick={() => removeItem(i)}>×</button>
                    </span>
                  ))}
                  <input
                    className="a-tag-input"
                    placeholder="Yeni öğe..."
                    value={itemInput}
                    onChange={e => setItemInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
                  />
                </div>
              </div>
              <div className="a-form-actions">
                <button className="a-btn a-btn-primary" onClick={handleSave}>Kaydet</button>
                <button className="a-btn a-btn-ghost" onClick={closeDrawer}>İptal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
