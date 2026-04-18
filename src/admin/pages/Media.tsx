import { useState, useRef } from 'react'
import { getContent, updateMedia, genId, type MediaItem } from '../store'

const TYPE_ICONS: Record<MediaItem['type'], string> = {
  image: '🖼', video: '▶', document: '📄', audio: '🎵'
}

export default function Media() {
  const [content, setContent] = useState(() => getContent())
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [addMode, setAddMode] = useState(false)
  const [form, setForm] = useState({ url: '', name: '', type: 'image' as MediaItem['type'], alt: '', caption: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const media = content?.media ?? []
  function refresh() { setContent(getContent()) }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || !content) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const url = ev.target?.result as string
        const type: MediaItem['type'] = file.type.startsWith('image/') ? 'image'
          : file.type.startsWith('video/') ? 'video'
          : file.type.startsWith('audio/') ? 'audio' : 'document'

        const item: MediaItem = {
          id: genId(), name: file.name, url,
          type, mimeType: file.type,
          size: `${(file.size / 1024).toFixed(0)} KB`,
          alt: file.name, caption: '',
          date: new Date().toLocaleDateString('tr-TR'),
        }
        const updated = getContent()
        if (updated) {
          updateMedia([item, ...updated.media])
          refresh()
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function handleAddUrl() {
    if (!form.url.trim() || !content) return
    const item: MediaItem = {
      id: genId(), name: form.name || form.url.split('/').pop() || 'dosya',
      url: form.url.trim(), type: form.type,
      mimeType: '', size: 'URL',
      alt: form.alt, caption: form.caption,
      date: new Date().toLocaleDateString('tr-TR'),
    }
    updateMedia([item, ...content.media])
    refresh()
    setForm({ url: '', name: '', type: 'image', alt: '', caption: '' })
    setAddMode(false)
  }

  function handleDelete(id: string) {
    if (!content || !confirm('Bu medyayı silmek istiyor musunuz?')) return
    updateMedia(content.media.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
    refresh()
  }

  function handleUpdate() {
    if (!selected || !content) return
    updateMedia(content.media.map(m => m.id === selected.id ? selected : m))
    refresh()
  }

  return (
    <>
      <div className="a-page-header">
        <h2>Medya Kütüphanesi</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="a-btn a-btn-ghost" onClick={() => { setAddMode(v => !v); setSelected(null) }}>
            + URL Ekle
          </button>
          <button className="a-btn a-btn-primary" onClick={() => fileInputRef.current?.click()}>
            ↑ Dosya Yükle
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            style={{ display: 'none' }} onChange={handleFileUpload} />
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'rgba(175,214,255,0.5)', marginBottom: '1rem' }}>
        💡 Amazon S3 bağlandığında yüklenen dosyalar otomatik olarak buluta gönderilecek.
      </div>

      {addMode && (
        <div className="a-card" style={{ marginBottom: '1.5rem' }}>
          <div className="a-card-head"><h3>URL ile Medya Ekle</h3></div>
          <div className="a-panel">
            <div className="a-form">
              <div className="a-form-row">
                <div className="a-field">
                  <label>URL</label>
                  <input className="a-input" placeholder="https://..." value={form.url}
                    onChange={e => setForm({ ...form, url: e.target.value })} />
                </div>
                <div className="a-field">
                  <label>Tür</label>
                  <select className="a-input" value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as MediaItem['type'] })}>
                    <option value="image">Resim</option>
                    <option value="video">Video</option>
                    <option value="audio">Ses</option>
                    <option value="document">Belge</option>
                  </select>
                </div>
              </div>
              <div className="a-form-row">
                <div className="a-field">
                  <label>Ad</label>
                  <input className="a-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="a-field">
                  <label>Alt Metin</label>
                  <input className="a-input" value={form.alt} onChange={e => setForm({ ...form, alt: e.target.value })} />
                </div>
              </div>
              <div className="a-form-actions">
                <button className="a-btn a-btn-primary" onClick={handleAddUrl}>Ekle</button>
                <button className="a-btn a-btn-ghost" onClick={() => setAddMode(false)}>İptal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap: '1.5rem' }}>
        <div>
          {media.length === 0 ? (
            <div className="a-card"><div className="a-empty">Henüz medya yok. Dosya yükleyin veya URL ekleyin.</div></div>
          ) : (
            <div className="media-grid">
              {media.map(item => (
                <div key={item.id}
                  className={`media-item${selected?.id === item.id ? ' media-item-selected' : ''}`}
                  onClick={() => setSelected(selected?.id === item.id ? null : item)}>
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.alt} className="media-thumb" />
                  ) : (
                    <div className="media-icon">{TYPE_ICONS[item.type]}</div>
                  )}
                  <div className="media-name">{item.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="a-card" style={{ alignSelf: 'start', position: 'sticky', top: '1rem' }}>
            <div className="a-card-head">
              <h3>Medya Detayı</h3>
              <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="a-panel">
              {selected.type === 'image' && (
                <img src={selected.url} alt={selected.alt}
                  style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1rem', objectFit: 'cover', maxHeight: '160px' }} />
              )}
              <div className="a-form">
                <div className="a-field">
                  <label>Dosya Adı</label>
                  <input className="a-input" value={selected.name}
                    onChange={e => setSelected({ ...selected, name: e.target.value })} />
                </div>
                <div className="a-field">
                  <label>Alt Metin</label>
                  <input className="a-input" value={selected.alt}
                    onChange={e => setSelected({ ...selected, alt: e.target.value })} />
                </div>
                <div className="a-field">
                  <label>Açıklama</label>
                  <textarea className="a-input a-textarea" style={{ minHeight: '60px' }} value={selected.caption}
                    onChange={e => setSelected({ ...selected, caption: e.target.value })} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(200,215,255,0.4)', lineHeight: 1.6 }}>
                  <div>Boyut: {selected.size}</div>
                  <div>Tarih: {selected.date}</div>
                  <div style={{ wordBreak: 'break-all' }}>URL: {selected.url.slice(0, 60)}...</div>
                </div>
                <div className="a-form-actions">
                  <button className="a-btn a-btn-primary a-btn-sm" onClick={handleUpdate}>Güncelle</button>
                  <button className="a-btn a-btn-danger a-btn-sm" onClick={() => handleDelete(selected.id)}>Sil</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
