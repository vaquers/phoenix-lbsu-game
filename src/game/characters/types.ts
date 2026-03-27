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
  gameModelPath: string
  shopModelPath: string
  gameScale: number
  gameRotationY: number
  gameGroundOffset: number
  shopScale: number
  shopRotationY: number
  shopGroundOffset: number
  gameAnimations?: CharacterAnimations
  shopAnimations?: CharacterAnimations
  isUnlockedByDefault?: boolean
  thumbnail?: string
}
