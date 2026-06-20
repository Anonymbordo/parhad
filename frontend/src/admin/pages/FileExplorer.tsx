import { useState, useRef } from 'react'
import {
  getContent, updateMedia, updateFileFolders, genId,
  type MediaItem, type FileFolder,
} from '../store'

const TYPE_ICONS: Record<string, string> = {
  image: '🖼',
  video: '▶',
  document: '📄',
  audio: '🎵',
  folder: '📁',
}

type ViewMode = 'grid' | 'list'

function getFileType(name: string): MediaItem['type'] {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)) return 'image'
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return 'audio'
  return 'document'
}

export default function FileExplorer() {
  const [content, setContent] = useState(() => getContent())
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function refresh() { setContent(getContent()) }

  const folders = (content?.fileFolders ?? []).filter(f => f.parentId === currentFolderId)
  const allFiles = (content?.media ?? [])
    .filter(m => (m.folderId ?? null) === currentFolderId)
    .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()))

  // Breadcrumb
  function buildBreadcrumb(): FileFolder[] {
    const trail: FileFolder[] = []
    let id: string | null = currentFolderId
    const all = content?.fileFolders ?? []
    while (id) {
      const f = all.find(x => x.id === id)
      if (!f) break
      trail.unshift(f)
      id = f.parentId
    }
    return trail
  }
  const breadcrumb = buildBreadcrumb()

  // Klasör oluştur
  function handleCreateFolder() {
    const name = newFolderName.trim()
    if (!name || !content) return
    const folder: FileFolder = {
      id: genId(), name,
      parentId: currentFolderId,
      createdAt: new Date().toLocaleDateString('tr-TR'),
    }
    updateFileFolders([...(content.fileFolders ?? []), folder])
    setNewFolderName('')
    setShowNewFolder(false)
    refresh()
  }

  // Klasör sil
  function handleDeleteFolder(folderId: string) {
    if (!content || !confirm('Bu klasörü ve içindeki tüm dosyaları silmek istiyor musunuz?')) return
    const allFolders = content.fileFolders ?? []

    function collectIds(id: string): string[] {
      const children = allFolders.filter(f => f.parentId === id).map(f => f.id)
      return [id, ...children.flatMap(collectIds)]
    }

    const toDelete = new Set(collectIds(folderId))
    updateFileFolders(allFolders.filter(f => !toDelete.has(f.id)))
    updateMedia(content.media.filter(m => !m.folderId || !toDelete.has(m.folderId)))
    refresh()
  }

  // Klasör yeniden adlandır
  function handleRenameFolder(folder: FileFolder) {
    if (!renaming || !content) return
    const trimmed = renaming.value.trim()
    if (!trimmed) return
    updateFileFolders((content.fileFolders ?? []).map(f =>
      f.id === folder.id ? { ...f, name: trimmed } : f
    ))
    setRenaming(null)
    refresh()
  }

  // Dosya yükle
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || !content) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const url = ev.target?.result as string
        const item: MediaItem = {
          id: genId(), name: file.name, url,
          type: getFileType(file.name),
          mimeType: file.type,
          size: `${(file.size / 1024).toFixed(0)} KB`,
          alt: file.name, caption: '',
          date: new Date().toLocaleDateString('tr-TR'),
          folderId: currentFolderId ?? undefined,
        }
        const latest = getContent()
        if (latest) { updateMedia([item, ...latest.media]); refresh() }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  // Dosya sil
  function handleDeleteFile(id: string) {
    if (!content || !confirm('Bu dosyayı silmek istiyor musunuz?')) return
    updateMedia(content.media.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
    refresh()
  }

  // Dosya taşı
  function handleMoveFile(fileId: string, targetFolderId: string | null) {
    if (!content) return
    updateMedia(content.media.map(m =>
      m.id === fileId ? { ...m, folderId: targetFolderId ?? undefined } : m
    ))
    refresh()
  }

  // Dosya detayı güncelle
  function handleUpdateFile() {
    if (!selected || !content) return
    updateMedia(content.media.map(m => m.id === selected.id ? selected : m))
    refresh()
  }

  return (
    <>
      <div className="a-page-header">
        <h2>Dosya Gezgini</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            className="a-input"
            style={{ width: '200px', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
            placeholder="Dosya ara…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className={`a-btn ${viewMode === 'grid' ? 'a-btn-primary' : 'a-btn-ghost'}`}
            onClick={() => setViewMode('grid')}
            title="Izgara görünümü"
          >⊞</button>
          <button
            className={`a-btn ${viewMode === 'list' ? 'a-btn-primary' : 'a-btn-ghost'}`}
            onClick={() => setViewMode('list')}
            title="Liste görünümü"
          >≡</button>
          <button className="a-btn a-btn-ghost" onClick={() => { setShowNewFolder(v => !v); setSelected(null) }}>
            + Klasör
          </button>
          <button className="a-btn a-btn-primary" onClick={() => fileInputRef.current?.click()}>
            ↑ Yükle
          </button>
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
        </div>
      </div>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          className="a-btn a-btn-ghost a-btn-sm"
          onClick={() => { setCurrentFolderId(null); setSelected(null) }}
        >
          🏠 Kök
        </button>
        {breadcrumb.map(f => (
          <span key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: 'rgba(175,214,255,0.4)' }}>›</span>
            <button
              className="a-btn a-btn-ghost a-btn-sm"
              onClick={() => { setCurrentFolderId(f.id); setSelected(null) }}
            >
              📁 {f.name}
            </button>
          </span>
        ))}
      </nav>

      {/* Yeni klasör */}
      {showNewFolder && (
        <div className="a-card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            className="a-input"
            style={{ flex: 1 }}
            placeholder="Klasör adı…"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder() }}
            autoFocus
          />
          <button className="a-btn a-btn-primary a-btn-sm" onClick={handleCreateFolder}>Oluştur</button>
          <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => { setShowNewFolder(false); setNewFolderName('') }}>İptal</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap: '1.5rem' }}>
        <div>
          {folders.length === 0 && allFiles.length === 0 ? (
            <div className="a-card">
              <div className="a-empty">Bu klasör boş. Dosya yükleyin veya yeni klasör oluşturun.</div>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="media-grid">
                {/* Klasörler */}
                {folders.map(folder => (
                  <div key={folder.id} className="media-item" style={{ position: 'relative' }}>
                    <div
                      className="media-icon"
                      style={{ fontSize: '2.5rem', cursor: 'pointer' }}
                      onClick={() => { setCurrentFolderId(folder.id); setSelected(null) }}
                    >
                      📁
                    </div>
                    {renaming?.id === folder.id ? (
                      <input
                        className="a-input"
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                        value={renaming.value}
                        onChange={e => setRenaming({ ...renaming, value: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameFolder(folder)
                          if (e.key === 'Escape') setRenaming(null)
                        }}
                        onBlur={() => handleRenameFolder(folder)}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="media-name"
                        onDoubleClick={() => setRenaming({ id: folder.id, value: folder.name })}
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setCurrentFolderId(folder.id); setSelected(null) }}
                      >
                        {folder.name}
                      </div>
                    )}
                    <button
                      className="a-btn a-btn-danger a-btn-sm"
                      style={{ position: 'absolute', top: '4px', right: '4px', padding: '0.1rem 0.35rem', fontSize: '0.65rem', opacity: 0.7 }}
                      onClick={e => { e.stopPropagation(); handleDeleteFolder(folder.id) }}
                    >✕</button>
                  </div>
                ))}

                {/* Dosyalar */}
                {allFiles.map(item => (
                  <div
                    key={item.id}
                    className={`media-item${selected?.id === item.id ? ' media-item-selected' : ''}`}
                    onClick={() => setSelected(selected?.id === item.id ? null : item)}
                  >
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.alt} className="media-thumb" />
                    ) : (
                      <div className="media-icon">{TYPE_ICONS[item.type]}</div>
                    )}
                    <div className="media-name">{item.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              /* Liste görünümü */
              <div className="a-card">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(175,214,255,0.1)', color: 'rgba(175,214,255,0.5)', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 1rem' }}>Ad</th>
                      <th style={{ padding: '0.6rem 1rem' }}>Tür</th>
                      <th style={{ padding: '0.6rem 1rem' }}>Boyut</th>
                      <th style={{ padding: '0.6rem 1rem' }}>Tarih</th>
                      <th style={{ padding: '0.6rem 1rem' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {folders.map(f => (
                      <tr
                        key={f.id}
                        style={{ borderBottom: '1px solid rgba(175,214,255,0.06)', cursor: 'pointer' }}
                        onClick={() => { setCurrentFolderId(f.id); setSelected(null) }}
                      >
                        <td style={{ padding: '0.6rem 1rem' }}>📁 {f.name}</td>
                        <td style={{ padding: '0.6rem 1rem', color: 'rgba(175,214,255,0.4)' }}>Klasör</td>
                        <td style={{ padding: '0.6rem 1rem', color: 'rgba(175,214,255,0.4)' }}>—</td>
                        <td style={{ padding: '0.6rem 1rem', color: 'rgba(175,214,255,0.4)' }}>{f.createdAt}</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <button className="a-btn a-btn-danger a-btn-sm"
                            onClick={e => { e.stopPropagation(); handleDeleteFolder(f.id) }}>Sil</button>
                        </td>
                      </tr>
                    ))}
                    {allFiles.map(item => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid rgba(175,214,255,0.06)',
                          cursor: 'pointer',
                          background: selected?.id === item.id ? 'rgba(95,144,199,0.1)' : '',
                        }}
                        onClick={() => setSelected(selected?.id === item.id ? null : item)}
                      >
                        <td style={{ padding: '0.6rem 1rem' }}>
                          {TYPE_ICONS[item.type]} {item.name}
                        </td>
                        <td style={{ padding: '0.6rem 1rem', color: 'rgba(175,214,255,0.4)' }}>{item.type}</td>
                        <td style={{ padding: '0.6rem 1rem', color: 'rgba(175,214,255,0.4)' }}>{item.size}</td>
                        <td style={{ padding: '0.6rem 1rem', color: 'rgba(175,214,255,0.4)' }}>{item.date}</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <button className="a-btn a-btn-danger a-btn-sm"
                            onClick={e => { e.stopPropagation(); handleDeleteFile(item.id) }}>Sil</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        {/* Detay paneli */}
        {selected && (
          <div className="a-card" style={{ alignSelf: 'start', position: 'sticky', top: '1rem' }}>
            <div className="a-card-head">
              <h3>Dosya Detayı</h3>
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
                  <label>Klasöre Taşı</label>
                  <select
                    className="a-input"
                    value={selected.folderId ?? ''}
                    onChange={e => {
                      const val = e.target.value || null
                      setSelected({ ...selected, folderId: val ?? undefined })
                      handleMoveFile(selected.id, val)
                    }}
                  >
                    <option value="">— Kök —</option>
                    {(content?.fileFolders ?? []).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="a-field">
                  <label>Açıklama</label>
                  <textarea className="a-input a-textarea" style={{ minHeight: '60px' }} value={selected.caption}
                    onChange={e => setSelected({ ...selected, caption: e.target.value })} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(200,215,255,0.4)', lineHeight: 1.6 }}>
                  <div>Boyut: {selected.size}</div>
                  <div>Tür: {selected.type}</div>
                  <div>Tarih: {selected.date}</div>
                </div>
                <div className="a-form-actions">
                  <button className="a-btn a-btn-primary a-btn-sm" onClick={handleUpdateFile}>Güncelle</button>
                  <button className="a-btn a-btn-danger a-btn-sm" onClick={() => handleDeleteFile(selected.id)}>Sil</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
