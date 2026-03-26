import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useGameStore } from '../store/gameStore'
import { SLIDE_HEIGHT, PLAYER_ROTATION_Y } from '../utils/constants'
import { ASSETS } from '../config/assets'
import { useGLTF } from '@react-three/drei'

function PlayerFallback() {
  return (
    <group rotation={[0, PLAYER_ROTATION_Y, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.2]} />
        <meshStandardMaterial color="#4a90d9" />
      </mesh>
      <mesh position={[0, 1.0, 0.05]} castShadow>
        <sphereGeometry args={[0.2, 12, 8]} />
        <meshStandardMaterial color="#e8c4a0" />
      </mesh>
      <mesh position={[-0.15, 0.2, 0.15]} castShadow>
        <boxGeometry args={[0.12, 0.35, 0.12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.15, 0.2, 0.15]} castShadow>
        <boxGeometry args={[0.12, 0.35, 0.12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  )
}

function PlayerModel() {
  const gltf = useGLTF(ASSETS.models.player)
  return (
    <primitive
      object={gltf.scene}
      scale={0.9}
      position={[0, -0.2, 0]}
      rotation={[0, PLAYER_ROTATION_Y, 0]}
      castShadow
    />
  )
}

export function Player() {
  const meshRef = useRef<Group>(null)
  const runPhase = useRef(0)
  const [hasModel, setHasModel] = useState(false)

  useEffect(() => {
    let mounted = true
    fetch(ASSETS.models.player, { method: 'HEAD' })
      .then((res) => {
        if (mounted && res.ok) setHasModel(true)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  useFrame((_, delta) => {
    const { playerX, playerY, playerState } = useGameStore.getState()
    if (!meshRef.current) return

    meshRef.current.position.x = playerX
    meshRef.current.position.z = 0

    if (playerState === 'slide') {
      meshRef.current.scale.y = 0.5
      meshRef.current.position.y = playerY + SLIDE_HEIGHT * 0.5
    } else {
      meshRef.current.scale.y = 1
      if (playerState === 'run') {
        runPhase.current += delta * 12
        const bounce = Math.abs(Math.sin(runPhase.current)) * 0.08
        meshRef.current.position.y = playerY + bounce
      } else {
        meshRef.current.position.y = playerY
      }
    }
  })

  return (
    <group ref={meshRef}>
      {hasModel ? <PlayerModel /> : <PlayerFallback />}
    </group>
  )
}
