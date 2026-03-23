import fs from 'node:fs'
import path from 'node:path'

export type Pixel = string

export type BoardState = {
  width: number
  height: number
  pixels: Pixel[]
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
  return {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    pixels: new Array(BOARD_WIDTH * BOARD_HEIGHT).fill('#ffffff'),
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

  setPixel(x: number, y: number, color: string): BoardState {
    if (
      x < 0 ||
      y < 0 ||
      x >= this.state.width ||
      y >= this.state.height ||
      typeof color !== 'string'
    ) {
      return this.state
    }
    const idx = y * this.state.width + x
    this.state.pixels[idx] = color
    this.save(this.state)
    return this.state
  }
}

