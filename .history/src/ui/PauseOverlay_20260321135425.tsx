import { useGameStore } from '../game/store/gameStore'

export function PauseOverlay() {
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)

  if (phase !== 'paused') return null

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-cream z-20"
      onClick={() => setPhase('playing')}
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <p className="font-heading text-3xl font-bold">Пауза</p>
      <p className="text-cream/50 mt-2">Нажми Esc или экран для продолжения</p>
    </div>
  )
}
