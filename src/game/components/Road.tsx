import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useGameStore } from '../store/gameStore'
import {
  LANE_WIDTH,
  LANE_COUNT,
  ROAD_SEGMENT_LENGTH,
  ROAD_SEGMENTS_COUNT,
  ROAD_SEGMENTS_BEHIND,
  ROAD_Y,
} from '../utils/constants'
import { useAssets, DEFAULT_MATERIAL_COLORS } from '../contexts/AssetContext'

const TOTAL_WIDTH = LANE_WIDTH * (LANE_COUNT + 0.5)
const SEG_LEN = ROAD_SEGMENT_LENGTH
const SEG_COUNT = ROAD_SEGMENTS_COUNT
const RING_LEN = SEG_COUNT * SEG_LEN
const BEHIND = ROAD_SEGMENTS_BEHIND * SEG_LEN

export function Road() {
  const segRefs = useRef<(Group | null)[]>([])
  const assets = useAssets()
  const roadProps = assets?.getMaterialProps('road', DEFAULT_MATERIAL_COLORS.road) ?? {
    color: DEFAULT_MATERIAL_COLORS.road,
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
    <group position={[0, ROAD_Y, 0]}>
      {Array.from({ length: SEG_COUNT }).map((_, i) => (
        <group key={i} ref={setRef(i)}>
          <mesh receiveShadow>
            <boxGeometry args={[TOTAL_WIDTH, 0.3, SEG_LEN]} />
            <meshStandardMaterial {...roadProps} />
          </mesh>
          {[0, 1, 2].map((lane) => (
            <mesh
              key={lane}
              position={[(lane - 1) * LANE_WIDTH, 0.16, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[LANE_WIDTH * 0.9, SEG_LEN]} />
              <meshStandardMaterial {...roadProps} />
            </mesh>
          ))}
          {[0, 1].map((j) => (
            <mesh
              key={j}
              position={[0, 0.17, -SEG_LEN / 2 + j * SEG_LEN]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[TOTAL_WIDTH, 0.2]} />
              <meshStandardMaterial color="#444" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
