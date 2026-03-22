import type { ObstacleEntity, CoinEntity, PlatformEntity } from '../utils/types'
import type { LaneIndex } from '../utils/types'
import {
  LANE_OFFSETS,
  OBSTACLE_BASE_Y,
  PLAYER_WIDTH,
  PLAYER_DEPTH,
  PLAYER_HEIGHT_RUN,
  PLAYER_HEIGHT_JUMP,
  PLAYER_HEIGHT_SLIDE,
} from '../utils/constants'

const HALF_W = PLAYER_WIDTH / 2
const HALF_D = PLAYER_DEPTH / 2
const LANDING_TOLERANCE = 0.3

// ── Player bounding box ─────────────────────────────────────────────────

export interface PlayerBox {
  x: number
  z: number
  width: number
  depth: number
  height: number
  yBottom: number
  yTop: number
}

export function getPlayerBox(
  laneIndex: LaneIndex,
  playerY: number,
  state: 'run' | 'jump' | 'slide',
): PlayerBox {
  const x = LANE_OFFSETS[laneIndex]
  const height =
    state === 'slide' ? PLAYER_HEIGHT_SLIDE : state === 'jump' ? PLAYER_HEIGHT_JUMP : PLAYER_HEIGHT_RUN
  return {
    x,
    z: 0,
    width: PLAYER_WIDTH,
    depth: PLAYER_DEPTH,
    height,
    yBottom: playerY,
    yTop: playerY + height,
  }
}

// ── Obstacle collision ──────────────────────────────────────────────────

function getObstacleBox(o: ObstacleEntity) {
  return {
    x: LANE_OFFSETS[o.lane],
    z: o.z,
    w: o.width ?? 1,
    d: o.depth ?? 1,
    yBottom: OBSTACLE_BASE_Y,
    yTop: OBSTACLE_BASE_Y + (o.height ?? 1.2),
  }
}

export function checkObstacleCollision(player: PlayerBox, obstacle: ObstacleEntity): boolean {
  const ob = getObstacleBox(obstacle)
  if (player.x + HALF_W < ob.x - ob.w / 2 || player.x - HALF_W > ob.x + ob.w / 2) return false
  if (player.z + HALF_D < ob.z - ob.d / 2 || player.z - HALF_D > ob.z + ob.d / 2) return false
  if (player.yTop < ob.yBottom || player.yBottom > ob.yTop) return false
  return true
}

// ── Coin collision ──────────────────────────────────────────────────────

export function checkCoinCollision(
  player: PlayerBox,
  coin: CoinEntity,
  coinY: number,
  coinRadius = 0.5,
): boolean {
  if (coin.collected) return false
  if (player.yTop < coinY - coinRadius || player.yBottom > coinY + coinRadius) return false
  const cx = LANE_OFFSETS[coin.lane]
  const dx = Math.abs(player.x - cx)
  const dz = Math.abs(player.z - coin.z)
  if (dx > HALF_W + coinRadius || dz > HALF_D + coinRadius) return false
  return true
}

// ── Platform: landing detection ─────────────────────────────────────────

export function findLandingHeight(
  platforms: PlatformEntity[],
  playerX: number,
  prevY: number,
  newY: number,
  worldZ: number,
): number {
  let bestHeight = 0
  for (const p of platforms) {
    const sceneZ = p.z - worldZ
    const sceneZEnd = sceneZ + p.length
    const px = LANE_OFFSETS[p.lane]
    if (Math.abs(playerX - px) > (p.width + PLAYER_WIDTH) / 2) continue
    if (HALF_D < sceneZ || -HALF_D > sceneZEnd) continue
    if (prevY >= p.height - LANDING_TOLERANCE && newY <= p.height) {
      bestHeight = Math.max(bestHeight, p.height)
    }
  }
  return bestHeight
}

// ── Platform: standing check ────────────────────────────────────────────

export function isOnPlatform(
  platforms: PlatformEntity[],
  playerX: number,
  groundLevel: number,
  worldZ: number,
): boolean {
  if (groundLevel <= 0) return false
  for (const p of platforms) {
    if (Math.abs(p.height - groundLevel) > 0.1) continue
    const sceneZ = p.z - worldZ
    const sceneZEnd = sceneZ + p.length
    const px = LANE_OFFSETS[p.lane]
    if (Math.abs(playerX - px) > (p.width + PLAYER_WIDTH) / 2) continue
    if (HALF_D >= sceneZ && -HALF_D <= sceneZEnd) return true
  }
  return false
}

// ── Platform: front-face / side collision ────────────────────────────────

export function checkPlatformFrontCollision(
  player: PlayerBox,
  platform: PlatformEntity,
  sceneZ: number,
): boolean {
  if (player.yBottom >= platform.height - LANDING_TOLERANCE) return false
  const px = LANE_OFFSETS[platform.lane]
  if (player.x + HALF_W < px - platform.width / 2 || player.x - HALF_W > px + platform.width / 2) return false
  const pzEnd = sceneZ + platform.length
  if (player.z + HALF_D < sceneZ || player.z - HALF_D > pzEnd) return false
  return true
}
