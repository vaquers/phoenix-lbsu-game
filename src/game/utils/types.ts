export type LaneIndex = 0 | 1 | 2

export type PlayerState = 'run' | 'jump' | 'slide' | 'hit' | 'gameOver'

export type ObstacleType =
  | 'barrier'
  | 'cone'
  | 'train'
  | 'bus'
  | 'wall'
  | 'gate'
  | 'dumpster'
  | 'crate'

export interface ObstacleEntity {
  id: string
  type: ObstacleType
  lane: LaneIndex
  z: number
  y?: number
  width?: number
  depth?: number
  height?: number
}

export interface CoinEntity {
  id: string
  lane: LaneIndex
  z: number
  y?: number
  collected: boolean
}

export interface PlatformEntity {
  id: string
  lane: LaneIndex
  z: number
  length: number
  height: number
  width: number
  kind?: 'roof' | 'train' | 'bus' | 'container'
}

export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameOver'
