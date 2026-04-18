import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  genId,
  getContent,
  saveContent,
  slugify,
  type NavLinkChild,
  type NavLinkItem,
  type Page,
} from '../store'

type PageBinding = {
  pageId: string
  menuLabel: string
  menuPath: string
  level: 'main' | 'dropdown'
}

function createNavItem(label = 'Yeni Menü'): NavLinkItem {
  const safeLabel = label.trim() || 'Yeni Menü'

  return {
    id: genId(),
    label: safeLabel,
    slug: slugify(safeLabel) || 'yeni-menu',
    pageId: null,
    children: [],
  }
}

function createNavChild(label = 'Yeni Alt Sayfa'): NavLinkChild {
  const safeLabel = label.trim() || 'Yeni Alt Sayfa'

  return {
    id: genId(),
    label: safeLabel,
    slug: slugify(safeLabel) || 'yeni-alt-sayfa',
    pageId: null,
  }
}

function createPageDraft(title: string, pages: Page[]): Page {
  const baseSlug = slugify(title) || 'sayfa'
  const usedSlugs = new Set(pages.map((page) => page.slug))
  let slug = baseSlug
  let suffix = 2

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return {
    id: genId(),
    title,
    slug,
    content: `<h2>${title}</h2><p>Bu sayfa admin panelinden oluşturuldu. İçeriği görsel dilinize göre burada kurgulayabilirsiniz.</p>`,
    status: 'draft',
    template: 'default',
    date: new Date().toLocaleDateString('tr-TR'),
    order: pages.length + 1,
  }
}

function pageStatusLabel(status: Page['status']) {
  if (status === 'published') {
    return 'Yayında'
  }

  if (status === 'trash') {
    return 'Çöp'
  }

  return 'Taslak'
}

function pageStatusClass(status: Page['status']) {
  if (status === 'published') {
    return 'a-badge-green'
  }

  if (status === 'trash') {
    return 'a-badge-red'
  }

  return ''
}

function collectBindings(navLinks: NavLinkItem[]): PageBinding[] {
  const bindings: PageBinding[] = []

  navLinks.forEach((item) => {
    const itemPath = `/${item.slug}`

    if (item.pageId) {
      bindings.push({
        pageId: item.pageId,
        menuLabel: item.label,
        menuPath: itemPath,
        level: 'main',
      })
    }

    item.children.forEach((child) => {
      if (!child.pageId) {
        return
      }

      bindings.push({
        pageId: child.pageId,
        menuLabel: `${item.label} / ${child.label}`,
        menuPath: `${itemPath}/${child.slug}`,
        level: 'dropdown',
      })
    })
  })

  return bindings
}

