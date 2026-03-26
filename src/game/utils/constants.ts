/**
 * Игровые константы. Здесь можно менять баланс игры.
 */

// Направление движения: мир движется к камере (-Z), персонаж визуально бежит вперёд
export const FORWARD_DIRECTION = -1
export const PLAYER_ROTATION_Y = Math.PI

// ── Камера ──────────────────────────────────────────────────────────────
export const CAMERA_OFFSET = [0, 5.4, -10.5] as const
export const CAMERA_LOOK_AHEAD = [0, 1.6, 10] as const
export const CAMERA_LERP_X = 0.07
export const CAMERA_LERP_Y = 0.045
export const CAMERA_LERP_Z = 0.06
export const CAMERA_FOV = 58

// ── Дорожки ─────────────────────────────────────────────────────────────
export const LANE_COUNT = 3
export const LANE_WIDTH = 2.2
export const LANE_OFFSETS = [-LANE_WIDTH, 0, LANE_WIDTH] as const

// ── Скорость ────────────────────────────────────────────────────────────
export const BASE_SPEED = 10.5
export const MAX_SPEED = 30
export const SPEED_INCREASE_PER_SECOND = 1.05
export const SPEED_INCREASE_DISTANCE = 55

// ── Игрок – движение ────────────────────────────────────────────────────
export const PLAYER_LANE_TRANSITION_DURATION = 0.2
export const SLIDE_DURATION = 0.6
export const SLIDE_HEIGHT = 0.4

// ── Игрок – физика (гравитация) ─────────────────────────────────────────
export const JUMP_VELOCITY = 12
export const GRAVITY = 32
export const JUMP_HEIGHT = 2.0   // пиковая высота прыжка (справочно)
export const JUMP_DURATION = 0.55 // справочно, не используется в гравитационной модели

// ── Размеры для коллизий ────────────────────────────────────────────────
export const PLAYER_WIDTH = 0.6
export const PLAYER_DEPTH = 0.5
export const PLAYER_HEIGHT_RUN = 1.05
export const PLAYER_HEIGHT_JUMP = 1.05
export const PLAYER_HEIGHT_SLIDE = 0.55

// ── Спавн препятствий ───────────────────────────────────────────────────
export const OBSTACLE_SPAWN_INTERVAL_MIN = 0.9
export const OBSTACLE_SPAWN_INTERVAL_MAX = 2.2
export const OBSTACLE_SPAWN_DISTANCE = 28
export const OBSTACLE_SPAWN_Z_OFFSET = 85

// ── Спавн монет ─────────────────────────────────────────────────────────
export const COIN_SPAWN_INTERVAL_MIN = 0.5
export const COIN_SPAWN_INTERVAL_MAX = 1.5
export const COIN_GROUP_SIZE_MIN = 1
export const COIN_GROUP_SIZE_MAX = 7
export const COIN_GROUP_SPACING = 1.2
export const COIN_SPAWN_Z_OFFSET = 75

// ── Очки ────────────────────────────────────────────────────────────────
export const POINTS_PER_METER = 1
export const POINTS_PER_COIN = 10

// ── Мир – дорога (ring-buffer recycling) ────────────────────────────────
export const ROAD_SEGMENT_LENGTH = 24
export const ROAD_SEGMENTS_COUNT = 18
export const ROAD_SEGMENTS_BEHIND = 3

// ── Мир – здания (ring-buffer recycling) ────────────────────────────────
export const BUILDING_DEPTH = 18
export const BUILDING_SEGMENT_LENGTH = BUILDING_DEPTH * 2
export const BUILDING_SEGMENTS_COUNT = 18
export const BUILDING_SEGMENTS_BEHIND = 3

// ── Деспавн / высота ────────────────────────────────────────────────────
export const DESPAWN_Z = -25
export const ROAD_Y = 0
export const COIN_Y = 1.2
export const OBSTACLE_BASE_Y = 0

// ── Типы препятствий ────────────────────────────────────────────────────
export const OBSTACLE_TYPES = [
  'barrier',
  'cone',
  'train',
  'bus',
  'wall',
  'gate',
  'dumpster',
  'crate',
] as const

// ── Платформы ───────────────────────────────────────────────────────────
export const PLATFORM_HEIGHTS = [1.0, 1.4, 1.9] as const
export const PLATFORM_LENGTH_MIN = 5
export const PLATFORM_LENGTH_MAX = 16
export const PLATFORM_WIDTH = 1.8
export const PLATFORM_SPAWN_CHANCE = 0.42
export const PLATFORM_SPAWN_Z_OFFSET = 95
export const PLATFORM_SPAWN_INTERVAL_MIN = 1.8
export const PLATFORM_SPAWN_INTERVAL_MAX = 4.2
export const PLATFORM_MIN_GAP = 18
export const PLATFORM_COIN_CHANCE = 0.6

// ── localStorage ────────────────────────────────────────────────────────
export const HIGH_SCORE_KEY = 'lane-runner-high-score'
