export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? 'https://phoenix-server-production.up.railway.app'

export interface ScreenConfig {
  id: string
  duration: number
}

export const SCREEN_ROTATION: ScreenConfig[] = [
  { id: 'user-photos', duration: 60 },
  { id: 'pixel-board', duration: 60 },
]

export const TRANSITION_DURATION = 800
