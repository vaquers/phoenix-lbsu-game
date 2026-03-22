import { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { Texture } from 'three'
import { loadTexture } from '../utils/loadAssets'

type TextureKey = keyof typeof import('../config/assets').ASSETS.textures

interface AssetContextValue {
  textures: Record<TextureKey, Texture | null>
  getMaterialProps: (key: TextureKey, fallbackColor: string) => { map?: Texture; color: string }
}

const AssetContext = createContext<AssetContextValue | null>(null)

export function useAssets() {
  const ctx = useContext(AssetContext)
  return ctx
}

const DEFAULT_MATERIAL_COLORS = {
  road: '#2d2d2d',
  wall: '#34495e',
  obstacle: '#c0392b',
  coin: '#ffd700',
} as const

export { DEFAULT_MATERIAL_COLORS }

export function AssetProvider({ children }: { children: React.ReactNode }) {
  const [textures, setTextures] = useState<Record<TextureKey, Texture | null>>({
    road: null,
    wall: null,
    obstacle: null,
    coin: null,
  })
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    const keys: TextureKey[] = ['road', 'wall', 'obstacle', 'coin']
    Promise.all(keys.map((k) => loadTexture(k))).then((results) => {
      setTextures({
        road: results[0],
        wall: results[1],
        obstacle: results[2],
        coin: results[3],
      })
    })
  }, [])

  const getMaterialProps = (key: TextureKey, fallbackColor: string) => {
    const tex = textures[key]
    if (tex) return { map: tex, color: '#ffffff' }
    return { color: fallbackColor }
  }

  return (
    <AssetContext.Provider value={{ textures, getMaterialProps }}>
      {children}
    </AssetContext.Provider>
  )
}
