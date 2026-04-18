import { useState } from 'react'
import { getContent, updateNavLinks } from '../store'

export default function Navigation() {
  const [content, setContent] = useState(() => getContent())
  const [newLink, setNewLink] = useState('')
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editVal, setEditVal] = useState('')

  const navLinks = content?.navLinks ?? []
  function refresh() { setContent(getContent()) }

  function handleAdd() {
    if (!newLink.trim() || !content) return
    updateNavLinks([...navLinks, newLink.trim()])
    setNewLink('')
    refresh()
  }

  function handleDelete(idx: number) {
    if (!content) return
    updateNavLinks(navLinks.filter((_, i) => i !== idx))
    refresh()
  }

  function startEdit(idx: number) {
    setEditingIdx(idx)
    setEditVal(navLinks[idx])
  }

  function saveEdit() {
    if (editingIdx === null || !editVal.trim() || !content) return
    updateNavLinks(navLinks.map((l, i) => i === editingIdx ? editVal.trim() : l))
    setEditingIdx(null)
    refresh()
  }

  function moveUp(idx: number) {
    if (idx === 0 || !content) return
    const arr = [...navLinks]
    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    updateNavLinks(arr)
    refresh()
  }

  function moveDown(idx: number) {
    if (idx === navLinks.length - 1 || !content) return
    const arr = [...navLinks]
    ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
    updateNavLinks(arr)
    refresh()
  }

  return (
    <>
      <div className="a-page-header">
        <h2>Navigasyon Bağlantıları</h2>
      </div>

      <div className="a-card" style={{ marginBottom: '1.5rem' }}>
        <div className="a-card-head"><h3>Yeni Bağlantı Ekle</h3></div>
        <div className="a-panel">
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              className="a-input"
              style={{ flex: 1 }}
              placeholder="ör. Hakkımızda"
              value={newLink}
              onChange={e => setNewLink(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
            />
            <button className="a-btn a-btn-primary" onClick={handleAdd}>Ekle</button>
          </div>
        </div>
      </div>

      <div className="a-card">
        <div className="a-card-head"><h3>Mevcut Bağlantılar</h3></div>
        {navLinks.length === 0 ? (
          <div className="a-empty">Navigasyon bağlantısı bulunamadı.</div>
        ) : (
          <ul className="a-list">
            {navLinks.map((link, idx) => (
              <li key={idx} className="a-list-item">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <button className="a-btn a-btn-ghost a-btn-sm" style={{ padding: '0.1rem 0.4rem' }} onClick={() => moveUp(idx)}>↑</button>
                  <button className="a-btn a-btn-ghost a-btn-sm" style={{ padding: '0.1rem 0.4rem' }} onClick={() => moveDown(idx)}>↓</button>
                </div>
                <div className="a-list-item-info">
                  {editingIdx === idx ? (
                    <input
                      className="a-input"
                      value={editVal}
                      autoFocus
                      onChange={e => setEditVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingIdx(null) }}
                    />
                  ) : (
                    <div className="a-list-item-title">{link}</div>
                  )}
                </div>
                <div className="a-list-actions">
                  {editingIdx === idx ? (
                    <>
                      <button className="a-btn a-btn-primary a-btn-sm" onClick={saveEdit}>Kaydet</button>
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setEditingIdx(null)}>İptal</button>
                    </>
                  ) : (
                    <>
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => startEdit(idx)}>Düzenle</button>
                      <button className="a-btn a-btn-danger a-btn-sm" onClick={() => handleDelete(idx)}>✕</button>
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
