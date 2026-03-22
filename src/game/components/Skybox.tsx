import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { loadSkybox, DEFAULT_BACKGROUND_COLOR } from '../utils/loadAssets'
import { Color } from 'three'

/**
 * Загружает skybox и устанавливает scene.background.
 * Если файлы не найдены — фон остаётся цветом по умолчанию.
 */
export function Skybox() {
  const { scene } = useThree()

  useEffect(() => {
    loadSkybox().then((cube) => {
      if (cube) {
        scene.background = cube
      } else {
        scene.background = new Color(DEFAULT_BACKGROUND_COLOR)
      }
    })
  }, [scene])

  return null
}
