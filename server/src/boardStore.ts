import fs from 'node:fs'
import path from 'node:path'
import { TEAM_ZONE_COUNT, getZoneByPixel } from './teamZones.js'

export type Pixel = string

export type BoardState = {
  width: number
  height: number
  pixels: Pixel[]
  zoneOwners: Record<number, string | null>
}

const BOARD_WIDTH = 256
const BOARD_HEIGHT = 256

const DATA_DIR = path.resolve(process.cwd(), 'data')
const BOARD_FILE = path.join(DATA_DIR, 'board.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function createEmptyBoard(): BoardState {
  const zoneOwners: Record<number, string | null> = {}
  for (let i = 0; i < TEAM_ZONE_COUNT; i++) zoneOwners[i] = null
  return {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    pixels: new Array(BOARD_WIDTH * BOARD_HEIGHT).fill('#ffffff'),
    zoneOwners,
  }
}

export class BoardStore {
  private state: BoardState

  constructor() {
    ensureDataDir()
    this.state = this.load()
  }

  private load(): BoardState {
    try {
      if (fs.existsSync(BOARD_FILE)) {
        const raw = fs.readFileSync(BOARD_FILE, 'utf8')
        const parsed = JSON.parse(raw) as BoardState
        if (
          typeof parsed.width === 'number' &&
          typeof parsed.height === 'number' &&
          Array.isArray(parsed.pixels)
        ) {
          if (!parsed.zoneOwners) {
            const zoneOwners: Record<number, string | null> = {}
            for (let i = 0; i < TEAM_ZONE_COUNT; i++) zoneOwners[i] = null
            parsed.zoneOwners = zoneOwners
          }
          return parsed
        }
      }
    } catch (e) {
      console.error('Failed to load board, using empty one', e)
    }
    const empty = createEmptyBoard()
    this.save(empty)
    return empty
  }

  private save(state: BoardState) {
    try {
      fs.writeFileSync(BOARD_FILE, JSON.stringify(state), 'utf8')
    } catch (e) {
      console.error('Failed to save board', e)
    }
  }

  getState(): BoardState {
    return this.state
  }

  reset(): BoardState {
    const next = createEmptyBoard()
    this.state = next
    this.save(this.state)
    return this.state
  }

  private getUserZone(userId: string): number | null {
    for (const [zoneId, owner] of Object.entries(this.state.zoneOwners)) {
      if (owner === userId) return Number(zoneId)
    }
    return null
  }

  claimZone(userId: string, zoneId: number) {
    if (!Number.isFinite(zoneId) || zoneId < 0 || zoneId >= TEAM_ZONE_COUNT) {
      return { ok: false, error: 'invalid_zone' as const }
    }
    const currentOwner = this.state.zoneOwners[zoneId]
    if (currentOwner && currentOwner !== userId) {
      return { ok: false, error: 'zone_taken' as const, ownerId: currentOwner }
    }
    const existingZone = this.getUserZone(userId)
    if (existingZone !== null && existingZone !== zoneId) {
      return { ok: false, error: 'user_already_claimed' as const, zoneId: existingZone }
    }
    this.state.zoneOwners[zoneId] = userId
    this.save(this.state)
    return { ok: true, zoneId }
  }

  canDraw(userId: string | undefined, x: number, y: number) {
    if (!userId) return { ok: false, error: 'user_required' as const }
    const zoneId = getZoneByPixel(x, y, this.state.width, this.state.height)
    if (zoneId === null) return { ok: false, error: 'invalid_pixel' as const }
    const owner = this.state.zoneOwners[zoneId]
    if (!owner) {
      const claim = this.claimZone(userId, zoneId)
      if (claim.ok) return { ok: true, zoneId, claimed: true }
      return { ok: false, error: claim.error, zoneId, ownerId: (claim as any).ownerId }
    }
    if (owner !== userId) {
      return { ok: false, error: 'zone_taken' as const, zoneId, ownerId: owner }
    }
    return { ok: true, zoneId }
  }

  setPixel(userId: string | undefined, x: number, y: number, color: string) {
    if (
      x < 0 ||
      y < 0 ||
      x >= this.state.width ||
      y >= this.state.height ||
      typeof color !== 'string'
    ) {
      return { ok: false, error: 'invalid_pixel' as const }
    }
    const allowed = this.canDraw(userId, x, y)
    if (!allowed.ok) return { ok: false, error: allowed.error, zoneId: allowed.zoneId, ownerId: (allowed as any).ownerId }
    const idx = y * this.state.width + x
    this.state.pixels[idx] = color
    this.save(this.state)
    return { ok: true, zoneId: allowed.zoneId, claimed: (allowed as any).claimed }
  }
}
