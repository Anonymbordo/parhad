import { Suspense, lazy, useEffect, useRef, useState, type CSSProperties } from 'react'
import './App.css'
import turkeyMapMarkup from '../tr.svg?raw'
import { getContent, saveContent, type SiteContent } from './admin/store'

const IntroModelScene = lazy(() => import('./components/IntroModelScene'))

const INTRO_AUTO_EXIT_DELAY = 5600
const INTRO_HIDE_DELAY = 1200

const navLinks = ['Hakkımızda', 'Yönetim Kurulu', 'İl Başkanları', 'Ziyaretlerimiz', 'Duyurular', 'PARHAD Akademi', 'İletişim Bilgileri']

const commandLinks = [
  'Makaleler',
  'Video Kütüphanesi',
  'Etkinlik Sayfaları',
  'Saha Notları',
  'Yorum Akışı',
]

const ribEvents = [
  {
    id: 't12-l1',
    side: 'left',
    offset: '22%',
    level: 'T12-L1',
    region: 'Torakolomber geçiş',
    title: 'Eskişehir EKG ve Disritmi Eğitimi',
    meta: '20 Ekim 2025',
    overview:
      'Torakolomber geçiş node’u eğitim günlüğü, kısa video kayıtları ve fotoğraf akışıyla ilk temas sayfası gibi çalışır.',
    slug: '/hub/t12-l1-saha-gunlugu',
    stats: ['2 makale', '1 video', '1 etkinlik'],
    items: [
      {
        kind: 'Makale',
        title: 'Eskişehir eğitim günlüğü',
        meta: '6 dk okuma',
        blurb: 'Sahadaki eğitim akışı, ekip yerleşimi ve ilk ritim çözümleme notları tek yazıda toparlanıyor.',
      },
      {
        kind: 'Video',
        title: 'Ritim çözümleme kısa kaydı',
        meta: '12:14 video',
        blurb: 'Sunumdan öne çıkan bölüm, konuşmacı vurguları ve hızlı tekrar videosu bu sayfaya bağlanıyor.',
      },
      {
        kind: 'Etkinlik',
        title: 'Fotoğraf ve yorum akışı',
        meta: 'Canlı sayfa',
        blurb: 'Katılımcı yorumları, sahne fotoğrafları ve soru-cevap başlıkları tek node içinde açılıyor.',
      },
    ],
    focus: {
      groupX: -0.08,
      groupY: -0.58,
      cameraX: -0.18,
      cameraY: 0.92,
      cameraZ: 5.65,
      lookAtY: 0.72,
      rotationY: -0.12,
      rotationX: -0.03,
      fov: 17.2,
    },
  },
  {
    id: 'l1',
    side: 'right',
    offset: '31%',
    level: 'L1',
    region: 'Birinci lomber vertebra',
    title: 'Malatya EKG ve Disritmi Eğitimi',
    meta: '10 Ekim 2025',
    overview:
      'L1 sayfası disritmi eğitiminin ana blog hub’ı gibi çalışır; video, yazı ve canlı duyuru aynı editoryal yüzeyde buluşur.',
    slug: '/hub/l1-disritmi-egitimi',
    stats: ['3 yayın', '1 kayıt', '24 yorum'],
    items: [
      {
        kind: 'Makale',
        title: 'Malatya oturumundan çıkan 5 kritik not',
        meta: '8 dk okuma',
        blurb: 'Disritmi eğitiminde öne çıkan kararlar, istasyon akışı ve sahadan özet maddeler tek yazıda.',
      },
      {
        kind: 'Video',
        title: 'EKG ritim çözümleme kaydı',
        meta: '18:32 video',
        blurb: 'Konuşmacının ekran anlatımı, ritim örnekleri ve kısa tekrar kurgusu bu içerik kartında açılacak.',
      },
      {
        kind: 'Etkinlik',
        title: 'Soru-cevap ve katılımcı akışı',
        meta: 'Canlı etkinlik sayfası',
        blurb: 'Etkinlik sonrası yorumlar, geri bildirimler ve sonraki buluşma çağrısı aynı sayfada tutulacak.',
      },
    ],
    focus: {
      groupX: 0.06,
      groupY: -0.22,
      cameraX: 0.16,
      cameraY: 0.52,
      cameraZ: 5.4,
      lookAtY: 0.32,
      rotationY: 0.1,
      rotationX: -0.02,
      fov: 16.8,
    },
  },
  {
    id: 'l2',
    side: 'left',
    offset: '46%',
    level: 'L2',
    region: 'İkinci lomber vertebra',
    title: 'İstanbul Genel Buluşma',
    meta: '26 Ekim 2025',
    overview:
      'L2 düğümü daha çok buluşma notları, kısa raporlar ve topluluk videoları için editoryal landing sayfası gibi davranır.',
    slug: '/hub/l2-genel-bulusma-notlari',
    stats: ['2 yazı', '1 video', '1 galeri'],
    items: [
      {
        kind: 'Makale',
        title: 'Genel buluşma sonrası saha notları',
        meta: '5 dk okuma',
        blurb: 'Toplantıda çıkan kararlar, il temsilciliklerinin öne çıkardığı ihtiyaçlar ve kısa özet maddeleri.',
      },
      {
        kind: 'Video',
        title: 'Katılımcı görüşleri montajı',
        meta: '09:48 video',
        blurb: 'Etkinliğe katılan ekiplerin kısa görüşleri ve sahne arkası kayıtlarından seçilmiş bölüm.',
      },
      {
        kind: 'Makale',
        title: 'Topluluk fotoğraf galerisi ve notlar',
        meta: 'Galeri yazısı',
        blurb: 'Kareler, altyazılar ve yorum başlıkları ile daha blogvari bir etkinlik hafızası oluşuyor.',
      },
    ],
    focus: {
      groupX: -0.04,
      groupY: 0.16,
      cameraX: -0.1,
      cameraY: 0.04,
      cameraZ: 5.2,
      lookAtY: -0.02,
      rotationY: -0.08,
      rotationX: -0.04,
      fov: 16.4,
    },
  },
  {
    id: 'l3',
    side: 'right',
    offset: '58%',
    level: 'L3',
    region: 'Üçüncü lomber vertebra',
    title: 'Ankara Kurumlar Arası İstişare',
    meta: '03 Kasım 2025',
    overview:
      'L3 daha kurumsal bir içerik merkezi; rapor özeti, konuşma videosu ve toplantı sonuçları burada yayınlanır.',
    slug: '/hub/l3-istisare-raporlari',
    stats: ['1 rapor', '1 video', '1 duyuru'],
    items: [
      {
        kind: 'Makale',
        title: 'İstişare toplantısının sonuç raporu',
        meta: '7 dk okuma',
        blurb: 'Gündem başlıkları, ortak kararlar ve sonraki adımlar editoryal dille tek sayfada akıyor.',
      },
      {
        kind: 'Video',
        title: 'Kurumsal değerlendirme konuşması',
        meta: '14:09 video',
        blurb: 'Toplantıdan alınan özet kayıt ve konuşmacı notları sayfaya gömülü medya olarak yerleşiyor.',
      },
      {
        kind: 'Duyuru',
        title: 'Takip takvimi ve sonraki buluşma',
        meta: 'Takvim güncellemesi',
        blurb: 'Sonraki adımlar, iletişim akışı ve katılım çağrısı bu düğümün altından açılacak.',
      },
    ],
    focus: {
      groupX: 0.08,
      groupY: 0.54,
      cameraX: 0.12,
      cameraY: -0.26,
      cameraZ: 5.1,
      lookAtY: -0.36,
      rotationY: 0.08,
      rotationX: -0.05,
      fov: 16.2,
    },
  },
  {
    id: 'l4',
    side: 'left',
    offset: '71%',
    level: 'L4',
    region: 'Dördüncü lomber vertebra',
    title: 'Gençlik Çalıştayı',
    meta: '08 Kasım 2025',
    overview:
      'L4 daha genç ve hızlı bir editorial akış taşır; kısa video, yazı serisi ve yorum ağı burada öne çıkar.',
    slug: '/hub/l4-genclik-yayinlari',
    stats: ['2 içerik', '1 kayıt', 'yorum açık'],
    items: [
      {
        kind: 'Makale',
        title: 'Gençlik çalıştayından çıkan üretim başlıkları',
        meta: '4 dk okuma',
        blurb: 'Yeni medya, gönüllülük ve saha üretimi üzerine çıkan başlıklar blog formatında sıralanıyor.',
      },
      {
        kind: 'Video',
        title: 'Kısa oturum kaydı ve öne çıkan cümleler',
        meta: '07:26 video',
        blurb: 'Çalıştaydaki enerjiyi hızlı tüketilen bir video bloğu olarak aynı node içinde tutuyor.',
      },
      {
        kind: 'Topluluk',
        title: 'Yorum alanı ve genç ekip geri bildirimleri',
        meta: 'Yorum açık',
        blurb: 'Bu başlık altında kullanıcı yorumları, öneriler ve takip notları toplanabilecek.',
      },
    ],
    focus: {
      groupX: -0.06,
      groupY: 0.9,
      cameraX: -0.16,
      cameraY: -0.56,
      cameraZ: 4.95,
      lookAtY: -0.7,
      rotationY: -0.1,
      rotationX: -0.06,
      fov: 15.9,
    },
  },
  {
    id: 'l5-s1',
    side: 'right',
    offset: '83%',
    level: 'L5-S1',
    region: 'Lumbosakral geçiş',
    title: 'İl Başkanlıkları Koordinasyon Toplantısı',
    meta: '16 Kasım 2025',
    overview:
      'L5-S1 düğümü koordinasyon arşivi gibi davranır; toplantı kayıtları, karar notları ve medya içerikleri burada birikir.',
    slug: '/hub/l5-s1-koordinasyon-arsivi',
    stats: ['Arşiv', '1 video', '1 doküman'],
    items: [
      {
        kind: 'Makale',
        title: 'Koordinasyon toplantısı karar özeti',
        meta: '6 dk okuma',
        blurb: 'İl başkanlıkları arasında alınan kararlar ve dağıtılan görevler editoryal biçimde yayına dönüyor.',
      },
      {
        kind: 'Video',
        title: 'Toplantı kaydından seçilmiş bölüm',
        meta: '11:42 video',
        blurb: 'Tam kayıt yerine özetlenmiş bölüm, konuşma anları ve altyazılı kritik parçalar ekleniyor.',
      },
      {
        kind: 'Doküman',
        title: 'Sunum dosyaları ve kaynaklar',
        meta: 'PDF / kaynak arşivi',
        blurb: 'Toplantı dosyaları, paylaşılan belgeler ve bağlantılar node sayfasının sonunda toplanacak.',
      },
    ],
    focus: {
      groupX: 0.04,
      groupY: 1.18,
      cameraX: 0.08,
      cameraY: -0.9,
      cameraZ: 4.82,
      lookAtY: -1.02,
      rotationY: 0.06,
      rotationX: -0.08,
      fov: 15.6,
    },
  },
]

