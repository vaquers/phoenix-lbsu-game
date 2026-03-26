import { useGameStore } from '../store/gameStore'
import { LANE_OFFSETS } from '../utils/constants'

const PLATFORM_STYLES = {
  roof: { body: '#6b7c8d', top: '#9fb2c2', front: '#4c5f70' },
  train: { body: '#2e3f52', top: '#4e6a82', front: '#223142' },
  bus: { body: '#c97b4a', top: '#e4a776', front: '#9b5e35' },
  container: { body: '#6b3f7a', top: '#8e59a3', front: '#4e2b5a' },
}

export function Platforms() {
  const platforms = useGameStore((s) => s.platforms)
  const worldZ = useGameStore((s) => s.worldOffsetZ)

  return (
    <>
      {platforms.map((p) => {
        const sceneZ = p.z - worldZ
        const x = LANE_OFFSETS[p.lane]
        const style = PLATFORM_STYLES[p.kind ?? 'roof']
        return (
          <group key={p.id} position={[x, p.height / 2, sceneZ + p.length / 2]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[p.width, p.height, p.length]} />
              <meshStandardMaterial color={style.body} />
            </mesh>
            <mesh position={[0, p.height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[p.width - 0.05, p.length - 0.05]} />
              <meshStandardMaterial color={style.top} />
            </mesh>
            <mesh position={[0, 0, -p.length / 2 + 0.01]}>
              <planeGeometry args={[p.width - 0.05, p.height - 0.05]} />
              <meshStandardMaterial color={style.front} />
            </mesh>
            {p.kind === 'train' && (
              <mesh position={[0, p.height / 2 + 0.2, 0]} castShadow>
                <boxGeometry args={[p.width * 0.6, 0.25, p.length * 0.7]} />
                <meshStandardMaterial color="#1b2633" />
              </mesh>
            )}
          </group>
        )
      })}
    </>
  )
}
