export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000'

export interface ScreenConfig {
  id: string
  duration: number
}

export const SCREEN_ROTATION: ScreenConfig[] = [
  { id: 'team-photos', duration: 60 },
  { id: 'leaderboard', duration: 60 },
  { id: 'user-photos', duration: 60 },
  { id: 'pixel-board', duration: 60 },
]

export const TRANSITION_DURATION = 800
