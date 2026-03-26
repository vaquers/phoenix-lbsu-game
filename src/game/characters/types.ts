export type AssetSourceType = 'local_glb' | 'external_reference' | 'primitive'

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
  assetSourceType: AssetSourceType
  assetPath?: string
  externalSource?: {
    name: string
    url: string
    notes?: string
  }
  scale: number
  rotationY: number
  groundOffset: number
  animations?: CharacterAnimations
  requiresLocalAsset?: boolean
  thumbnail?: string
}
