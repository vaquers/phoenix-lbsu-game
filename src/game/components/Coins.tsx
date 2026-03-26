import { useGameStore } from '../store/gameStore'
import { LANE_OFFSETS, COIN_Y } from '../utils/constants'
import { useAssets, DEFAULT_MATERIAL_COLORS } from '../contexts/AssetContext'

export function Coins() {
  const coins = useGameStore((s) => s.coins)
  const worldZ = useGameStore((s) => s.worldOffsetZ)
  const assets = useAssets()
  const coinProps = assets?.getMaterialProps('coin', DEFAULT_MATERIAL_COLORS.coin) ?? {
    color: DEFAULT_MATERIAL_COLORS.coin,
  }

  return (
    <>
      {coins
        .filter((c) => !c.collected)
        .map((c) => {
          const sceneZ = c.z - worldZ
          return (
            <group key={c.id} position={[LANE_OFFSETS[c.lane], c.y ?? COIN_Y, sceneZ]}>
              <mesh rotation={[0, sceneZ * 0.2, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.08, 16]} />
                <meshStandardMaterial {...coinProps} metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          )
        })}
    </>
  )
}
