import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import path from 'node:path'
import fs from 'node:fs'
import { Server } from 'socket.io'
import { BoardStore } from './boardStore.js'
import { DataStore } from './dataStore.js'

const PORT = Number(process.env.PORT ?? 4000)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? ''

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: '*' },
})

const boardStore = new BoardStore()
const dataStore = new DataStore()

app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '10mb' }))
const publicDirCandidates = [
  path.resolve(process.cwd(), 'public'),
  path.resolve(process.cwd(), 'server/public'),
]
const publicDir = publicDirCandidates.find((dir) => fs.existsSync(dir)) ?? publicDirCandidates[0]
app.use(express.static(publicDir))

// ── Pixel Board ──

app.get('/api/board', (_req, res) => {
  const state = boardStore.getState()
  res.json({ ...state, updatedAt: new Date().toISOString() })
})

app.post('/api/pixel', (req, res) => {
  const { x, y, color, userId } = req.body as { x: number; y: number; color: string; userId?: string }
  if (typeof x !== 'number' || typeof y !== 'number' || typeof color !== 'string' || !userId) {
    res.status(400).json({ error: 'Invalid pixel payload' })
    return
  }

  const result = boardStore.setPixel(userId, x, y, color)
  if (!result.ok) {
    res.status(403).json({ error: result.error, zoneId: result.zoneId, ownerId: result.ownerId })
    return
  }
  io.emit('pixel:update', { x, y, color })
  if (result.claimed) {
    io.emit('zone:update', { zoneOwners: boardStore.getState().zoneOwners })
  }
  res.json({ ok: true, zoneId: result.zoneId })
})

// ── Users ──

app.post('/api/users', (req, res) => {
  const { name, avatarUrl } = req.body as { name?: string; avatarUrl?: string }
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Name is required' })
    return
  }
  const user = dataStore.createUser(name.trim().slice(0, 30), avatarUrl)
  res.json(user)
})

app.get('/api/users/:id', (req, res) => {
  const user = dataStore.getUser(req.params.id)
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json(user)
})

app.put('/api/users/:id/name', (req, res) => {
  const { name } = req.body as { name?: string }
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Name is required' })
    return
  }
  const user = dataStore.updateUserName(req.params.id, name.trim().slice(0, 30))
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json(user)
})

app.put('/api/users/:id/avatar', (req, res) => {
  const { avatarUrl } = req.body as { avatarUrl?: string }
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    res.status(400).json({ error: 'avatarUrl is required' })
    return
  }
  const user = dataStore.updateUserAvatar(req.params.id, avatarUrl)
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json(user)
})

app.post('/api/users/:id/game-result', (req, res) => {
  const { score, coinsEarned } = req.body as { score?: number; coinsEarned?: number }
  if (typeof score !== 'number' || typeof coinsEarned !== 'number') {
    res.status(400).json({ error: 'score and coinsEarned are required' })
    return
  }
  const user = dataStore.recordGameResult(req.params.id, score, coinsEarned)
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  io.emit('leaderboard:update')
  res.json(user)
})

// ── Leaderboard ──

app.get('/api/leaderboard', (_req, res) => {
  res.json(dataStore.getLeaderboard())
})

// ── Zones ──
app.post('/api/zone/claim', (req, res) => {
  const { userId, zoneId } = req.body as { userId?: string; zoneId?: number }
  if (!userId || typeof zoneId !== 'number') {
    res.status(400).json({ error: 'userId and zoneId are required' })
    return
  }
  const result = boardStore.claimZone(userId, zoneId)
  if (!result.ok) {
    res.status(409).json(result)
    return
  }
  io.emit('zone:update', { zoneOwners: boardStore.getState().zoneOwners })
  res.json({ ok: true, zoneId })
})

// ── Game Start / Reset ──
app.post('/api/game/start', (_req, res) => {
  const boardState = boardStore.reset()
  dataStore.resetLeaderboard()
  io.emit('board:reset', boardState)
  io.emit('zone:update', { zoneOwners: boardState.zoneOwners })
  io.emit('leaderboard:update')
  res.json({ ok: true })
})

// ── Merch ──

app.get('/api/merch', (_req, res) => {
  res.json(dataStore.getMerch())
})

app.post('/api/purchase/merch', (req, res) => {
  const { userId, itemId } = req.body as { userId?: string; itemId?: string }
  if (!userId || !itemId) {
    res.status(400).json({ error: 'userId and itemId are required' })
    return
  }
  const result = dataStore.purchaseMerch(userId, itemId)
  if ('error' in result) {
    res.status(400).json(result)
    return
  }
  res.json(result)
})

// ── Display Submissions ──

app.get('/api/display-submissions', (_req, res) => {
  res.json(dataStore.getDisplaySubmissions())
})

app.post('/api/display-submissions', (req, res) => {
  const { userId, image, text, composition } = req.body as {
    userId?: string
    image?: string
    text?: string
    composition?: any
  }
  if (!userId || !image || typeof text !== 'string') {
    res.status(400).json({ error: 'userId, image, and text are required' })
    return
  }
  if (image.length > MAX_IMAGE_SIZE) {
    res.status(400).json({ error: 'Image too large (max 5MB)' })
    return
  }
  const result = dataStore.createDisplaySubmission(userId, image, text, composition)
  if ('error' in result) {
    res.status(400).json(result)
    return
  }
  io.emit('display:update')
  res.json(result)
})

app.post('/api/display-submissions/clear', (req, res) => {
  const { adminKey } = req.body as { adminKey?: string }
  if (ADMIN_TOKEN && adminKey !== ADMIN_TOKEN) {
    res.status(403).json({ error: 'forbidden' })
    return
  }
  if (!ADMIN_TOKEN && !adminKey) {
    console.warn('ADMIN_TOKEN is not set; clearing display submissions without auth.')
  }
  dataStore.clearDisplaySubmissions()
  io.emit('display:update')
  res.json({ ok: true })
})

// ── Team Photos ──

app.get('/api/team-photos', (_req, res) => {
  res.json(dataStore.getTeamPhotos())
})

// ── Socket.IO ──

io.on('connection', (socket) => {
  console.log('Client connected', socket.id)

  socket.on('pixel:set', (payload: { x: number; y: number; color: string; userId?: string }) => {
    const { x, y, color, userId } = payload
    const result = boardStore.setPixel(userId, x, y, color)
    if (!result.ok) {
      socket.emit('pixel:denied', result)
      return
    }
    io.emit('pixel:update', { x, y, color })
    if (result.claimed) {
      io.emit('zone:update', { zoneOwners: boardStore.getState().zoneOwners })
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Phoenix server listening on http://localhost:${PORT}`)
})
