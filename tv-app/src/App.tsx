import { useState, useEffect, useCallback, useRef } from 'react'
import { SCREEN_ROTATION, TRANSITION_DURATION } from './config'
import { TeamPhotosScreen } from './screens/TeamPhotosScreen'
import { LeaderboardScreen } from './screens/LeaderboardScreen'
import { UserPhotosScreen } from './screens/UserPhotosScreen'
import { PixelBoardScreen } from './screens/PixelBoardScreen'

const SCREENS: Record<string, React.FC> = {
  'team-photos': TeamPhotosScreen,
  'leaderboard': LeaderboardScreen,
  'user-photos': UserPhotosScreen,
  'pixel-board': PixelBoardScreen,
}

export default function App() {
  const [screenIndex, setScreenIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentConfig = SCREEN_ROTATION[screenIndex]
  const ScreenComponent = SCREENS[currentConfig.id]

  const advanceScreen = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      setScreenIndex((prev) => (prev + 1) % SCREEN_ROTATION.length)
      setVisible(true)
    }, TRANSITION_DURATION)
  }, [])

  useEffect(() => {
    timerRef.current = setTimeout(advanceScreen, currentConfig.duration * 1000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [screenIndex, currentConfig.duration, advanceScreen])

  const progressPercent =
    ((screenIndex + 1) / SCREEN_ROTATION.length) * 100

  return (
    <div className="w-full h-screen relative overflow-hidden" style={{ background: 'var(--app-bg)' }}>
      <div
        className="w-full h-full transition-opacity"
        style={{
          opacity: visible ? 1 : 0,
          transitionDuration: `${TRANSITION_DURATION}ms`,
          transitionTimingFunction: 'ease-in-out',
        }}
      >
        {ScreenComponent && <ScreenComponent />}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <div
          className="h-full bg-white/10 transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {SCREEN_ROTATION.map((s, i) => (
          <div
            key={s.id}
            className={[
              'w-2 h-2 rounded-full transition-all duration-300',
              i === screenIndex ? 'bg-white/40 scale-125' : 'bg-white/15',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}
