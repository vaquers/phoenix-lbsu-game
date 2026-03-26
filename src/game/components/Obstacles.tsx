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
    <group position={[x, 0.8, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.7, 1.0, 2.0]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0, 0.5, 0.2]} castShadow>
        <boxGeometry args={[1.2, 0.5, 1.2]} />
        <meshStandardMaterial color="#3b5569" />
      </mesh>
      <mesh position={[0.6, -0.4, 0.8]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.2, 12]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.6, -0.4, 0.8]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.2, 12]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  )
}

function Bus({ x }: { x: number }) {
  return (
    <group position={[x, 0.7, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.6, 0.9, 1.6]} />
        <meshStandardMaterial color="#f39c12" />
      </mesh>
      <mesh position={[0, 0.2, 0.1]} castShadow>
        <boxGeometry args={[1.2, 0.4, 1.1]} />
        <meshStandardMaterial color="#f1c40f" />
      </mesh>
      <mesh position={[0.55, -0.35, 0.55]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.2, 12]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.55, -0.35, 0.55]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.2, 12]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  )
}

function Wall({ x }: { x: number }) {
  return (
    <group position={[x, 0.8, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.6, 1.6, 0.4]} />
        <meshStandardMaterial color="#9b3d3d" />
      </mesh>
    </group>
  )
}

function Dumpster({ x }: { x: number }) {
  return (
    <group position={[x, 0.55, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.9, 1.0]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>
      <mesh position={[0, 0.5, -0.35]} castShadow>
        <boxGeometry args={[1.25, 0.2, 0.3]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
    </group>
  )
}

function Crate({ x }: { x: number }) {
  return (
    <group position={[x, 0.45, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color="#b07a4b" />
      </mesh>
    </group>
  )
}

function Gate({ x }: { x: number }) {
  return (
    <group position={[x, 0.85, 0]}>
      <mesh position={[-0.75, -0.4, 0]} castShadow>
        <boxGeometry args={[0.1, 1.0, 0.1]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      <mesh position={[0.75, -0.4, 0]} castShadow>
        <boxGeometry args={[0.1, 1.0, 0.1]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[1.7, 0.2, 0.4]} />
        <meshStandardMaterial color="#e74c3c" />
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
          ob.type === 'barrier'
            ? Barrier
            : ob.type === 'cone'
              ? Cone
              : ob.type === 'train'
                ? Train
                : ob.type === 'bus'
                  ? Bus
                  : ob.type === 'wall'
                    ? Wall
                    : ob.type === 'dumpster'
                      ? Dumpster
                      : ob.type === 'crate'
                        ? Crate
                        : Gate
        return (
          <group key={ob.id} position={[0, 0, sceneZ]}>
            <ObstacleComponent x={LANE_OFFSETS[ob.lane]} />
          </group>
        )
      })}
    </>
  )
}
