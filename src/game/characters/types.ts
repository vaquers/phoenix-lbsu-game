export type CharacterAnimations = {
  run?: string[]
  jump?: string[]
  idle?: string[]
  slide?: string[]
}

export type CharacterSpec = {
  id: string
  name: string
  price: number
  isDefault?: boolean
  modelPath: string
  scale: number
  rotationY: number
  groundOffset: number
  animations?: CharacterAnimations
  isUnlockedByDefault?: boolean
  thumbnail?: string
}
