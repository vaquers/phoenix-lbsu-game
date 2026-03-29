import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { GameApp } from './GameApp'
import { PixelBoardPage } from './pixel-board/PixelBoardPage'
import { LeaderboardPage } from './leaderboard/LeaderboardPage'
import { ShopPage } from './shop/ShopPage'
import { TabBar } from './game/components/TabBar/TabBar'
import { useUserStore } from './shared/userStore'
import { useGameStore } from './game/store/gameStore'
import { HIGH_SCORE_KEY } from './game/utils/constants'

export default function App() {
  const init = useUserStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    try {
      localStorage.setItem(HIGH_SCORE_KEY, '0')
    } catch {}
    useGameStore.getState().resetScores()
  }, [])

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg) return
    tg.ready?.()
    if (typeof tg.disableVerticalSwipes === 'function') {
      tg.disableVerticalSwipes()
    } else if (typeof tg.postEvent === 'function') {
      tg.postEvent('web_app_setup_swipe_behavior', {
        allow_vertical_swipes: false,
      })
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="w-full h-full flex flex-col" style={{ background: 'var(--app-bg)' }}>
        <div className="flex-1 min-h-0">
          <Routes>
            <Route path="/game" element={<GameApp />} />
            <Route path="/pixel-board" element={<PixelBoardPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="*" element={<Navigate to="/game" replace />} />
          </Routes>
        </div>
        <TabBar />
      </div>
    </BrowserRouter>
  )
}
