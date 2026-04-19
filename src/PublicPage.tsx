import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getContent, type Page } from './admin/store'
import './PublicPage.css'

function getSiteContent() {
  return getContent()
}

export default function PublicPage() {
  const { pathname } = useLocation()
  const slug = pathname.replace(/^\//, '').replace(/\/$/, '')

  const [page, setPage] = useState<Page | null | 'loading'>('loading')

  useEffect(() => {
    const content = getSiteContent()
    if (!content) { setPage(null); return }
    const found = content.pages.find(
      (p) => p.slug === slug && p.status !== 'trash'
    )
    setPage(found ?? null)
  }, [slug])

  useEffect(() => {
    function onUpdate() {
      const content = getSiteContent()
      if (!content) { setPage(null); return }
      const found = content.pages.find(
        (p) => p.slug === slug && p.status !== 'trash'
      )
      setPage(found ?? null)
    }
    window.addEventListener('parhad_content_updated', onUpdate)
    return () => window.removeEventListener('parhad_content_updated', onUpdate)
  }, [slug])

  if (page === 'loading') {
    return (
      <div className="pub-shell">
        <div className="pub-loading">Yükleniyor…</div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="pub-shell">
        <header className="pub-header">
          <a href="/" className="pub-logo-link">
            <img src="/parhad-logo-horizontal.png" alt="PARHAD" className="pub-logo" />
          </a>
        </header>
        <div className="pub-not-found">
          <h1>404</h1>
          <p>Bu sayfa bulunamadı.</p>
          <a href="/">Ana sayfaya dön</a>
        </div>
      </div>
    )
  }

  return (
    <div className={`pub-shell pub-template-${page.template}`}>
      <header className="pub-header">
        <a href="/" className="pub-logo-link">
          <img src="/parhad-logo-horizontal.png" alt="PARHAD" className="pub-logo" />
        </a>
        <nav className="pub-nav">
          <a href="/">Ana Sayfa</a>
        </nav>
      </header>

      <main className="pub-main">
        <div className="pub-content-wrap">
          <h1 className="pub-title">{page.title}</h1>
          <div
            className="pub-body"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </main>

      <footer className="pub-footer">
        <p>© PARHAD – Paramedik ve Hastane Öncesi Acil Tıp Derneği</p>
      </footer>
    </div>
  )
}
