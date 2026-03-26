import { Canvas } from '@react-three/fiber'
import { Road } from './Road'
import { Player } from './Player'
import { Obstacles } from './Obstacles'
import { Coins } from './Coins'
import { Platforms } from './Platforms'
import { CityBackground } from './CityBackground'
import { CameraFollow } from './CameraFollow'
import { useGameLoop } from '../hooks/useGameLoop'
import { useGameStore } from '../store/gameStore'
import { Suspense, useEffect, useRef, useState } from 'react'
import { CAMERA_OFFSET, CAMERA_LOOK_AHEAD, CAMERA_FOV } from '../utils/constants'
import { DEFAULT_BACKGROUND_COLOR } from '../utils/loadAssets'
import { Color } from 'three'
import { Skybox } from './Skybox'
import { AssetProvider } from '../contexts/AssetContext'
import { GameErrorBoundary } from './GameErrorBoundary'

function SceneContent() {
  useGameLoop()
  const phase = useGameStore((s) => s.phase)
  const isActive = phase === 'playing' || phase === 'paused' || phase === 'gameOver'

  return (
    <>
      <Skybox />
      <fog attach="fog" args={['#8aa0b8', 18, 65]} />
      <CameraFollow />
      {isActive && (
        <AssetProvider>
          <ambientLight intensity={0.55} />
          <hemisphereLight color="#e8f2ff" groundColor="#495d6d" intensity={0.5} />
          <directionalLight position={[8, 14, 6]} intensity={1.25} castShadow shadow-mapSize={[1024, 1024]} />
          <Road />
          <CityBackground />
          <Player />
          <Obstacles />
          <Platforms />
          <Coins />
        </AssetProvider>
      )}
    </>
  )
}

export function GameScene() {
  const [contextLost, setContextLost] = useState(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => cleanupRef.current?.()
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full">
      <GameErrorBoundary
        fallback={
          <div className="absolute inset-0 flex items-center justify-center text-white bg-black/30">
            <div className="glass-panel-strong rounded-[22px] px-6 py-4 text-center">
              <p className="text-lg font-semibold">Ошибка рендера сцены</p>
              <p className="text-white/80 text-sm mt-1">Перезагрузите мини‑апп</p>
            </div>
          </div>
        }
      >
        <Canvas
          camera={{
            position: [CAMERA_OFFSET[0], CAMERA_OFFSET[1], CAMERA_OFFSET[2]],
            fov: CAMERA_FOV,
          }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
          shadows
          onCreated={({ camera, scene, gl }) => {
            camera.lookAt(CAMERA_LOOK_AHEAD[0], CAMERA_LOOK_AHEAD[1], CAMERA_LOOK_AHEAD[2])
            scene.background = new Color(DEFAULT_BACKGROUND_COLOR)
            const canvas = gl.domElement
            const onLost = (e: Event) => {
              e.preventDefault()
              setContextLost(true)
            }
            const onRestored = () => {
              setContextLost(false)
            }
            canvas.addEventListener('webglcontextlost', onLost, false)
            canvas.addEventListener('webglcontextrestored', onRestored, false)
            cleanupRef.current = () => {
              canvas.removeEventListener('webglcontextlost', onLost)
              canvas.removeEventListener('webglcontextrestored', onRestored)
            }
          }}
        >
          <Suspense fallback={null}>
            <SceneContent />
          </Suspense>
        </Canvas>
        {contextLost && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
            <div className="glass-panel-strong rounded-[22px] px-6 py-4 text-center">
              <p className="text-lg font-semibold">WebGL отключён</p>
              <p className="text-white/80 text-sm mt-1">Попробуйте перезагрузить</p>
            </div>
          </div>
        )}
      </GameErrorBoundary>
    </div>
  )
}
