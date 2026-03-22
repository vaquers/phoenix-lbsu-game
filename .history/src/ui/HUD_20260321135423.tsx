import { useGameStore } from '../game/store/gameStore'

export function HUD() {
  const phase = useGameStore((s) => s.phase)
  const score = useGameStore((s) => s.score)
  const coinsCollected = useGameStore((s) => s.coinsCollected)
  const highScore = useGameStore((s) => s.highScore)
  const speed = useGameStore((s) => s.speed)

  if (phase !== 'playing' && phase !== 'paused') return null

  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-10">
      <div className="flex flex-col gap-1">
        <span className="font-heading text-cream font-bold text-2xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {Math.floor(score)}
        </span>
        <span className="text-highlight text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          🪙 {coinsCollected}
        </span>
        <span className="text-cream/70 text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          Рекорд: {highScore}
        </span>
      </div>
      <div className="text-cream/70 text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        Скорость: {Math.round(speed)}
      </div>
    </div>
  )
}
