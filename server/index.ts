import path from 'path'
import fs from 'fs'
import express, { Request, Response } from 'express'
import app from './app'

const PORT = process.env.PORT || 3001

// Serve built frontend assets if dist folder exists (for production/preview)
const distPath = path.resolve(process.cwd(), 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.use((req: Request, res: Response, next: any) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'))
    }
    next()
  })
}

// Start standalone HTTP server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[Server] Secure Admin & Analytics API running on http://127.0.0.1:${PORT}`)
})
