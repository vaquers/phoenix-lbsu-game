import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'
import {
  CAMERA_OFFSET,
  CAMERA_LOOK_AHEAD,
  CAMERA_LERP_X,
  CAMERA_LERP_Y,
  CAMERA_LERP_Z,
} from '../utils/constants'

export function CameraFollow() {
  const { camera } = useThree()
  const pos = useRef({ x: CAMERA_OFFSET[0], y: CAMERA_OFFSET[1], z: CAMERA_OFFSET[2] })
  const look = useRef({ x: CAMERA_LOOK_AHEAD[0], y: CAMERA_LOOK_AHEAD[1], z: CAMERA_LOOK_AHEAD[2] })

  useFrame(() => {
    const { playerX, playerY, speed } = useGameStore.getState()

    const tgtX = playerX * 0.5 + CAMERA_OFFSET[0]
    const tgtY = playerY + CAMERA_OFFSET[1]
    const tgtZ = CAMERA_OFFSET[2]

    pos.current.x += (tgtX - pos.current.x) * CAMERA_LERP_X
    pos.current.y += (tgtY - pos.current.y) * CAMERA_LERP_Y
    pos.current.z += (tgtZ - pos.current.z) * CAMERA_LERP_Z

    camera.position.set(pos.current.x, pos.current.y, pos.current.z)

    const lx = playerX * 0.3 + CAMERA_LOOK_AHEAD[0]
    const ly = playerY * 0.5 + CAMERA_LOOK_AHEAD[1]
    const lz = CAMERA_LOOK_AHEAD[2]

    look.current.x += (lx - look.current.x) * CAMERA_LERP_X
    look.current.y += (ly - look.current.y) * CAMERA_LERP_Y * 0.5
    look.current.z += (lz - look.current.z) * CAMERA_LERP_Z

    camera.lookAt(look.current.x, look.current.y, look.current.z)

    const pitch = Math.max(-0.08, Math.min(0.05, (speed - 10) * 0.002))
    camera.rotation.x += (pitch - camera.rotation.x) * 0.05
    camera.rotation.z = 0
  })

  return null
}
