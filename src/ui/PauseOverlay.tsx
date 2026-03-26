import { useGameStore } from '../game/store/gameStore'

export function PauseOverlay() {
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)

  if (phase !== 'paused') return null

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 text-white z-20"
      style={{
        padding:
          'var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left)',
      }}
      onClick={() => setPhase('playing')}
    >
      <div className="glass-panel-strong rounded-[24px] px-6 py-4 text-center">
        <p className="text-2xl font-bold">Пауза</p>
        <p className="text-white/80 mt-2 text-sm">Нажми Esc или экран для продолжения</p>
      </div>
    </div>
  )
}
