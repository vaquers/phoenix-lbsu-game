import { useEffect } from 'react'
import { GameScene } from './game/components/GameScene'
import { MainMenu } from './ui/MainMenu'
import { HUD } from './ui/HUD'
import { GameOverScreen } from './ui/GameOverScreen'
import { PauseOverlay } from './ui/PauseOverlay'
import { installKeyboardInput, uninstallKeyboardInput } from './game/systems/inputManager'
import { installMobileGestures, uninstallMobileGestures } from './game/systems/mobileGestureHandler'

export function GameApp() {
  useEffect(() => {
    installKeyboardInput()
    installMobileGestures()
    return () => {
      uninstallKeyboardInput()
      uninstallMobileGestures()
    }
  }, [])

  return (
    <div className="w-full h-full relative bg-brand">
      <GameScene />
      <MainMenu />
      <HUD />
      <GameOverScreen />
      <PauseOverlay />
    </div>
  )
}

