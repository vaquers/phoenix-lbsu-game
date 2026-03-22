import type { ObstacleEntity } from '../utils/types'
import type { LaneIndex } from '../utils/types'
import {
  OBSTACLE_SPAWN_INTERVAL_MIN,
  OBSTACLE_SPAWN_INTERVAL_MAX,
  OBSTACLE_SPAWN_DISTANCE,
  OBSTACLE_SPAWN_Z_OFFSET,
  OBSTACLE_TYPES,
  LANE_COUNT,
} from '../utils/constants'

let nextId = 0
function genId() {
  return `obs_${++nextId}_${Date.now()}`
}

export function resetObstacleIds() {
  nextId = 0
}

export function getNextObstacleSpawnTime(_speed: number): number {
  const range = OBSTACLE_SPAWN_INTERVAL_MAX - OBSTACLE_SPAWN_INTERVAL_MIN
  return OBSTACLE_SPAWN_INTERVAL_MIN + Math.random() * range
}

export function spawnObstacle(
  worldZ: number,
  existingObstacles: ObstacleEntity[]
): ObstacleEntity | null {
  const spawnZ = worldZ + OBSTACLE_SPAWN_Z_OFFSET
  const minZ = existingObstacles.length
    ? Math.max(...existingObstacles.map((o) => o.z)) + OBSTACLE_SPAWN_DISTANCE
    : spawnZ
  if (spawnZ < minZ) return null

  const lane = Math.floor(Math.random() * LANE_COUNT) as LaneIndex
  const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)]

  let width = 1
  let depth = 1
  let height = 1.2
  if (type === 'barrier') {
    width = 1.2
    depth = 0.8
    height = 1.0
  } else if (type === 'cone') {
    width = 0.8
    depth = 0.8
    height = 1.0
  } else if (type === 'train') {
    width = 1.5
    depth = 1.2
    height = 1.4
  }

  return {
    id: genId(),
    type,
    lane,
    z: spawnZ,
    width,
    depth,
    height,
  }
}
