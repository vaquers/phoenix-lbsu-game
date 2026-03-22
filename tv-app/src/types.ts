export interface LeaderboardEntry {
  userId: string
  userName: string
  score: number
  rank: number
}

export interface DisplaySubmission {
  id: string
  userId: string
  userName: string
  image: string
  text: string
  cost: number
  createdAt: string
  status: string
}

export interface TeamPhoto {
  id: string
  image: string
  caption: string
  order: number
}

export interface PixelBoardState {
  width: number
  height: number
  pixels: string[]
  updatedAt: string
}

export type PixelUpdate = {
  x: number
  y: number
  color: string
}
