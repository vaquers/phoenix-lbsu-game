import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useGameStore } from '../store/gameStore'
import { SLIDE_HEIGHT } from '../utils/constants'
import { PlayerModel } from './PlayerModel'

export function Player() {
  const rootRef = useRef<Group>(null)
  const runPhase = useRef(0)

  useFrame((_, delta) => {
    const { playerX, playerY, playerState } = useGameStore.getState()
    if (!rootRef.current) return

    rootRef.current.position.x = playerX
    rootRef.current.position.z = 0

    if (playerState === 'slide') {
      rootRef.current.scale.y = 0.5
      rootRef.current.position.y = playerY + SLIDE_HEIGHT * 0.5
    } else {
      rootRef.current.scale.y = 1
      if (playerState === 'run') {
        runPhase.current += delta * 12
        const bounce = Math.abs(Math.sin(runPhase.current)) * 0.08
        rootRef.current.position.y = playerY + bounce
      } else {
        rootRef.current.position.y = playerY
      }
    }
  })

  return (
    <group ref={rootRef}>
      <PlayerModel />
    </group>
  )
}
