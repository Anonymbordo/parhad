import { useState } from 'react'
import { getContent, updateUsers, genId, type User } from '../store'

const ROLES = ['admin', 'editor', 'author', 'contributor', 'subscriber'] as const
const ROLE_LABELS: Record<string, string> = {
  admin: 'Yönetici', editor: 'Editör', author: 'Yazar', contributor: 'Katkıcı', subscriber: 'Abone'
}

const EMPTY: User = { id: '', name: '', email: '', role: 'author', avatar: '', date: new Date().toLocaleDateString('tr-TR'), postCount: 0 }

export default function Users() {
  const [content, setContent] = useState(() => getContent())
  const [editing, setEditing] = useState<User | null>(null)
  const [isNew, setIsNew] = useState(false)

  const users = content?.users ?? []
  function refresh() { setContent(getContent()) }

  function openNew() { setEditing({ ...EMPTY, id: genId() }); setIsNew(true) }
  function openEdit(u: User) { setEditing({ ...u }); setIsNew(false) }
  function close() { setEditing(null) }

  function handleSave() {
    if (!editing || !content) return
    let updated: User[]
    if (isNew) {
      updated = [...users, editing]
    } else {
      updated = users.map(u => u.id === editing.id ? editing : u)
    }
    updateUsers(updated)
    refresh()
    close()
  }

  function handleDelete(id: string) {
    if (!content || !confirm('Bu kullanıcıyı silmek istiyor musunuz?')) return
    updateUsers(users.filter(u => u.id !== id))
    refresh()
  }

  return (
    <>
      <div className="a-page-header">
        <h2>Kullanıcılar</h2>
        <button className="a-btn a-btn-primary" onClick={openNew}>+ Yeni Kullanıcı</button>
      </div>

      <div className="a-card">
        {users.length === 0 ? (
          <div className="a-empty">Henüz kullanıcı yok.</div>
        ) : (
          <ul className="a-list">
            {users.map(u => (
              <li key={u.id} className="a-list-item">
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(100,180,255,0.15)', border: '1px solid rgba(100,180,255,0.25)', display: 'grid', placeItems: 'center', fontSize: '1rem', flexShrink: 0 }}>
                  {u.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" /> : u.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="a-list-item-info">
                  <div className="a-list-item-title">{u.name}</div>
                  <div className="a-list-item-sub">{u.email} · {u.postCount} yazı</div>
                </div>
                <span className="a-badge">{ROLE_LABELS[u.role]}</span>
                <div className="a-list-actions">
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => openEdit(u)}>Düzenle</button>
                  <button className="a-btn a-btn-danger a-btn-sm" onClick={() => handleDelete(u.id)}>Sil</button>
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
              <h3>{isNew ? 'Yeni Kullanıcı' : 'Kullanıcıyı Düzenle'}</h3>
              <button className="a-btn a-btn-ghost a-btn-sm" onClick={close}>✕ Kapat</button>
            </div>
            <div className="a-form">
              <div className="a-form-row">
                <div className="a-field">
                  <label>Ad Soyad</label>
                  <input className="a-input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div className="a-field">
                  <label>E-posta</label>
                  <input className="a-input" type="email" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} />
                </div>
              </div>
              <div className="a-form-row">
                <div className="a-field">
                  <label>Rol</label>
                  <select className="a-input" value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value as User['role'] })}>
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div className="a-field">
                  <label>Avatar URL</label>
                  <input className="a-input" value={editing.avatar} onChange={e => setEditing({ ...editing, avatar: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="a-form-actions">
                <button className="a-btn a-btn-primary" onClick={handleSave}>{isNew ? 'Ekle' : 'Kaydet'}</button>
                <button className="a-btn a-btn-ghost" onClick={close}>İptal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
