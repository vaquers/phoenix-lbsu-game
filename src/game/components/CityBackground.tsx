import { useRef, useCallback, useMemo } from 'react'
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
import { mulberry32 } from '../utils/random'

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

  const segments = useMemo(() => {
    return Array.from({ length: SEG_COUNT }).map((_, idx) => {
      const rng = mulberry32(idx * 97 + 13)
      const buildingCount = 3 + Math.floor(rng() * 3)
      const makeBuildings = (side: 'left' | 'right') =>
        Array.from({ length: buildingCount }).map((__, j) => {
          const height = 4 + rng() * 8
          const width = 2 + rng() * 2.2
          const depth = BUILDING_DEPTH * (0.7 + rng() * 0.4)
          const y = height / 2
          const xBase = TOTAL_WIDTH / 2 + 2 + j * (3.2 + rng() * 1.4)
          const x = side === 'left' ? -xBase : xBase
          const z = -BUILDING_DEPTH / 2 + rng() * 2
          const tint = 0.9 + rng() * 0.2
          return { height, width, depth, x, y, z, tint }
        })
      const propsCount = 2 + Math.floor(rng() * 2)
      const props = Array.from({ length: propsCount }).map((__, p) => {
        const side = rng() > 0.5 ? 1 : -1
        const x = side * (TOTAL_WIDTH / 2 + 0.8 + rng() * 1.5)
        const z = -SEG_LEN / 2 + rng() * SEG_LEN
        const height = 2.2 + rng() * 1.5
        return { x, z, height }
      })
      return { left: makeBuildings('left'), right: makeBuildings('right'), props }
    })
  }, [])

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
      {segments.map((seg, i) => (
        <group key={i} ref={setRef(i)}>
          {seg.left.map((b, idx) => (
            <mesh
              key={`l-${i}-${idx}`}
              position={[b.x, b.y, b.z]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[b.width, b.height, b.depth]} />
              <meshStandardMaterial {...wallProps} color={`hsl(210, 12%, ${22 * b.tint}%)`} />
            </mesh>
          ))}
          {seg.right.map((b, idx) => (
            <mesh
              key={`r-${i}-${idx}`}
              position={[b.x, b.y, b.z]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[b.width, b.height, b.depth]} />
              <meshStandardMaterial {...wallProps} color={`hsl(210, 10%, ${24 * b.tint}%)`} />
            </mesh>
          ))}
          {seg.props.map((p, idx) => (
            <group key={`p-${i}-${idx}`} position={[p.x, 0, p.z]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.07, 0.09, p.height, 8]} />
                <meshStandardMaterial color="#2c3e50" />
              </mesh>
              <mesh position={[0, p.height / 2, 0.2]} castShadow>
                <boxGeometry args={[0.35, 0.18, 0.2]} />
                <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.5} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}
