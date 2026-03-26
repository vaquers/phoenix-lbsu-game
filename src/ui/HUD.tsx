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
      <div className="glass-panel-strong rounded-[22px] px-4 py-3">
        <div className="text-white font-extrabold text-2xl leading-none">
          {Math.floor(score)}
        </div>
        <div className="flex items-center gap-1 text-white/95 text-sm mt-1">
          {coinsCollected}
          <img src={bitcoinSign} alt="btc" className="w-4 h-4" />
          <span className="text-white/70 ml-2">Рекорд {Math.floor(highScore)}</span>
        </div>
      </div>
      <div className="glass-panel rounded-[18px] px-4 py-2 flex flex-col items-end">
        <span className="text-white/95 text-sm">Скорость {Math.round(speed)}</span>
        <span className="text-white/80 text-xs flex items-center gap-1">
          Баланс {Math.floor(userCoins)}
          <img src={bitcoinSign} alt="btc" className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  )
}
