import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useGameStore } from '../store/gameStore'
import {
  LANE_WIDTH,
  LANE_COUNT,
  BUILDING_DEPTH,
  BUILDING_SEGMENT_LENGTH,
  BUILDING_SEGMENTS_COUNT,
  BUILDING_SEGMENTS_BEHIND,
} from '../utils/constants'
import { useAssets, DEFAULT_MATERIAL_COLORS } from '../contexts/AssetContext'

const TOTAL_WIDTH = LANE_WIDTH * (LANE_COUNT + 2)
const SEG_LEN = BUILDING_SEGMENT_LENGTH
const SEG_COUNT = BUILDING_SEGMENTS_COUNT
const RING_LEN = SEG_COUNT * SEG_LEN
const BEHIND = BUILDING_SEGMENTS_BEHIND * SEG_LEN

export function CityBackground() {
  const segRefs = useRef<(Group | null)[]>([])
  const assets = useAssets()
  const wallProps = assets?.getMaterialProps('wall', DEFAULT_MATERIAL_COLORS.wall) ?? {
    color: DEFAULT_MATERIAL_COLORS.wall,
  }

  const setRef = useCallback(
    (idx: number) => (el: Group | null) => {
      segRefs.current[idx] = el
    },
    [],
  )

  useFrame(() => {
    const worldZ = useGameStore.getState().worldOffsetZ
    for (let i = 0; i < SEG_COUNT; i++) {
      const ref = segRefs.current[i]
      if (!ref) continue
      const raw = ((i * SEG_LEN - worldZ) % RING_LEN + RING_LEN) % RING_LEN
      ref.position.z = raw - BEHIND
    }
  })

  return (
    <group>
      {Array.from({ length: SEG_COUNT }).map((_, i) => (
        <group key={i} ref={setRef(i)}>
          {[0, 1, 2].map((j) => (
            <mesh
              key={`l-${j}`}
              position={[-TOTAL_WIDTH / 2 - 2 - j * 3, 2 + j * 1.5, -BUILDING_DEPTH / 2]}
              castShadow
            >
              <boxGeometry args={[2, 4 + j * 2, BUILDING_DEPTH]} />
              <meshStandardMaterial {...wallProps} />
            </mesh>
          ))}
          {[0, 1, 2].map((j) => (
            <mesh
              key={`r-${j}`}
              position={[TOTAL_WIDTH / 2 + 2 + j * 3, 2 + j * 1.5, -BUILDING_DEPTH / 2]}
              castShadow
            >
              <boxGeometry args={[2, 4 + j * 2, BUILDING_DEPTH]} />
              <meshStandardMaterial {...wallProps} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
