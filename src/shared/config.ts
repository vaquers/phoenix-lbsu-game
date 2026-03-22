export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000'

export const DISPLAY_SUBMISSION_COST = 50

export const COINS_PER_GAME_BASE = 5
export const COINS_PER_SCORE_DIVISOR = 10

export const BOARD_WIDTH = 256
export const BOARD_HEIGHT = 256

export const COLOR_PALETTE: string[] = [
  '#000000',
  '#ffffff',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
  '#ffa500',
  '#800080',
  '#8B4513',
  '#FFB6C1',
  '#808080',
  '#00FF7F',
  '#4169E1',
  '#FF6347',
]

export const USER_ID_KEY = 'phoenix-user-id'
export const USER_NAME_KEY = 'phoenix-user-name'
