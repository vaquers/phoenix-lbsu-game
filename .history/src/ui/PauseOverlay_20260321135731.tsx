import { useGameStore } from '../game/store/gameStore'

export function PauseOverlay() {
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)

  if (phase !== 'paused') return null

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white z-20"
      onClick={() => setPhase('playing')}
    >
      <p className="text-2xl font-bold">Пауза</p>
      <p className="text-slate-400 mt-2">Нажми Esc или экран для продолжения</p>
    </div>
  )
}
