export interface User {
  id: string
  name: string
  avatarUrl?: string
  coins: number
  bestScore: number
  totalGamesPlayed: number
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  avatarUrl?: string
  score: number
  rank: number
}

export interface MerchItem {
  id: string
  title: string
  description: string
  image: string
  price: number
  available: boolean
}

export interface Purchase {
  id: string
  userId: string
  itemId: string
  type: 'merch' | 'display'
  cost: number
  createdAt: string
}

export interface DisplaySubmission {
  id: string
  userId: string
  userName: string
  image: string
  text: string
  cost: number
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
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
