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
  composition?: {
    photos: Array<{
      id: string
      imageUri: string
      croppedImageUri?: string
      crop: { x: number; y: number; width: number; height: number }
      displayMode: 'square'
    }>
    textOverlay: {
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
  }
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
