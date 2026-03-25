import { useGameStore } from '../game/store/gameStore'
import { useUserStore } from '../shared/userStore'
import bitcoinSign from '../../assets/symbols/bitcoinsign.svg'

export function HUD() {
  const phase = useGameStore((s) => s.phase)
  const score = useGameStore((s) => s.score)
  const coinsCollected = useGameStore((s) => s.coinsCollected)
  const highScore = useGameStore((s) => s.highScore)
  const speed = useGameStore((s) => s.speed)
  const userCoins = useUserStore((s) => s.user?.coins ?? 0)

  if (phase !== 'playing' && phase !== 'paused') return null

  return (
    <div
      className="absolute top-0 left-0 right-0 flex justify-between items-start pointer-events-none z-10"
      style={{
        padding:
          'calc(var(--safe-top) + 16px) calc(var(--safe-right) + 16px) 16px calc(var(--safe-left) + 16px)',
      }}
    >
      <div className="flex flex-col gap-1">
        <span className="text-white font-bold text-2xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {Math.floor(score)}
        </span>
        <span className="text-white text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] flex items-center gap-1">
          {coinsCollected}
          <img src={bitcoinSign} alt="btc" className="w-4 h-4" />
        </span>
        <span className="text-white/90 text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          Рекорд: {Math.floor(highScore)}
        </span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-white/90 text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          Скорость: {Math.round(speed)}
        </span>
        <span className="text-white text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] flex items-center gap-1">
          Баланс: {Math.floor(userCoins)}
          <img src={bitcoinSign} alt="btc" className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  )
}
