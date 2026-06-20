import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const router = Router()
const UPLOAD_DIR = path.join(__dirname, '../../src/uploads')

// Klasörün varlığını garanti et
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// --- Multer ayarı ---
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const folder = (req.query.folder as string) || ''
    const dest = path.join(UPLOAD_DIR, folder)
    fs.mkdirSync(dest, { recursive: true })
    cb(null, dest)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

// --- Klasör listele ---
router.get('/browse', (req: Request, res: Response) => {
  const folder = (req.query.folder as string) || ''
  const dir = path.join(UPLOAD_DIR, folder)

  if (!dir.startsWith(UPLOAD_DIR)) {
    res.status(400).json({ error: 'Geçersiz yol' }); return
  }

  if (!fs.existsSync(dir)) {
    res.status(404).json({ error: 'Klasör bulunamadı' }); return
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const folders = entries
    .filter(e => e.isDirectory())
    .map(e => ({ name: e.name, path: folder ? `${folder}/${e.name}` : e.name }))

  const files = entries
    .filter(e => e.isFile())
    .map(e => {
      const filePath = path.join(dir, e.name)
      const stat = fs.statSync(filePath)
      const relPath = folder ? `${folder}/${e.name}` : e.name
      return {
        name: e.name,
        path: relPath,
        url: `/uploads/${relPath}`,
        size: stat.size,
        mtime: stat.mtime.toISOString(),
        type: getMimeCategory(e.name),
      }
    })

  res.json({ folder, folders, files })
})

// --- Klasör oluştur ---
router.post('/folder', (req: Request, res: Response) => {
  const { folder, name } = req.body as { folder?: string; name: string }
  if (!name || /[/\\.]/.test(name)) {
    res.status(400).json({ error: 'Geçersiz klasör adı' }); return
  }
  const dir = path.join(UPLOAD_DIR, folder || '', name)
  if (!dir.startsWith(UPLOAD_DIR)) {
    res.status(400).json({ error: 'Geçersiz yol' }); return
  }
  fs.mkdirSync(dir, { recursive: true })
  res.json({ ok: true })
})

// --- Dosya yükle ---
router.post('/upload', upload.array('files'), (req: Request, res: Response) => {
  const uploaded = (req.files as Express.Multer.File[]).map(f => ({
    name: f.originalname,
    filename: f.filename,
    size: f.size,
    url: `/uploads/${(req.query.folder as string) ? `${req.query.folder}/` : ''}${f.filename}`,
  }))
  res.json({ ok: true, files: uploaded })
})

// --- Sil ---
router.delete('/delete', (req: Request, res: Response) => {
  const filePath = (req.query.path as string) || ''
  const target = path.join(UPLOAD_DIR, filePath)
  if (!target.startsWith(UPLOAD_DIR) || !filePath) {
    res.status(400).json({ error: 'Geçersiz yol' }); return
  }
  if (!fs.existsSync(target)) {
    res.status(404).json({ error: 'Bulunamadı' }); return
  }
  const stat = fs.statSync(target)
  if (stat.isDirectory()) fs.rmSync(target, { recursive: true })
  else fs.unlinkSync(target)
  res.json({ ok: true })
})

// --- Yeniden adlandır ---
router.patch('/rename', (req: Request, res: Response) => {
  const { path: oldRel, newName } = req.body as { path: string; newName: string }
  if (!oldRel || !newName || /[/\\]/.test(newName)) {
    res.status(400).json({ error: 'Geçersiz istek' }); return
  }
  const oldPath = path.join(UPLOAD_DIR, oldRel)
  const newPath = path.join(path.dirname(oldPath), newName)
  if (!oldPath.startsWith(UPLOAD_DIR) || !newPath.startsWith(UPLOAD_DIR)) {
    res.status(400).json({ error: 'Geçersiz yol' }); return
  }
  fs.renameSync(oldPath, newPath)
  res.json({ ok: true })
})

function getMimeCategory(filename: string): 'image' | 'video' | 'audio' | 'document' {
  const ext = path.extname(filename).toLowerCase()
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'].includes(ext)) return 'image'
  if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) return 'video'
  if (['.mp3', '.wav', '.ogg', '.aac'].includes(ext)) return 'audio'
  return 'document'
}

export default router
