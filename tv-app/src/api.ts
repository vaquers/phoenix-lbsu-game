import { BACKEND_URL } from './config'
import type {
  LeaderboardEntry,
  DisplaySubmission,
  TeamPhoto,
  PixelBoardState,
} from './types'

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export const tvApi = {
  getLeaderboard: () => request<LeaderboardEntry[]>('/api/leaderboard'),
  getDisplaySubmissions: () => request<DisplaySubmission[]>('/api/display-submissions'),
  getTeamPhotos: () => request<TeamPhoto[]>('/api/team-photos'),
  getBoardState: () => request<PixelBoardState>('/api/board'),
}
