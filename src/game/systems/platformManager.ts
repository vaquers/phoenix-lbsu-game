import type { PlatformEntity, CoinEntity, LaneIndex } from '../utils/types'
import {
  LANE_COUNT,
  PLATFORM_HEIGHTS,
  PLATFORM_LENGTH_MIN,
  PLATFORM_WIDTH,
  PLATFORM_SPAWN_Z_OFFSET,
  PLATFORM_MIN_GAP,
  PLATFORM_SPAWN_INTERVAL_MIN,
  PLATFORM_SPAWN_INTERVAL_MAX,
  PLATFORM_SPAWN_CHANCE,
  PLATFORM_COIN_CHANCE,
  COIN_GROUP_SPACING,
  COIN_Y,
} from '../utils/constants'

let nextId = 0
function genId() {
  return `plat_${++nextId}_${Date.now()}`
}

let nextCoinId = 1_000_000
function genCoinId() {
  return `pcoin_${++nextCoinId}_${Date.now()}`
}

export function resetPlatformIds() {
  nextId = 0
  nextCoinId = 1_000_000
}

export function getNextPlatformSpawnTime(): number {
  return (
    PLATFORM_SPAWN_INTERVAL_MIN +
    Math.random() * (PLATFORM_SPAWN_INTERVAL_MAX - PLATFORM_SPAWN_INTERVAL_MIN)
  )
}

type PatternType = 'single' | 'runway' | 'steps'

function pickPattern(): PatternType {
  const r = Math.random()
  if (r < 0.5) return 'single'
  if (r < 0.8) return 'runway'
  return 'steps'
}

function randomLane(): LaneIndex {
  return Math.floor(Math.random() * LANE_COUNT) as LaneIndex
}

function randomHeight(): number {
  return PLATFORM_HEIGHTS[Math.floor(Math.random() * PLATFORM_HEIGHTS.length)]
}

function addPlatformCoins(
  coins: CoinEntity[],
  lane: LaneIndex,
  startZ: number,
  maxLen: number,
  height: number,
  count: number,
) {
  const availableLen = maxLen - 2
  const actualCount = Math.min(count, Math.floor(availableLen / COIN_GROUP_SPACING) + 1)
  for (let c = 0; c < actualCount; c++) {
    coins.push({
      id: genCoinId(),
      lane,
      z: startZ + 1 + c * COIN_GROUP_SPACING,
      y: height + COIN_Y * 0.5,
      collected: false,
    })
  }
}

export function spawnPlatformPattern(
  worldZ: number,
  existingPlatforms: PlatformEntity[],
  existingObstaclesZ: number[],
): { platforms: PlatformEntity[]; coins: CoinEntity[] } {
  if (Math.random() > PLATFORM_SPAWN_CHANCE) return { platforms: [], coins: [] }

  const spawnZ = worldZ + PLATFORM_SPAWN_Z_OFFSET

  const lastPlatEnd = existingPlatforms.length
    ? Math.max(...existingPlatforms.map((p) => p.z + p.length))
    : 0
  if (spawnZ < lastPlatEnd + PLATFORM_MIN_GAP) return { platforms: [], coins: [] }

  const tooClose = existingObstaclesZ.some((oz) => Math.abs(oz - spawnZ) < 8)
  if (tooClose) return { platforms: [], coins: [] }

  const pattern = pickPattern()
  const platforms: PlatformEntity[] = []
  const coins: CoinEntity[] = []

  if (pattern === 'single') {
    const lane = randomLane()
    const height = randomHeight()
    const length = PLATFORM_LENGTH_MIN + Math.random() * 4
    platforms.push({ id: genId(), lane, z: spawnZ, length, height, width: PLATFORM_WIDTH })

    if (Math.random() < PLATFORM_COIN_CHANCE) {
      addPlatformCoins(coins, lane, spawnZ, length, height, 2 + Math.floor(Math.random() * 3))
    }
  } else if (pattern === 'runway') {
    const lane = randomLane()
    const height = randomHeight()
    const totalLength = 10 + Math.random() * 10
    platforms.push({ id: genId(), lane, z: spawnZ, length: totalLength, height, width: PLATFORM_WIDTH })

    if (Math.random() < PLATFORM_COIN_CHANCE) {
      addPlatformCoins(coins, lane, spawnZ, totalLength, height, 3 + Math.floor(Math.random() * 4))
    }
  } else {
    const lane = randomLane()
    const h1 = PLATFORM_HEIGHTS[0]
    const h2 = PLATFORM_HEIGHTS[Math.min(1, PLATFORM_HEIGHTS.length - 1)]
    const len1 = 5 + Math.random() * 3
    const len2 = 5 + Math.random() * 3
    const gap = 1.5

    platforms.push({ id: genId(), lane, z: spawnZ, length: len1, height: h1, width: PLATFORM_WIDTH })
    platforms.push({ id: genId(), lane, z: spawnZ + len1 + gap, length: len2, height: h2, width: PLATFORM_WIDTH })

    if (Math.random() < PLATFORM_COIN_CHANCE) {
      addPlatformCoins(coins, lane, spawnZ + len1 + gap, len2, h2, 3)
    }
  }

  return { platforms, coins }
}
