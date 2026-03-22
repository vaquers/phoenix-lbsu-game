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
import { Suspense } from 'react'
import { CAMERA_OFFSET, CAMERA_LOOK_AHEAD, CAMERA_FOV } from '../utils/constants'
import { DEFAULT_BACKGROUND_COLOR } from '../utils/loadAssets'
import { Color } from 'three'
import { Skybox } from './Skybox'
import { AssetProvider } from '../contexts/AssetContext'

function SceneContent() {
  useGameLoop()
  const phase = useGameStore((s) => s.phase)
  const isActive = phase === 'playing' || phase === 'paused' || phase === 'gameOver'

  return (
    <>
      <Skybox />
      <CameraFollow />
      {isActive && (
        <AssetProvider>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
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
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{
          position: [CAMERA_OFFSET[0], CAMERA_OFFSET[1], CAMERA_OFFSET[2]],
          fov: CAMERA_FOV,
        }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        shadows
        onCreated={({ camera, scene }) => {
          camera.lookAt(CAMERA_LOOK_AHEAD[0], CAMERA_LOOK_AHEAD[1], CAMERA_LOOK_AHEAD[2])
          scene.background = new Color(DEFAULT_BACKGROUND_COLOR)
        }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}
