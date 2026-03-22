import { useGameStore } from '../game/store/gameStore'
import { playSound } from '../game/utils/sounds'
import { resetObstacleIds } from '../game/systems/obstacleManager'
import { resetCoinIds } from '../game/systems/coinManager'

export function GameOverScreen() {
  const phase = useGameStore((s) => s.phase)
  const score = useGameStore((s) => s.score)
  const highScore = useGameStore((s) => s.highScore)
  const reset = useGameStore((s) => s.reset)
  const setPhase = useGameStore((s) => s.setPhase)

  if (phase !== 'gameOver') return null

  const onRestart = () => {
    playSound('menu')
    resetObstacleIds()
    resetCoinIds()
    reset()
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-20" style={{ fontFamily: "'Soledago', sans-serif" }}>
      <h2 className="text-4xl font-bold mb-6 text-red-400">Game Over</h2>
      <p className="text-2xl mb-1">Счёт: {score}</p>
      <p className="text-lg text-amber-400 mb-8">Лучший результат: {highScore}</p>
      <button
        onClick={onRestart}
        className="px-10 py-4 text-xl font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg transition active:scale-95"
      >
        Restart
      </button>
      <p className="mt-6 text-slate-400 text-sm">или нажми Enter</p>
    </div>
  )
}