const railSupportCard = {
  eyebrow: 'Sayfa Mimarisi',
  title: 'Her vertebral node kendi blog landing sayfasına dönüşecek.',
  body: 'Hero, gömülü video, yazı kartları, yorum alanı ve etkinlik çağrısı aynı tasarım dili içinde açılacak.',
}

const overflowBulletins = [
  {
    label: 'Bülten Şeridi 01',
    items: [
      'Adana saha notları yayında',
      'İzmir video özeti arşive eklendi',
      'Trabzon EKG buluşması kayıtları açıldı',
      'Konya gönüllü eğitim günlüğü yayında',
      'Mardin temsilcilik ziyareti fotoğraf akışı eklendi',
    ],
  },
  {
    label: 'Bülten Şeridi 02',
    items: [
      'Yeni yayın: Ambulans ekibi kısa röportajı',
      'Duyuru: Kasım takvimi güncellendi',
      'Blog: Saha lojistiğinde 4 kritik çıkarım',
      'Video: Ritim çözümlemede hızlı tekrar',
      'Topluluk: Yorum alanları açıldı',
    ],
  },
  {
    label: 'Bülten Şeridi 03',
    items: [
      'Gaziantep etkinlik landing sayfası hazır',
      'Bursa kurumsal ziyaret raporu eklendi',
      'Diyarbakır genç ekip notları yayında',
      'Eskişehir soru-cevap özeti arşivde',
      'Yeni galeri: Saha kareleri',
    ],
  },
]

