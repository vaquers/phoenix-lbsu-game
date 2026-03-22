import { create } from 'zustand'
import type { GamePhase, LaneIndex, PlayerState } from '../utils/types'
import type { ObstacleEntity, CoinEntity, PlatformEntity } from '../utils/types'
import {
  LANE_OFFSETS,
  BASE_SPEED,
  MAX_SPEED,
  HIGH_SCORE_KEY,
} from '../utils/constants'

const getStoredHighScore = (): number => {
  try {
    const v = localStorage.getItem(HIGH_SCORE_KEY)
    return v ? Math.max(0, parseInt(v, 10)) : 0
  } catch {
    return 0
  }
}

export interface GameStore {
  phase: GamePhase
  setPhase: (p: GamePhase) => void

  laneIndex: LaneIndex
  targetLaneIndex: LaneIndex
  playerState: PlayerState
  playerX: number
  playerY: number
  playerZ: number
  velocityY: number
  isGrounded: boolean
  groundLevel: number
  setLaneIndex: (l: LaneIndex) => void
  setTargetLaneIndex: (l: LaneIndex) => void
  setPlayerState: (s: PlayerState) => void
  setPlayerPosition: (x: number, y: number, z: number) => void

  worldOffsetZ: number
  addWorldOffsetZ: (dz: number) => void
  resetWorldOffsetZ: () => void

  speed: number
  setSpeed: (s: number) => void

  distance: number
  addDistance: (d: number) => void
  resetDistance: () => void

  obstacles: ObstacleEntity[]
  coins: CoinEntity[]
  platforms: PlatformEntity[]
  setObstacles: (o: ObstacleEntity[]) => void
  setCoins: (c: CoinEntity[]) => void
  setPlatforms: (p: PlatformEntity[]) => void
  addObstacle: (o: ObstacleEntity) => void
  addCoins: (c: CoinEntity[]) => void
  addPlatforms: (p: PlatformEntity[]) => void
  removeObstacle: (id: string) => void
  collectCoin: (id: string) => void

  score: number
  coinsCollected: number
  highScore: number
  addScore: (n: number) => void
  addCoinsCollected: (n: number) => void
  saveHighScore: () => void
  resetScores: () => void

  reset: () => void
}

const initialLane: LaneIndex = 1
const initialX = LANE_OFFSETS[initialLane]

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'menu',
  setPhase: (phase) => set({ phase }),

  laneIndex: initialLane,
  targetLaneIndex: initialLane,
  playerState: 'run',
  playerX: initialX,
  playerY: 0,
  playerZ: 0,
  velocityY: 0,
  isGrounded: true,
  groundLevel: 0,
  setLaneIndex: (laneIndex) => set({ laneIndex }),
  setTargetLaneIndex: (targetLaneIndex) => set({ targetLaneIndex }),
  setPlayerState: (playerState) => set({ playerState }),
  setPlayerPosition: (playerX, playerY, playerZ) => set({ playerX, playerY, playerZ }),

  worldOffsetZ: 0,
  addWorldOffsetZ: (dz) => set((s) => ({ worldOffsetZ: s.worldOffsetZ + dz })),
  resetWorldOffsetZ: () => set({ worldOffsetZ: 0 }),

  speed: BASE_SPEED,
  setSpeed: (speed) => set(() => ({ speed: Math.min(MAX_SPEED, Math.max(BASE_SPEED, speed)) })),

  distance: 0,
  addDistance: (d) => set((s) => ({ distance: s.distance + d })),
  resetDistance: () => set({ distance: 0 }),

  obstacles: [],
  coins: [],
  platforms: [],
  setObstacles: (obstacles) => set({ obstacles }),
  setCoins: (coins) => set({ coins }),
  setPlatforms: (platforms) => set({ platforms }),
  addObstacle: (o) => set((s) => ({ obstacles: [...s.obstacles, o] })),
  addCoins: (c) => set((s) => ({ coins: [...s.coins, ...c] })),
  addPlatforms: (p) => set((s) => ({ platforms: [...s.platforms, ...p] })),
  removeObstacle: (id) => set((s) => ({ obstacles: s.obstacles.filter((x) => x.id !== id) })),
  collectCoin: (id) =>
    set((s) => ({
      coins: s.coins.map((c) => (c.id === id ? { ...c, collected: true } : c)),
    })),

  score: 0,
  coinsCollected: 0,
  highScore: getStoredHighScore(),
  addScore: (n) =>
    set((s) => {
      const score = s.score + n
      const highScore = Math.max(s.highScore, score)
      return { score, highScore }
    }),
  addCoinsCollected: (n) => set((s) => ({ coinsCollected: s.coinsCollected + n })),
  saveHighScore: () => {
    const { highScore } = get()
    try {
      localStorage.setItem(HIGH_SCORE_KEY, String(highScore))
    } catch {}
  },
  resetScores: () =>
    set({
      score: 0,
      coinsCollected: 0,
      highScore: getStoredHighScore(),
    }),

  reset: () => {
    set({
      phase: 'playing',
      laneIndex: initialLane,
      targetLaneIndex: initialLane,
      playerState: 'run',
      playerX: initialX,
      playerY: 0,
      playerZ: 0,
      velocityY: 0,
      isGrounded: true,
      groundLevel: 0,
      worldOffsetZ: 0,
      speed: BASE_SPEED,
      distance: 0,
      obstacles: [],
      coins: [],
      platforms: [],
      score: 0,
      coinsCollected: 0,
      highScore: get().highScore,
    })
  },
}))
