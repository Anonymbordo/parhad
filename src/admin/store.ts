export type RibEvent = {
  id: string
  side: 'left' | 'right'
  offset: string
  level: string
  region: string
  title: string
  meta: string
  overview: string
  slug: string
  stats: string[]
  items: { kind: string; title: string; meta: string; blurb: string }[]
  focus: {
    groupX: number; groupY: number
    cameraX: number; cameraY: number; cameraZ: number
    lookAtY: number; rotationY: number; rotationX: number; fov: number
  }
}

export type BulletinStrip = { label: string; items: string[] }

export type OverflowPage = {
  eyebrow: string; title: string; body: string; meta: string
}

export type SiteContent = {
  navLinks: string[]
  ribEvents: RibEvent[]
  overflowBulletins: BulletinStrip[]
  overflowPages: OverflowPage[]
}

const STORE_KEY = 'parhad_content'

export function getContent(): SiteContent | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveContent(content: SiteContent) {
  localStorage.setItem(STORE_KEY, JSON.stringify(content))
  window.dispatchEvent(new Event('parhad_content_updated'))
}

export function updateNavLinks(navLinks: string[]) {
  const content = getContent()
  if (content) saveContent({ ...content, navLinks })
}

export function updateRibEvents(ribEvents: RibEvent[]) {
  const content = getContent()
  if (content) saveContent({ ...content, ribEvents })
}

export function updateBulletins(overflowBulletins: BulletinStrip[]) {
  const content = getContent()
  if (content) saveContent({ ...content, overflowBulletins })
}

export function updatePages(overflowPages: OverflowPage[]) {
  const content = getContent()
  if (content) saveContent({ ...content, overflowPages })
}
