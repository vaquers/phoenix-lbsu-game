import * as THREE from 'three'
import { ASSETS } from '../config/assets'

const cubeLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()

let skyboxCache: THREE.CubeTexture | null = null
const textureCache: Record<string, THREE.Texture | null> = {}

/**
 * Загружает skybox (6 граней). При ошибке возвращает null — использовать цвет фона.
 */
export function loadSkybox(): Promise<THREE.CubeTexture | null> {
  if (skyboxCache) return Promise.resolve(skyboxCache)
  const urls = [
    ASSETS.skybox.right,
    ASSETS.skybox.left,
    ASSETS.skybox.top,
    ASSETS.skybox.bottom,
    ASSETS.skybox.front,
    ASSETS.skybox.back,
  ]
  return new Promise((resolve) => {
    cubeLoader.load(
      urls,
      (tex) => {
        skyboxCache = tex
        resolve(tex)
      },
      undefined,
      () => resolve(null)
    )
  })
}

/**
 * Загружает одну текстуру. При ошибке возвращает null — использовать цвет материала.
 */
export function loadTexture(key: keyof typeof ASSETS.textures): Promise<THREE.Texture | null> {
  if (textureCache[key]) return Promise.resolve(textureCache[key])
  const url = ASSETS.textures[key]
  return new Promise((resolve) => {
    textureLoader.load(
      url,
      (tex) => {
        textureCache[key] = tex
        resolve(tex)
      },
      undefined,
      () => {
        textureCache[key] = null
        resolve(null)
      }
    )
  })
}

/** Цвет фона по умолчанию, если skybox не загружен */
export const DEFAULT_BACKGROUND_COLOR = 0x87ceeb

/** Цвета по умолчанию для материалов при отсутствии текстур */
export const DEFAULT_MATERIAL_COLORS = {
  road: '#2d2d2d',
  wall: '#34495e',
  obstacle: '#c0392b',
  coin: '#ffd700',
} as const
