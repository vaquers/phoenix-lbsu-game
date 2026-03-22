import { useGameStore } from '../store/gameStore'
import { LANE_OFFSETS } from '../utils/constants'

const BODY_COLOR = '#5a7d9a'
const TOP_COLOR = '#7ab5d6'
const FRONT_COLOR = '#3d5a73'

export function Platforms() {
  const platforms = useGameStore((s) => s.platforms)
  const worldZ = useGameStore((s) => s.worldOffsetZ)

  return (
    <>
      {platforms.map((p) => {
        const sceneZ = p.z - worldZ
        const x = LANE_OFFSETS[p.lane]
        return (
          <group key={p.id} position={[x, p.height / 2, sceneZ + p.length / 2]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[p.width, p.height, p.length]} />
              <meshStandardMaterial color={BODY_COLOR} />
            </mesh>
            <mesh position={[0, p.height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[p.width - 0.05, p.length - 0.05]} />
              <meshStandardMaterial color={TOP_COLOR} />
            </mesh>
            <mesh position={[0, 0, -p.length / 2 + 0.01]}>
              <planeGeometry args={[p.width - 0.05, p.height - 0.05]} />
              <meshStandardMaterial color={FRONT_COLOR} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}
