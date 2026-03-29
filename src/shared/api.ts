import { BACKEND_URL } from './config'
import type {
  User,
  LeaderboardEntry,
  MerchItem,
  Purchase,
  DisplaySubmission,
  TeamPhoto,
  PixelBoardState,
  PixelUpdate,
} from './types'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  getUser(id: string) {
    return request<User>(`/api/users/${id}`)
  },

  createUser(name: string, avatarUrl?: string) {
    return request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify({ name, avatarUrl }),
    })
  },

  updateUserName(id: string, name: string) {
    return request<User>(`/api/users/${id}/name`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    })
  },

  updateUserAvatar(id: string, avatarUrl: string) {
    return request<User>(`/api/users/${id}/avatar`, {
      method: 'PUT',
      body: JSON.stringify({ avatarUrl }),
    })
  },

  recordGameResult(userId: string, score: number, coinsEarned: number) {
    return request<User>(`/api/users/${userId}/game-result`, {
      method: 'POST',
      body: JSON.stringify({ score, coinsEarned }),
    })
  },

  getLeaderboard() {
    return request<LeaderboardEntry[]>('/api/leaderboard')
  },

  getMerch() {
    return request<MerchItem[]>('/api/merch')
  },

  purchaseMerch(userId: string, itemId: string) {
    return request<Purchase>('/api/purchase/merch', {
      method: 'POST',
      body: JSON.stringify({ userId, itemId }),
    })
  },

  submitDisplayPhoto(userId: string, image: string, text: string, composition?: DisplaySubmission['composition']) {
    return request<DisplaySubmission>('/api/display-submissions', {
      method: 'POST',
      body: JSON.stringify({ userId, image, text, composition }),
    })
  },

  getDisplaySubmissions() {
    return request<DisplaySubmission[]>('/api/display-submissions')
  },

  clearDisplaySubmissions(adminKey?: string) {
    return request<{ ok: boolean }>('/api/display-submissions/clear', {
      method: 'POST',
      body: JSON.stringify({ adminKey }),
    })
  },

  deleteDisplaySubmission(id: string, adminKey?: string) {
    return request<{ ok: boolean }>(`/api/display-submissions/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ adminKey }),
    })
  },

  deleteDisplaySubmissionByIndex(index: number, adminKey?: string) {
    return request<{ ok: boolean }>('/api/display-submissions/delete-by-index', {
      method: 'POST',
      body: JSON.stringify({ index, adminKey }),
    })
  },

  getTeamPhotos() {
    return request<TeamPhoto[]>('/api/team-photos')
  },

  getBoardState() {
    return request<PixelBoardState>('/api/board')
  },

  setPixel(update: PixelUpdate) {
    return request<{ ok: boolean }>('/api/pixel', {
      method: 'POST',
      body: JSON.stringify(update),
    })
  },

  claimZone(userId: string, zoneId: number) {
    return request<{ ok: boolean; zoneId: number }>('/api/zone/claim', {
      method: 'POST',
      body: JSON.stringify({ userId, zoneId }),
    })
  },

  startGame() {
    return request<{ ok: boolean }>('/api/game/start', { method: 'POST' })
  },
}
