import type { CoinEntity } from '../utils/types'
import type { LaneIndex } from '../utils/types'
import {
  COIN_SPAWN_INTERVAL_MIN,
  COIN_SPAWN_INTERVAL_MAX,
  COIN_SPAWN_Z_OFFSET,
  COIN_GROUP_SIZE_MIN,
  COIN_GROUP_SIZE_MAX,
  COIN_GROUP_SPACING,
  LANE_COUNT,
} from '../utils/constants'

let nextId = 0
function genId() {
  return `coin_${++nextId}_${Date.now()}`
}

export function resetCoinIds() {
  nextId = 0
}

export function getNextCoinSpawnTime(): number {
  const range = COIN_SPAWN_INTERVAL_MAX - COIN_SPAWN_INTERVAL_MIN
  return COIN_SPAWN_INTERVAL_MIN + Math.random() * range
}

export function spawnCoins(
  worldZ: number,
  existingCoins: CoinEntity[],
  existingObstaclesZ: number[]
): CoinEntity[] {
  const spawnZ = worldZ + COIN_SPAWN_Z_OFFSET
  const lastCoinZ = existingCoins.length ? Math.max(...existingCoins.map((c) => c.z)) : 0
  const minGap = 8
  if (spawnZ < lastCoinZ + minGap) return []

  const tooCloseToObstacle = existingObstaclesZ.some((oz) => Math.abs(oz - spawnZ) < 6)
  if (tooCloseToObstacle) return []

  const count =
    COIN_GROUP_SIZE_MIN +
    Math.floor(Math.random() * (COIN_GROUP_SIZE_MAX - COIN_GROUP_SIZE_MIN + 1))
  const lane = Math.floor(Math.random() * LANE_COUNT) as LaneIndex
  const pattern = Math.random()
  const result: CoinEntity[] = []

  for (let i = 0; i < count; i++) {
    const offsetZ = spawnZ + i * COIN_GROUP_SPACING
    let coinLane = lane
    let y: number | undefined
    if (pattern < 0.35) {
      coinLane = lane
    } else if (pattern < 0.65) {
      const shift = i % 3
      coinLane = shift === 0 ? 0 : shift === 1 ? 1 : 2
    } else {
      coinLane = lane
      const phase = i / Math.max(1, count - 1)
      y = 1.2 + Math.sin(phase * Math.PI) * 0.8
    }
    result.push({
      id: genId(),
      lane: coinLane as LaneIndex,
      z: offsetZ,
      y,
      collected: false,
    })
  }
  return result
}
