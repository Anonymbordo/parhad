import express from 'express'
import cors from 'cors'
import path from 'path'
import fileRoutes from './routes/files'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

// Yüklenen dosyaları statik olarak sun
app.use('/uploads', express.static(path.join(__dirname, '../src/uploads')))

// API rotaları
app.use('/api/files', fileRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`PARHAD Backend çalışıyor: http://localhost:${PORT}`)
})