export default function Navigation() {
  const navigate = useNavigate()
  const [content, setContent] = useState(() => getContent())
  const [newLabel, setNewLabel] = useState('')

  const navLinks = useMemo(() => content?.navLinks ?? [], [content])
  const pages = useMemo(() => content?.pages ?? [], [content])

  const bindings = useMemo(() => collectBindings(navLinks), [navLinks])
  const bindingMap = useMemo(() => new Map(bindings.map((binding) => [binding.pageId, binding])), [bindings])
  const dropdownCount = useMemo(
    () => navLinks.reduce((total, item) => total + item.children.length, 0),
    [navLinks],
  )
  const linkedCount = bindings.length
  const unlinkedCount = useMemo(
    () =>
      navLinks.reduce((total, item) => {
        const itemGap = item.pageId ? 0 : 1
        const childGap = item.children.reduce((sum, child) => sum + (child.pageId ? 0 : 1), 0)
        return total + itemGap + childGap
      }, 0),
    [navLinks],
  )
  const linkedPages = useMemo(
    () => pages.filter((page) => bindingMap.has(page.id)),
    [bindingMap, pages],
  )
  const freePages = useMemo(
    () => pages.filter((page) => !bindingMap.has(page.id) && page.status !== 'trash'),
    [bindingMap, pages],
  )

  function commit(nextNavLinks: NavLinkItem[], nextPages = pages) {
    if (!content) {
      return
    }

    const nextContent = {
      ...content,
      navLinks: nextNavLinks,
      pages: nextPages,
    }

    saveContent(nextContent)
    setContent(nextContent)
  }

  function updateNavItem(itemId: string, updater: (item: NavLinkItem) => NavLinkItem) {
    commit(navLinks.map((item) => (item.id === itemId ? updater(item) : item)))
  }

  function updateNavChild(parentId: string, childId: string, updater: (child: NavLinkChild) => NavLinkChild) {
    commit(
      navLinks.map((item) => (
        item.id === parentId
          ? { ...item, children: item.children.map((child) => (child.id === childId ? updater(child) : child)) }
          : item
      )),
    )
  }

  function addTopLevelItem() {
    if (!newLabel.trim()) {
      return
    }

    commit([...navLinks, createNavItem(newLabel)])
    setNewLabel('')
  }

  function deleteTopLevelItem(itemId: string) {
    const item = navLinks.find((entry) => entry.id === itemId)

    if (!item || !confirm(`"${item.label}" menüsünü silmek istiyor musunuz?`)) {
      return
    }

    commit(navLinks.filter((entry) => entry.id !== itemId))
  }

  function moveTopLevelItem(index: number, direction: -1 | 1) {
    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= navLinks.length) {
      return
    }

    const nextNavLinks = [...navLinks]
    ;[nextNavLinks[index], nextNavLinks[targetIndex]] = [nextNavLinks[targetIndex], nextNavLinks[index]]
    commit(nextNavLinks)
  }

  function addChildItem(parentId: string) {
    const parent = navLinks.find((item) => item.id === parentId)

    if (!parent) {
      return
    }

    const label = parent.children.length === 0
      ? `${parent.label} Alt Sayfa`
      : `${parent.label} Alt Sayfa ${parent.children.length + 1}`

    updateNavItem(parentId, (item) => ({
      ...item,
      children: [...item.children, createNavChild(label)],
    }))
  }

  function deleteChildItem(parentId: string, childId: string) {
    const parent = navLinks.find((item) => item.id === parentId)
    const child = parent?.children.find((entry) => entry.id === childId)

    if (!parent || !child || !confirm(`"${child.label}" dropdown öğesini silmek istiyor musunuz?`)) {
      return
    }

    updateNavItem(parentId, (item) => ({
      ...item,
      children: item.children.filter((entry) => entry.id !== childId),
    }))
  }

  function moveChildItem(parentId: string, index: number, direction: -1 | 1) {
    const parent = navLinks.find((item) => item.id === parentId)
    const targetIndex = index + direction

    if (!parent || targetIndex < 0 || targetIndex >= parent.children.length) {
      return
    }

    const nextChildren = [...parent.children]
    ;[nextChildren[index], nextChildren[targetIndex]] = [nextChildren[targetIndex], nextChildren[index]]

    updateNavItem(parentId, (item) => ({
      ...item,
      children: nextChildren,
    }))
  }

  function createPageForMenu(itemId: string) {
    const item = navLinks.find((entry) => entry.id === itemId)

    if (!item) {
      return
    }

    const page = createPageDraft(item.label, pages)
    const nextPages = [page, ...pages]
    const nextNavLinks = navLinks.map((entry) => (
      entry.id === itemId ? { ...entry, pageId: page.id } : entry
    ))

    commit(nextNavLinks, nextPages)
    navigate(`/admin/site-pages/${page.id}`)
  }

  function createPageForChild(parentId: string, childId: string) {
    const parent = navLinks.find((item) => item.id === parentId)
    const child = parent?.children.find((entry) => entry.id === childId)

    if (!parent || !child) {
      return
    }

    const page = createPageDraft(child.label, pages)
    const nextPages = [page, ...pages]
    const nextNavLinks = navLinks.map((item) => (
      item.id === parentId
        ? {
            ...item,
            children: item.children.map((entry) => (
              entry.id === childId ? { ...entry, pageId: page.id } : entry
            )),
          }
        : item
    ))

    commit(nextNavLinks, nextPages)
    navigate(`/admin/site-pages/${page.id}`)
  }

  function createMissingPages() {
    if (!content) {
      return
    }

    let nextPages = [...pages]

    const nextNavLinks = navLinks.map((item) => {
      let nextItem = { ...item }

      if (!nextItem.pageId) {
        const draft = createPageDraft(nextItem.label, nextPages)
        nextPages = [draft, ...nextPages]
        nextItem = { ...nextItem, pageId: draft.id }
      }

      const nextChildren = nextItem.children.map((child) => {
        if (child.pageId) {
          return child
        }

        const draft = createPageDraft(child.label, nextPages)
        nextPages = [draft, ...nextPages]

        return {
          ...child,
          pageId: draft.id,
        }
      })

      return {
        ...nextItem,
        children: nextChildren,
      }
    })

    commit(nextNavLinks, nextPages)
  }

  function getAvailablePages(currentPageId: string | null) {
    return pages.filter((page) => {
      if (page.status === 'trash') {
        return false
      }

      return !bindingMap.has(page.id) || page.id === currentPageId
    })
  }

  if (!content) {
    return <div className="a-empty">İçerik deposu yüklenemedi.</div>
  }

  return (
    <>
      <div className="a-page-header nav-admin-header">
        <div className="nav-admin-header-copy">
          <p>Header Sayfa Orkestrasyonu</p>
          <h2>Üst menü, dropdown sayfaları ve bağlı içerikler tek yerden yönetilsin.</h2>
          <span>
            Hakkımızda, Yönetim Kurulu, İl Başkanları, Ziyaretlerimiz, Duyurular,
            Komisyonlar, Eğitimler ve İletişim Bilgileri için hem menü yapısını hem de
            arkasındaki sayfaları bu ekrandan kurabilirsiniz.
          </span>
        </div>

        <div className="nav-admin-header-actions">
          <button className="a-btn a-btn-ghost" type="button" onClick={() => navigate('/admin/site-pages')}>
            Tüm Sayfalar
          </button>
          <button
            className="a-btn a-btn-primary"
            type="button"
            disabled={unlinkedCount === 0}
            onClick={createMissingPages}
          >
            Eksik Sayfaları Üret
          </button>
        </div>
      </div>

      <div className="a-card nav-preview-card">
        <div className="a-card-head">
          <h3>Canlı Header Önizlemesi</h3>
          <span className="nav-preview-meta">{navLinks.length} ana sekme</span>
        </div>

        <div className="a-panel">
          <div className="nav-preview-pill">
            {navLinks.map((item) => (
              <div
                key={item.id}
                className={`nav-preview-node ${item.children.length > 0 ? 'nav-preview-node-children' : ''}`}
              >
                <span>{item.label}</span>
                {item.children.length > 0 ? (
                  <small>{item.children.length} alt sayfa</small>
                ) : null}
              </div>
            ))}
          </div>

          <div className="nav-admin-stats">
            <article className="nav-admin-stat">
              <strong>{navLinks.length}</strong>
              <span>Ana Menü</span>
            </article>
            <article className="nav-admin-stat">
              <strong>{dropdownCount}</strong>
              <span>Dropdown Sayfası</span>
            </article>
            <article className="nav-admin-stat">
              <strong>{linkedCount}</strong>
              <span>Bağlı Sayfa</span>
            </article>
            <article className="nav-admin-stat">
              <strong>{unlinkedCount}</strong>
              <span>Sayfasız Alan</span>
            </article>
          </div>
        </div>
      </div>

      <div className="nav-admin-grid">
        <section className="a-card">
          <div className="a-card-head">
            <h3>Menü Ağacı</h3>
            <span className="nav-inline-note">Header görünümünü birebir buradan kurun.</span>
          </div>

          <div className="a-panel">
            <div className="nav-create-row">
              <input
                className="a-input"
                placeholder="ör. Basın Odası"
                value={newLabel}
                onChange={(event) => setNewLabel(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    addTopLevelItem()
                  }
                }}
              />
              <button className="a-btn a-btn-primary" type="button" onClick={addTopLevelItem}>
                + Ana Menü Ekle
              </button>
              <button className="a-btn a-btn-ghost" type="button" onClick={() => navigate('/admin/site-pages/new')}>
                + Bağımsız Sayfa
              </button>
            </div>

            {navLinks.length === 0 ? (
              <div className="a-empty">Henüz header öğesi yok. İlk ana menüyü ekleyin.</div>
            ) : (
              <div className="nav-builder-stack">
                {navLinks.map((item, index) => {
                  const linkedPage = item.pageId ? pages.find((page) => page.id === item.pageId) ?? null : null

                  return (
                    <article className="nav-builder-card" key={item.id}>
                      <div className="nav-builder-head">
                        <div className="nav-builder-titlewrap">
                          <p>{`Ana Menü ${String(index + 1).padStart(2, '0')}`}</p>
                          <h3>{item.label || 'Başlıksız Menü'}</h3>
                        </div>

                        <div className="nav-builder-actions">
                          <button className="a-btn a-btn-ghost a-btn-sm" type="button" onClick={() => moveTopLevelItem(index, -1)}>
                            ↑
                          </button>
                          <button className="a-btn a-btn-ghost a-btn-sm" type="button" onClick={() => moveTopLevelItem(index, 1)}>
                            ↓
                          </button>
                          <button className="a-btn a-btn-ghost a-btn-sm" type="button" onClick={() => addChildItem(item.id)}>
                            + Dropdown
                          </button>
                          <button className="a-btn a-btn-danger a-btn-sm" type="button" onClick={() => deleteTopLevelItem(item.id)}>
                            Sil
                          </button>
                        </div>
                      </div>

                      <div className="nav-builder-grid">
                        <div className="a-field">
                          <label>Menü Başlığı</label>
                          <input
                            className="a-input"
                            value={item.label}
                            onChange={(event) => {
                              const nextLabel = event.target.value
                              updateNavItem(item.id, (current) => ({
                                ...current,
                                label: nextLabel,
                                slug: current.slug === slugify(current.label) || !current.slug
                                  ? slugify(nextLabel)
                                  : current.slug,
                              }))
                            }}
                          />
                        </div>

                        <div className="a-field">
                          <label>Path</label>
                          <input
                            className="a-input"
                            value={item.slug}
                            onChange={(event) => {
                              const nextSlug = slugify(event.target.value)
                              updateNavItem(item.id, (current) => ({ ...current, slug: nextSlug }))
                            }}
                          />
                        </div>

                        <div className="a-field">
                          <label>Bağlı Sayfa</label>
                          <select
                            className="a-input"
                            value={item.pageId ?? ''}
                            onChange={(event) => {
                              const value = event.target.value || null
                              updateNavItem(item.id, (current) => ({ ...current, pageId: value }))
                            }}
                          >
                            <option value="">Sayfa bağlı değil</option>
                            {getAvailablePages(item.pageId).map((page) => (
                              <option key={page.id} value={page.id}>
                                {page.title || '(Başlıksız sayfa)'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="nav-link-row">
                        {linkedPage ? (
                          <>
                            <span className={`a-badge ${pageStatusClass(linkedPage.status)}`}>
                              {pageStatusLabel(linkedPage.status)}
                            </span>
                            <span className="nav-route-chip">{`/${item.slug}`}</span>
                            <button
                              className="a-btn a-btn-ghost a-btn-sm"
                              type="button"
                              onClick={() => navigate(`/admin/site-pages/${linkedPage.id}`)}
                            >
                              Sayfayı Düzenle
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="nav-inline-note">Bu menü için henüz sayfa bağlı değil.</span>
                            <button className="a-btn a-btn-primary a-btn-sm" type="button" onClick={() => createPageForMenu(item.id)}>
                              Taslak Sayfa Oluştur
                            </button>
                          </>
                        )}
                      </div>

                      <div className="nav-child-section">
                        <div className="nav-child-section-head">
                          <p>Dropdown Sayfaları</p>
                          <span>{item.children.length} öğe</span>
                        </div>

                        {item.children.length === 0 ? (
                          <div className="nav-child-empty">
                            Bu başlık altında dropdown yok. İstersen yeni alt sayfa ekleyebilirsin.
                          </div>
                        ) : (
                          <div className="nav-child-list">
                            {item.children.map((child, childIndex) => {
                              const childPage = child.pageId
                                ? pages.find((page) => page.id === child.pageId) ?? null
                                : null

                              return (
                                <article className="nav-child-card" key={child.id}>
                                  <div className="nav-child-head">
                                    <div>
                                      <p>{`Dropdown ${String(childIndex + 1).padStart(2, '0')}`}</p>
                                      <h4>{child.label || 'Başlıksız Alt Sayfa'}</h4>
                                    </div>

                                    <div className="nav-builder-actions">
                                      <button className="a-btn a-btn-ghost a-btn-sm" type="button" onClick={() => moveChildItem(item.id, childIndex, -1)}>
                                        ↑
                                      </button>
                                      <button className="a-btn a-btn-ghost a-btn-sm" type="button" onClick={() => moveChildItem(item.id, childIndex, 1)}>
                                        ↓
                                      </button>
                                      <button className="a-btn a-btn-danger a-btn-sm" type="button" onClick={() => deleteChildItem(item.id, child.id)}>
                                        Sil
                                      </button>
                                    </div>
                                  </div>

                                  <div className="nav-builder-grid nav-builder-grid-compact">
                                    <div className="a-field">
                                      <label>Dropdown Başlığı</label>
                                      <input
                                        className="a-input"
                                        value={child.label}
                                        onChange={(event) => {
                                          const nextLabel = event.target.value
                                          updateNavChild(item.id, child.id, (current) => ({
                                            ...current,
                                            label: nextLabel,
                                            slug: current.slug === slugify(current.label) || !current.slug
                                              ? slugify(nextLabel)
                                              : current.slug,
                                          }))
                                        }}
                                      />
                                    </div>

                                    <div className="a-field">
                                      <label>Path</label>
                                      <input
                                        className="a-input"
                                        value={child.slug}
                                        onChange={(event) => {
                                          const nextSlug = slugify(event.target.value)
                                          updateNavChild(item.id, child.id, (current) => ({ ...current, slug: nextSlug }))
                                        }}
                                      />
                                    </div>

                                    <div className="a-field">
                                      <label>Bağlı Sayfa</label>
                                      <select
                                        className="a-input"
                                        value={child.pageId ?? ''}
                                        onChange={(event) => {
                                          const value = event.target.value || null
                                          updateNavChild(item.id, child.id, (current) => ({ ...current, pageId: value }))
                                        }}
                                      >
                                        <option value="">Sayfa bağlı değil</option>
                                        {getAvailablePages(child.pageId).map((page) => (
                                          <option key={page.id} value={page.id}>
                                            {page.title || '(Başlıksız sayfa)'}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  <div className="nav-link-row nav-link-row-child">
                                    {childPage ? (
                                      <>
                                        <span className={`a-badge ${pageStatusClass(childPage.status)}`}>
                                          {pageStatusLabel(childPage.status)}
                                        </span>
                                        <span className="nav-route-chip">{`/${item.slug}/${child.slug}`}</span>
                                        <button
                                          className="a-btn a-btn-ghost a-btn-sm"
                                          type="button"
                                          onClick={() => navigate(`/admin/site-pages/${childPage.id}`)}
                                        >
                                          Sayfayı Düzenle
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <span className="nav-inline-note">Bu dropdown için sayfa seçilmedi.</span>
                                        <button className="a-btn a-btn-primary a-btn-sm" type="button" onClick={() => createPageForChild(item.id, child.id)}>
                                          Taslak Sayfa Oluştur
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </article>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="a-card nav-page-hub">
          <div className="a-card-head">
            <h3>Sayfa Havuzu</h3>
            <span className="nav-inline-note">Header’a bağlı ve bağımsız sayfalar.</span>
          </div>

          <div className="a-panel nav-page-hub-panel">
            <section className="nav-page-group">
              <div className="nav-page-group-head">
                <p>Header’a Bağlı Sayfalar</p>
                <span>{linkedPages.length}</span>
              </div>

              {linkedPages.length === 0 ? (
                <div className="nav-child-empty">Henüz hiçbir menü sayfaya bağlanmadı.</div>
              ) : (
                <div className="nav-page-list">
                  {linkedPages.map((page) => {
                    const binding = bindingMap.get(page.id)

                    return (
                      <article className="nav-page-card" key={page.id}>
                        <div className="nav-page-card-head">
                          <div>
                            <h4>{page.title || '(Başlıksız sayfa)'}</h4>
                            <span>{binding?.menuLabel ?? 'Header dışı'}</span>
                          </div>
                          <span className={`a-badge ${pageStatusClass(page.status)}`}>
                            {pageStatusLabel(page.status)}
                          </span>
                        </div>

                        <div className="nav-page-card-sub">
                          <span className="nav-route-chip">{binding?.menuPath ?? `/${page.slug}`}</span>
                          <small>{binding?.level === 'dropdown' ? 'Dropdown' : 'Ana Menü'}</small>
                        </div>

                        <div className="nav-page-card-actions">
                          <button className="a-btn a-btn-ghost a-btn-sm" type="button" onClick={() => navigate(`/admin/site-pages/${page.id}`)}>
                            Düzenle
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="nav-page-group">
              <div className="nav-page-group-head">
                <p>Bağımsız Sayfalar</p>
                <span>{freePages.length}</span>
              </div>

              {freePages.length === 0 ? (
                <div className="nav-child-empty">Tüm aktif sayfalar şu anda header’a bağlı.</div>
              ) : (
                <div className="nav-page-list">
                  {freePages.map((page) => (
                    <article className="nav-page-card" key={page.id}>
                      <div className="nav-page-card-head">
                        <div>
                          <h4>{page.title || '(Başlıksız sayfa)'}</h4>
                          <span>Henüz bir menüye bağlanmadı</span>
                        </div>
                        <span className={`a-badge ${pageStatusClass(page.status)}`}>
                          {pageStatusLabel(page.status)}
                        </span>
                      </div>

                      <div className="nav-page-card-sub">
                        <span className="nav-route-chip">{`/${page.slug}`}</span>
                        <small>Bağımsız</small>
                      </div>

                      <div className="nav-page-card-actions">
                        <button className="a-btn a-btn-ghost a-btn-sm" type="button" onClick={() => navigate(`/admin/site-pages/${page.id}`)}>
                          Düzenle
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </aside>
      </div>
    </>
  )
}
