import express, { Request, Response } from 'express'
import cors from 'cors'
import handler from '../api/index'

export const app = express()

// Middlewares
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// Route all API requests through the universal handler
app.use('/api', (req: Request, res: Response) => {
  handler(req, res)
})
app.use('/admin', (req: Request, res: Response) => {
  handler(req, res)
})
app.use('/track', (req: Request, res: Response) => {
  handler(req, res)
})

export default app
