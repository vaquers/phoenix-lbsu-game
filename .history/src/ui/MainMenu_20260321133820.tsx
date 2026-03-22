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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-sky-900/90 to-slate-900/95 text-white z-20">
      <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight drop-shadow-lg">
        Lane Runner 3D
      </h1>
      <p className="text-slate-300 text-lg mb-10">Беги, собирай монеты, уворачивайся!</p>
      <button
        onClick={onStart}
        className="px-10 py-4 text-xl font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg transition active:scale-95"
      >
        Start
      </button>
      <div className="mt-14 text-slate-400 text-sm max-w-xs text-center space-y-2">
        <p className="font-medium text-slate-300">Управление:</p>
        <p>A / D или ← / → — смена полосы</p>
        <p>W / ↑ / Пробел — прыжок</p>
        <p>S / ↓ — подкат</p>
        <p>Esc — пауза</p>
        <p className="pt-2">На мобильном: свайпы влево/вправо/вверх/вниз</p>
      </div>
    </div>
  )
}
