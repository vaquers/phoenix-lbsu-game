import { useCallback, useEffect, useRef } from 'react'
import { useGameStore } from '../game/store/gameStore'
import { useUserStore } from '../shared/userStore'
import { playSound } from '../game/utils/sounds'
import { resetObstacleIds } from '../game/systems/obstacleManager'
import { resetCoinIds } from '../game/systems/coinManager'
import { resetPlatformIds } from '../game/systems/platformManager'
import { COINS_PER_GAME_BASE, COINS_PER_SCORE_DIVISOR } from '../shared/config'

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
      className="absolute inset-0 z-20 flex items-center justify-center"
      style={{
        padding: 'var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(5, 7, 6, 0.72)',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(18, 24, 22, 0.95), rgba(11, 15, 13, 0.98))',
          borderRadius: '22px',
          padding: '32px 28px',
          width: '85%',
          maxWidth: '340px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* ── Title ─────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#d96a6a',
              margin: 0,
              letterSpacing: '-0.5px',
              textShadow: '0 2px 12px rgba(255, 107, 107, 0.3)',
            }}
          >
            Game Over
          </h2>
          {isNewRecord && (
            <p
              style={{
                fontSize: '13px',
                color: '#d6a34a',
                marginTop: '6px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              ★ Новый рекорд! ★
            </p>
          )}
        </div>

        {/* ── Scores ────────────────────────────────────────────── */}
        <div
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '14px', color: 'rgba(243,245,244,0.6)', fontWeight: 500 }}>
              Счёт
            </span>
            <span style={{ fontSize: '26px', color: '#f3f5f4', fontWeight: 700 }}>{roundedScore}</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '14px', color: 'rgba(243,245,244,0.6)', fontWeight: 500 }}>
              Лучший
            </span>
            <span style={{ fontSize: '18px', color: '#d6a34a', fontWeight: 600 }}>{roundedHigh}</span>
          </div>
        </div>

        {/* ── Coins ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(214, 163, 74, 0.16), rgba(214, 163, 74, 0.08))',
            border: '1px solid rgba(214, 163, 74, 0.3)',
            borderRadius: '12px',
            padding: '10px 20px',
          }}
        >
          <span style={{ fontSize: '20px' }}>🪙</span>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#d6a34a' }}>+{coinsEarned}</span>
          <span style={{ fontSize: '12px', color: 'rgba(214, 163, 74, 0.6)', fontWeight: 500 }}>
            за игру
          </span>
        </div>

        {/* ── Restart button ────────────────────────────────────── */}
        <button
          onClick={onRestart}
          className="active:scale-95 transition-transform"
          style={{
            width: '100%',
            padding: '14px 0',
            fontSize: '17px',
            fontWeight: 700,
            color: '#f5f5f7',
            background: '#2b2b2e',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            boxShadow: 'none',
            letterSpacing: '0.5px',
          }}
        >
          Restart
        </button>

        <p style={{ fontSize: '12px', color: 'rgba(243, 245, 244, 0.35)', margin: 0 }}>
          или нажми Enter
        </p>
      </div>
    </div>
  )
}
