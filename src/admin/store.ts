// ── Types ──────────────────────────────────────────────────────────────────

export type NavLinkChild = {
  id: string
  label: string
  slug: string
  pageId: string | null
}

export type NavLinkItem = {
  id: string
  label: string
  slug: string
  pageId: string | null
  children: NavLinkChild[]
}

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

export type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  status: 'published' | 'draft' | 'trash'
  categories: string[]
  tags: string[]
  author: string
  date: string
  featuredImage: string
  commentCount: number
}

export type Page = {
  id: string
  title: string
  slug: string
  content: string
  status: 'published' | 'draft' | 'trash'
  template: 'default' | 'full-width' | 'landing'
  date: string
  order: number
}

export type MediaItem = {
  id: string
  name: string
  url: string
  type: 'image' | 'video' | 'document' | 'audio'
  mimeType: string
  size: string
  alt: string
  caption: string
  date: string
  // S3 için hazır alanlar
  s3Key?: string
  s3Bucket?: string
}

export type Comment = {
  id: string
  postId: string
  postTitle: string
  author: string
  email: string
  content: string
  date: string
  status: 'approved' | 'pending' | 'spam' | 'trash'
}

export type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'author' | 'contributor' | 'subscriber'
  avatar: string
  date: string
  postCount: number
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string
  count: number
}

export type Tag = {
  id: string
  name: string
  slug: string
  count: number
}

export type SiteSettings = {
  siteName: string
  tagline: string
  siteUrl: string
  adminEmail: string
  description: string
  phone: string
  address: string
  facebook: string
  twitter: string
  instagram: string
  youtube: string
  postsPerPage: number
  allowComments: boolean
  moderateComments: boolean
  timeZone: string
  dateFormat: string
  language: string
}

export type SiteContent = {
  navLinks: NavLinkItem[]
  ribEvents: RibEvent[]
  overflowBulletins: BulletinStrip[]
  overflowPages: OverflowPage[]
  posts: Post[]
  pages: Page[]
  media: MediaItem[]
  comments: Comment[]
  users: User[]
  categories: Category[]
  tags: Tag[]
  settings: SiteSettings
}

// ── Default Settings ───────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'PARHAD',
  tagline: 'Paramedik ve Hastane Öncesi Acil Tıp Derneği',
  siteUrl: '',
  adminEmail: '',
  description: '',
  phone: '',
  address: '',
  facebook: '',
  twitter: '',
  instagram: '',
  youtube: '',
  postsPerPage: 10,
  allowComments: true,
  moderateComments: true,
  timeZone: 'Europe/Istanbul',
  dateFormat: 'DD.MM.YYYY',
  language: 'tr',
}

function fallbackNavId(label: string, index: number, prefix: 'nav' | 'subnav') {
  const base = slugify(label) || prefix
  return `${prefix}-${base}-${index + 1}`
}

function normalizeNavChild(raw: unknown, parentLabel: string, index: number): NavLinkChild {
  if (typeof raw === 'string') {
    const label = raw.trim() || `${parentLabel} Alt Sayfa ${index + 1}`
    return {
      id: fallbackNavId(label, index, 'subnav'),
      label,
      slug: slugify(label),
      pageId: null,
    }
  }

  if (raw && typeof raw === 'object') {
    const child = raw as Partial<NavLinkChild>
    const label = typeof child.label === 'string' && child.label.trim()
      ? child.label.trim()
      : `${parentLabel} Alt Sayfa ${index + 1}`
    const slug = typeof child.slug === 'string' && child.slug.trim()
      ? slugify(child.slug)
      : slugify(label)

    return {
      id: typeof child.id === 'string' && child.id.trim()
        ? child.id
        : fallbackNavId(label, index, 'subnav'),
      label,
      slug,
      pageId: typeof child.pageId === 'string' && child.pageId.trim() ? child.pageId : null,
    }
  }

  const label = `${parentLabel} Alt Sayfa ${index + 1}`
  return {
    id: fallbackNavId(label, index, 'subnav'),
    label,
    slug: slugify(label),
    pageId: null,
  }
}

