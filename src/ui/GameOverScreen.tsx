import { useCallback, useEffect, useRef } from 'react'
import { useGameStore } from '../game/store/gameStore'
import { useUserStore } from '../shared/userStore'
import { playSound } from '../game/utils/sounds'
import { resetObstacleIds } from '../game/systems/obstacleManager'
import { resetCoinIds } from '../game/systems/coinManager'
import { resetPlatformIds } from '../game/systems/platformManager'
import { COINS_PER_GAME_BASE, COINS_PER_SCORE_DIVISOR } from '../shared/config'
import sadBird from '../../assets/sad_bird.png'
import bitcoinSign from '../../assets/symbols/bitcoinsign.svg'

export function GameOverScreen() {
  const phase = useGameStore((s) => s.phase)
  const score = useGameStore((s) => s.score)
  const highScore = useGameStore((s) => s.highScore)
  const reset = useGameStore((s) => s.reset)
  const recordGame = useUserStore((s) => s.recordGame)
  const recorded = useRef(false)

  const roundedScore = Math.floor(score)
  const roundedHigh = Math.floor(highScore)
  const coinsEarned = COINS_PER_GAME_BASE + Math.floor(roundedScore / COINS_PER_SCORE_DIVISOR)
  const isNewRecord = roundedScore >= roundedHigh && roundedScore > 0

  useEffect(() => {
    if (phase === 'gameOver' && !recorded.current) {
      recorded.current = true
      recordGame(roundedScore, coinsEarned)
    }
    if (phase !== 'gameOver') {
      recorded.current = false
    }
  }, [phase, roundedScore, coinsEarned, recordGame])

  const onRestart = useCallback(() => {
    playSound('menu')
    resetObstacleIds()
    resetCoinIds()
    resetPlatformIds()
    reset()
  }, [reset])

  if (phase !== 'gameOver') return null

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col"
      style={{
        padding: 'var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left)',
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-start pt-4 px-6">
        <h2 className="text-[40px] font-extrabold text-[#EC432D] tracking-tight">Игра окончена</h2>
        <img src={sadBird} alt="sad bird" className="w-[260px] mt-6 drop-shadow-[0_16px_30px_rgba(0,0,0,0.2)]" />
      </div>

      <div className="px-6 pb-[calc(var(--tabbar-height)+18px)]">
        <div className="glass-panel-strong rounded-[var(--radius-card)] p-4">
          <div className="glass-panel rounded-[22px] px-5 py-4 space-y-4 text-[color:var(--text-dark)]">
            <div className="flex items-center justify-between text-[18px] font-semibold">
              <span>Счёт</span>
              <span>{roundedScore}</span>
            </div>
            <div className="h-px bg-white/30" />
            <div className="flex items-center justify-between text-[18px] font-semibold">
              <span>Рекорд</span>
              <span>{roundedHigh}</span>
            </div>
            <div className="h-px bg-white/30" />
            <div className="flex items-center justify-between text-[18px] font-semibold">
              <span>Заработано</span>
              <span className="flex items-center gap-1">
                +{coinsEarned}
                <img src={bitcoinSign} alt="btc" className="w-4 h-4" />
              </span>
            </div>
          </div>

          <button onClick={onRestart} className="btn-primary w-full mt-4 py-3 text-[18px] font-semibold">
            Играть снова
          </button>
          {isNewRecord && (
            <p className="text-center text-white/80 text-[12px] mt-2">★ Новый рекорд! ★</p>
          )}
        </div>
      </div>
    </div>
  )
}
