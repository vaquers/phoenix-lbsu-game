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
  composition?: TVComposition
  cost: number
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export type PhotoSlot = {
  id: string
  imageUri: string
  croppedImageUri?: string
  crop: {
    x: number
    y: number
    width: number
    height: number
  }
  displayMode: 'square'
}

export type TextOverlay = {
  text: string
  fontStyle?: 'normal' | 'italic'
  fontWeight?: number
  fontSize: number
  fontSizePercent?: number
  color: string
  xPercent: number
  yPercent: number
  align?: 'center' | 'left' | 'right'
  rotation?: number
  opacity?: number
}

export type TVComposition = {
  photos: PhotoSlot[]
  textOverlay: TextOverlay
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
  zoneOwners: Record<number, string | null>
  updatedAt: string
}

export type PixelUpdate = {
  x: number
  y: number
  color: string
  userId?: string
}
