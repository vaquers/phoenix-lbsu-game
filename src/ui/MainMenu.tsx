import { useGameStore } from '../game/store/gameStore'
import { playSound } from '../game/utils/sounds'
import happyBird from '../../assets/happy_bird.png'

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
      className="absolute inset-0 flex flex-col z-20"
      style={{
        padding:
          'var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left)',
      }}
    >

      <div className="flex-1 flex flex-col items-center justify-start pt-10 px-6">
        <h1 className="text-[44px] leading-[1.05] font-extrabold text-[#EC432D] tracking-tight">
          Бегущий Феникс
        </h1>
        <img src={happyBird} alt="bird" className="w-[260px] h-auto mt-6 drop-shadow-[0_16px_30px_rgba(0,0,0,0.2)]" />
      </div>

      {/* Stats card */}
      <div className="px-6 pb-[calc(var(--tabbar-height)+18px)]">
        <div className="glass-panel-strong rounded-[var(--radius-card)] p-4">
          <div className="glass-panel rounded-[22px] px-5 py-3 flex items-center justify-between">
            <span className="text-[18px] font-semibold text-[color:var(--text-dark)]">Рекорд</span>
            <span className="text-[20px] font-semibold text-[color:var(--text-dark)]">1876</span>
          </div>
          <button
            onClick={onStart}
            className="btn-primary w-full mt-4 py-3 text-[18px] font-semibold"
          >
            Играть
          </button>
        </div>
      </div>
    </div>
  )
}
