// ── Types ──────────────────────────────────────────────────────────────────

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
  navLinks: string[]
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

// ── Storage ────────────────────────────────────────────────────────────────

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

export const updateNavLinks = (navLinks: string[]) => patch(c => ({ ...c, navLinks }))
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

export async function uploadToS3(_file: File): Promise<UploadResult> {
  // TODO: Amazon S3 bağlantısı buraya gelecek
  // const formData = new FormData()
  // formData.append('file', file)
  // const res = await fetch('/api/upload', { method: 'POST', body: formData })
  // return res.json()
  throw new Error('S3 henüz bağlanmadı')
}
