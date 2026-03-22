import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { GameApp } from './GameApp'
import { PixelBoardPage } from './pixel-board/PixelBoardPage'
import { LeaderboardPage } from './leaderboard/LeaderboardPage'
import { ShopPage } from './shop/ShopPage'
import { TabBar } from './game/components/TabBar/TabBar'
import { useUserStore } from './shared/userStore'

export default function App() {
  const init = useUserStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <div className="w-full h-full flex flex-col bg-brand text-cream">
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
