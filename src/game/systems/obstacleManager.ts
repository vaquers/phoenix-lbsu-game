import type { ObstacleEntity } from '../utils/types'
import type { LaneIndex } from '../utils/types'
import {
  OBSTACLE_SPAWN_INTERVAL_MIN,
  OBSTACLE_SPAWN_INTERVAL_MAX,
  OBSTACLE_SPAWN_DISTANCE,
  OBSTACLE_SPAWN_Z_OFFSET,
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

function buildObstacle(lane: LaneIndex, z: number): ObstacleEntity {
  const roll = Math.random()
  const type =
    roll < 0.2 ? 'cone'
      : roll < 0.35 ? 'barrier'
      : roll < 0.48 ? 'crate'
      : roll < 0.6 ? 'dumpster'
      : roll < 0.72 ? 'gate'
      : roll < 0.86 ? 'bus'
      : roll < 0.94 ? 'train'
      : 'wall'

  let width = 1
  let depth = 1
  let height = 1.2
  let y = 0
  if (type === 'barrier') {
    width = 1.4
    depth = 0.9
    height = 1.0
  } else if (type === 'cone') {
    width = 0.7
    depth = 0.7
    height = 0.9
  } else if (type === 'train') {
    width = 1.9
    depth = 2.2
    height = 1.6
  } else if (type === 'bus') {
    width = 1.8
    depth = 1.9
    height = 1.35
  } else if (type === 'wall') {
    width = 1.7
    depth = 0.7
    height = 1.6
  } else if (type === 'dumpster') {
    width = 1.4
    depth = 1.2
    height = 1.1
  } else if (type === 'crate') {
    width = 1.0
    depth = 1.0
    height = 0.9
  } else if (type === 'gate') {
    width = 1.7
    depth = 0.8
    height = 0.6
    y = 0.85
  }

  return {
    id: genId(),
    type,
    lane,
    z,
    y,
    width,
    depth,
    height,
  }
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
  return buildObstacle(lane, spawnZ)
}

export function spawnObstacleAt(
  lane: LaneIndex,
  z: number,
): ObstacleEntity {
  return buildObstacle(lane, z)
}
