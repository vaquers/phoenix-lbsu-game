import { useGameStore } from '../store/gameStore'
import { LANE_OFFSETS } from '../utils/constants'
import { useAssets, DEFAULT_MATERIAL_COLORS } from '../contexts/AssetContext'

function ObstacleMaterial() {
  const assets = useAssets()
  const props = assets?.getMaterialProps('obstacle', DEFAULT_MATERIAL_COLORS.obstacle) ?? { color: DEFAULT_MATERIAL_COLORS.obstacle }
  return <meshStandardMaterial {...props} />
}

function Barrier({ x }: { x: number }) {
  return (
    <group position={[x, 0.5, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1, 1, 0.3]} />
        <ObstacleMaterial />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 1.2, 0.1]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
    </group>
  )
}

function Cone({ x }: { x: number }) {
  return (
    <group position={[x, 0.5, 0]}>
      <mesh castShadow>
        <coneGeometry args={[0.4, 1, 8]} />
        <ObstacleMaterial />
      </mesh>
    </group>
  )
}

function Train({ x }: { x: number }) {
  return (
    <group position={[x, 0.7, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.6, 0.8]} />
        <ObstacleMaterial />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
    </group>
  )
}

export function Obstacles() {
  const obstacles = useGameStore((s) => s.obstacles)
  const worldZ = useGameStore((s) => s.worldOffsetZ)

  return (
    <>
      {obstacles.map((ob) => {
        const sceneZ = ob.z - worldZ
        const ObstacleComponent =
          ob.type === 'barrier' ? Barrier : ob.type === 'cone' ? Cone : Train
        return (
          <group key={ob.id} position={[0, 0, sceneZ]}>
            <ObstacleComponent x={LANE_OFFSETS[ob.lane]} />
          </group>
        )
      })}
    </>
  )
}