function normalizeNavLink(raw: unknown, index: number): NavLinkItem {
  if (typeof raw === 'string') {
    const label = raw.trim() || `Menü ${index + 1}`
    return {
      id: fallbackNavId(label, index, 'nav'),
      label,
      slug: slugify(label),
      pageId: null,
      children: [],
    }
  }

  if (raw && typeof raw === 'object') {
    const item = raw as Partial<NavLinkItem> & { children?: unknown[] }
    const label = typeof item.label === 'string' && item.label.trim()
      ? item.label.trim()
      : `Menü ${index + 1}`
    const slug = typeof item.slug === 'string' && item.slug.trim()
      ? slugify(item.slug)
      : slugify(label)
    const children = Array.isArray(item.children)
      ? item.children.map((child, childIndex) => normalizeNavChild(child, label, childIndex))
      : []

    return {
      id: typeof item.id === 'string' && item.id.trim()
        ? item.id
        : fallbackNavId(label, index, 'nav'),
      label,
      slug,
      pageId: typeof item.pageId === 'string' && item.pageId.trim() ? item.pageId : null,
      children,
    }
  }

  return {
    id: fallbackNavId(`Menü ${index + 1}`, index, 'nav'),
    label: `Menü ${index + 1}`,
    slug: `menu-${index + 1}`,
    pageId: null,
    children: [],
  }
}

function normalizeSiteContent(raw: unknown): SiteContent | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const parsed = raw as Partial<SiteContent>

  return {
    navLinks: Array.isArray(parsed.navLinks)
      ? parsed.navLinks.map((item, index) => normalizeNavLink(item, index))
      : [],
    ribEvents: Array.isArray(parsed.ribEvents) ? parsed.ribEvents : [],
    overflowBulletins: Array.isArray(parsed.overflowBulletins) ? parsed.overflowBulletins : [],
    overflowPages: Array.isArray(parsed.overflowPages) ? parsed.overflowPages : [],
    posts: Array.isArray(parsed.posts) ? parsed.posts : [],
    pages: Array.isArray(parsed.pages) ? parsed.pages : [],
    media: Array.isArray(parsed.media) ? parsed.media : [],
    comments: Array.isArray(parsed.comments) ? parsed.comments : [],
    users: Array.isArray(parsed.users) ? parsed.users : [],
    categories: Array.isArray(parsed.categories) ? parsed.categories : [],
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    settings: {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings ?? {}),
    },
  }
}

// ── Storage ────────────────────────────────────────────────────────────────

const STORE_KEY = 'parhad_content'

export function getContent(): SiteContent | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) {
      return null
    }

    return normalizeSiteContent(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveContent(content: SiteContent) {
  localStorage.setItem(STORE_KEY, JSON.stringify(content))
  window.dispatchEvent(new Event('parhad_content_updated'))
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Updaters ───────────────────────────────────────────────────────────────

function patch(updater: (c: SiteContent) => SiteContent) {
  const c = getContent()
  if (c) saveContent(updater(c))
}

export const updateNavLinks = (navLinks: NavLinkItem[]) => patch(c => ({ ...c, navLinks }))
export const updateRibEvents = (ribEvents: RibEvent[]) => patch(c => ({ ...c, ribEvents }))
export const updateBulletins = (overflowBulletins: BulletinStrip[]) => patch(c => ({ ...c, overflowBulletins }))
export const updateOverflowPages = (overflowPages: OverflowPage[]) => patch(c => ({ ...c, overflowPages }))
export const updatePosts = (posts: Post[]) => patch(c => ({ ...c, posts }))
export const updatePages = (pages: Page[]) => patch(c => ({ ...c, pages }))
export const updateMedia = (media: MediaItem[]) => patch(c => ({ ...c, media }))
export const updateComments = (comments: Comment[]) => patch(c => ({ ...c, comments }))
export const updateUsers = (users: User[]) => patch(c => ({ ...c, users }))
export const updateCategories = (categories: Category[]) => patch(c => ({ ...c, categories }))
export const updateTags = (tags: Tag[]) => patch(c => ({ ...c, tags }))
export const updateSettings = (settings: SiteSettings) => patch(c => ({ ...c, settings }))

// ── S3 Upload Hook (Amazon bağlandığında burası dolar) ─────────────────────

export type UploadResult = { url: string; key: string }

export async function uploadToS3(file: File): Promise<UploadResult> {
  void file
  // TODO: Amazon S3 bağlantısı buraya gelecek
  // const formData = new FormData()
  // formData.append('file', file)
  // const res = await fetch('/api/upload', { method: 'POST', body: formData })
  // return res.json()
  throw new Error('S3 henüz bağlanmadı')
}