const overflowPages = [
  {
    eyebrow: 'Öne Çıkan Sayfa',
    title: 'Kaburgalara sığmayan etkinlikler burada tam sayfa yayın akışına dönüşecek.',
    body: 'Burada daha uzun yazılar, gömülü videolar, galeri modülleri ve yorum alanları olacak. Yani üst sahne teaser, alt katman ise gerçek içerik yayını gibi davranacak.',
    meta: 'Landing / Blog / Video',
  },
  {
    eyebrow: 'Arşiv',
    title: 'İl başkanlıkları saha ziyaretleri',
    body: 'Kurum ziyaretleri, fotoğraf setleri ve kısa raporlar tek editoryal akışta birikir.',
    meta: '6 yayın',
  },
  {
    eyebrow: 'Video Kütüphanesi',
    title: 'Kısa oturumlar ve eğitim kayıtları',
    body: 'Ritim çözümleme, acil yaklaşım, ekip içi değerlendirme ve tekrar videoları ayrı kartlar halinde akar.',
    meta: '12 kayıt',
  },
  {
    eyebrow: 'Bülten',
    title: 'Aylık duyuru ve takvim şeridi',
    body: 'Süreç güncellemeleri, yaklaşan etkinlikler ve yeni yazılar kayan bülten mantığında görünür olur.',
    meta: 'Canlı akış',
  },
]

