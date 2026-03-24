import { useGameStore } from '../game/store/gameStore'
import { playSound } from '../game/utils/sounds'

export function MainMenu() {
  const setPhase = useGameStore((s) => s.setPhase)
  const phase = useGameStore((s) => s.phase)

  if (phase !== 'menu') return null

  const onStart = () => {
    playSound('menu')
    useGameStore.getState().reset()
    setPhase('playing')
  }

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-[color:var(--bg)]/95 text-[color:var(--text-primary)] z-20"
      style={{
        padding:
          'var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left)',
      }}
    >
      <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight drop-shadow-lg">
        Lane Runner 3D
      </h1>
      <p className="text-[color:var(--text-secondary)] text-lg mb-10">Беги, собирай монеты, уворачивайся!</p>
      <button
        onClick={onStart}
        className="px-10 py-4 text-xl font-semibold rounded-full bg-[color:var(--surface-3)] text-[color:var(--text-primary)] border border-[color:var(--border)] transition active:scale-95 hover:bg-[color:var(--surface-2)]"
      >
        Start
      </button>
      <div className="mt-14 text-[color:var(--text-muted)] text-sm max-w-xs text-center space-y-2">
        <p className="font-medium text-[color:var(--text-secondary)]">Управление:</p>
        <p>A / D или ← / → — смена полосы</p>
        <p>W / ↑ / Пробел — прыжок</p>
        <p>S / ↓ — подкат</p>
        <p>Esc — пауза</p>
        <p className="pt-2">На мобильном: свайпы влево/вправо/вверх/вниз</p>
      </div>
    </div>
  )
}