const floatingPanels = [
  {
    className: 'floating-panel-primary',
    eyebrow: 'PARHAD sahnesi',
    title: 'Parhad\nSaha\nOmurgası',
    body: 'Aşağı akışta merkez omurga bir içerik omurgasına dönüşüyor; her segment ayrı blog sayfası, video akışı ve etkinlik landing yapısı taşıyor.',
  },
  {
    className: 'floating-panel-secondary',
    eyebrow: 'Editoryal Node',
    title: 'Seçili içerik düğümü',
    body: 'Aktif seviye kendi editoryal akışıyla sağ rail üzerinde açılır.',
  },
]

const [primaryFloatingPanel, secondaryFloatingPanel] = floatingPanels

const DEFAULT_CONTENT: SiteContent = {
  navLinks,
  ribEvents,
  overflowBulletins,
  overflowPages,
}

function App() {
  const [introExiting, setIntroExiting] = useState(false)
  const [introHidden, setIntroHidden] = useState(false)
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    const stored = getContent()
    if (!stored) { saveContent(DEFAULT_CONTENT); return DEFAULT_CONTENT }
    return stored
  })
  const activeRibEvents = siteContent.ribEvents
  const [activeRegionId, setActiveRegionId] = useState<string>(activeRibEvents[1]?.id ?? activeRibEvents[0]?.id)
  const mainRef = useRef<HTMLElement | null>(null)
  const exitStartedRef = useRef(false)
  const hideTimeoutRef = useRef<number | null>(null)
  const scrollTimeoutRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const activeRegion = activeRibEvents.find((event) => event.id === activeRegionId) ?? activeRibEvents[1]

  useEffect(() => {
    function onContentUpdate() {
      const updated = getContent()
      if (updated) setSiteContent(updated)
    }
    window.addEventListener('parhad_content_updated', onContentUpdate)
    return () => window.removeEventListener('parhad_content_updated', onContentUpdate)
  }, [])

  function startIntroExit(scrollToContent: boolean) {
    if (exitStartedRef.current) {
      return
    }

    exitStartedRef.current = true
    setIntroExiting(true)

    hideTimeoutRef.current = window.setTimeout(() => {
      setIntroHidden(true)
    }, INTRO_HIDE_DELAY)

    if (scrollToContent) {
      scrollTimeoutRef.current = window.setTimeout(() => {
        mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, INTRO_HIDE_DELAY - 100)
    }
  }

  useEffect(() => {
    const exitTimeout = window.setTimeout(() => {
      if (!exitStartedRef.current) {
        startIntroExit(false)
      }
    }, INTRO_AUTO_EXIT_DELAY)

    return () => {
      window.clearTimeout(exitTimeout)
    }
  }, [])

  useEffect(() => {
    if (introHidden) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [introHidden])

  useEffect(() => {
    if (introHidden) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY <= 8) {
        return
      }

      event.preventDefault()
      startIntroExit(true)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowDown', 'PageDown', 'Enter', ' '].includes(event.key)) {
        return
      }

      event.preventDefault()
      startIntroExit(true)
    }

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null
    }

    const handleTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY

      if (touchStartYRef.current === null || currentY === undefined) {
        return
      }

      if (touchStartYRef.current - currentY < 18) {
        return
      }

      event.preventDefault()
      startIntroExit(true)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [introHidden])

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current)
      }

      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="page-shell">
      {!introHidden ? (
        <div className={`intro-overlay ${introExiting ? 'intro-overlay-exit' : ''}`}>
          <div className="intro-noise" aria-hidden="true" />
          <div className="intro-orb intro-orb-left" aria-hidden="true" />
          <div className="intro-orb intro-orb-right" aria-hidden="true" />

          <div className="intro-content">
            <div className="intro-brand-stage" aria-hidden="true">
              <img
                className="intro-round-logo"
                src="/parhad-logo-round-white.png"
                alt=""
              />
              <div className="intro-wordmark-frame">
                <img
                  className="intro-wordmark"
                  src="/parhad-logo-horizontal.png"
                  alt=""
                />
              </div>
            </div>

            <div className="intro-progress" aria-hidden="true">
              <span />
            </div>

            <button className="intro-skip" type="button" onClick={() => startIntroExit(true)}>
              Girişi Geç
            </button>
          </div>
        </div>
      ) : null}

      <main className="immersive-main" ref={mainRef}>
        <section className="scroll-world">
          <div className="sticky-world">
            <div className="world-grain" aria-hidden="true" />
            <div className="particle-cloud particle-cloud-left" aria-hidden="true" />
            <div className="particle-cloud particle-cloud-right" aria-hidden="true" />
            <div className="light-smear light-smear-top" aria-hidden="true" />
            <div className="light-smear light-smear-bottom" aria-hidden="true" />

            <header className="immersive-nav">
              <img
                className="immersive-nav-logo"
                src="/parhad-logo-horizontal.png"
                alt="PARHAD"
              />
              <nav className="nav-pill" aria-label="Primary">
                {siteContent.navLinks.map((item) => (
                  <button key={item} type="button">
                    {item}
                  </button>
                ))}
              </nav>
            </header>

            <div className="scene-layout">
              <aside className="scene-rail scene-rail-left">
                <div className="hero-panel hero-panel-copy">
                  <p className="panel-kicker">Sahne içinde ne arıyorsun?</p>
                  <ul className="command-list">
                    {commandLinks.map((item) => (
                      <li key={item}>
                        <span>-&gt;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className="command-button" type="button">
                    PARHAD ağına bağlan
                  </button>
                </div>
              </aside>

              <section className="anatomy-orbit">
                <div className="stage-frame stage-frame-primary" aria-hidden="true" />
                <div className="stage-frame stage-frame-secondary" aria-hidden="true" />
                <div className="stage-frame-glow" aria-hidden="true" />

                <article className={`floating-panel ${primaryFloatingPanel.className}`}>
                  <p>{primaryFloatingPanel.eyebrow}</p>
                  <h2>
                    {primaryFloatingPanel.title.split('\n').map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </h2>
                  <strong>{primaryFloatingPanel.body}</strong>
                  <div className="focus-dock">
                    <p className="focus-dock-label">Vertebral odak</p>
                    <div className="focus-chip-row">
                      {activeRibEvents.map((event) => (
                        <button
                          key={event.id}
                          className={`focus-chip ${activeRegionId === event.id ? 'focus-chip-active' : ''}`}
                          type="button"
                          onClick={() => setActiveRegionId(event.id)}
                        >
                          {event.level}
                        </button>
                      ))}
                    </div>
                    <span className="focus-dock-copy">
                      {`${activeRegion.level} odakta: ${activeRegion.region}. Bu node makale, video ve etkinlik sayfası gibi davranır.`}
                    </span>
                  </div>
                </article>

                <div className="model-housing">
                  <Suspense
                    fallback={
                      <div className="intro-model-fallback" aria-hidden="true">
                        <img src="/parhad-logo-round-white.png" alt="" />
                      </div>
                    }
                  >
                    <IntroModelScene focus={activeRegion?.focus ?? null} />
                  </Suspense>
                </div>

                <div className="rib-anchor-layer">
                  {ribEvents.map((event) => (
                    <article
                      className={`rib-anchor rib-anchor-${event.side}`}
                      key={`${event.title}-${event.meta}`}
                      style={{ ['--anchor-y' as const]: event.offset } as CSSProperties}
                    >
                      <span className="rib-line" aria-hidden="true" />
                      <button
                        className={`rib-node ${activeRegionId === event.id ? 'rib-node-active' : ''}`}
                        type="button"
                        onClick={() => setActiveRegionId(event.id)}
                        aria-pressed={activeRegionId === event.id}
                      >
                        <strong className="rib-node-level">{event.level}</strong>
                        <p>{event.region}</p>
                        <h3>{event.title}</h3>
                        <span>{event.meta}</span>
                      </button>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="scene-rail scene-rail-right">
                <article className={`floating-panel ${secondaryFloatingPanel.className}`}>
                  <p>{`${secondaryFloatingPanel.eyebrow} / ${activeRegion.level}`}</p>
                  <h2>{activeRegion.title}</h2>
                  <strong>{activeRegion.overview}</strong>
                  <div className="panel-stat-row">
                    {activeRegion.stats.map((item) => (
                      <span className="panel-stat-pill" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <button className="panel-link" type="button">
                    {activeRegion.slug}
                  </button>
                </article>

                <div className="feed-stack">
                  {activeRegion.items.map((item) => (
                    <article className="feed-card" key={`${activeRegion.id}-${item.title}`}>
                      <div className="feed-card-topline">
                        <p>{item.kind}</p>
                        <small>{item.meta}</small>
                      </div>
                      <h3>{item.title}</h3>
                      <span>{item.blurb}</span>
                    </article>
                  ))}
                  <article className="feed-card feed-card-support">
                    <p>{railSupportCard.eyebrow}</p>
                    <h3>{railSupportCard.title}</h3>
                    <span>{railSupportCard.body}</span>
                  </article>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="bulletin-world">
          <div className="bulletin-shell">
            <div className="bulletin-heading">
              <p>Alt yayın katmanı</p>
              <h2>Kaburgalara sığmayan etkinlikler aşağıda bülten şeritleri ve tam sayfa içerikler olarak akacak.</h2>
              <span>
                Üst bölüm seçili node’ları öne çıkarıyor. Bu alt bölüm ise tüm etkinlikleri,
                videoları ve blog yazılarını şeritler ve geniş kartlar içinde topluyor.
              </span>
            </div>

            <div className="bulletin-strip-stack">
              {siteContent.overflowBulletins.map((track, index) => (
                <div
                  className={`bulletin-strip ${index % 2 === 1 ? 'bulletin-strip-reverse' : ''}`}
                  key={track.label}
                >
                  <div className="bulletin-strip-inner">
                    {[...track.items, ...track.items].map((item, itemIndex) => (
                      <span className="bulletin-pill" key={`${track.label}-${item}-${itemIndex}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bulletin-grid">
              {siteContent.overflowPages.map((page) => (
                <article className="bulletin-card" key={page.title}>
                  <p>{page.eyebrow}</p>
                  <h3>{page.title}</h3>
                  <span>{page.body}</span>
                  <strong>{page.meta}</strong>
                </article>
              ))}
            </div>

            <div className="map-stage">
              <div className="map-stage-label">
                <p>İl Başkanları</p>
              </div>
              <article className="map-panel map-panel-maponly">
                <div
                  className="map-visual-wrap map-visual-inline"
                  role="img"
                  aria-label="Türkiye haritası"
                  dangerouslySetInnerHTML={{ __html: turkeyMapMarkup }}
                />
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
