import type { InputAction } from './inputManager'
import { emitAction } from './inputManager'

const MIN_SWIPE_DISTANCE = 50
const MAX_SWIPE_TIME = 300

let touchStartX = 0
let touchStartY = 0
let touchStartTime = 0

function handleTouchStart(e: TouchEvent) {
  if (e.changedTouches.length === 0) return
  touchStartX = e.changedTouches[0].clientX
  touchStartY = e.changedTouches[0].clientY
  touchStartTime = Date.now()
}

function handleTouchEnd(e: TouchEvent) {
  if (e.changedTouches.length === 0) return
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  const dt = Date.now() - touchStartTime
  if (dt > MAX_SWIPE_TIME) return
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  if (absDx < MIN_SWIPE_DISTANCE && absDy < MIN_SWIPE_DISTANCE) return

  let action: InputAction | null = null
  if (absDx > absDy) {
    if (dx < 0) action = 'left'
    else action = 'right'
  } else {
    if (dy < 0) action = 'jump'
    else action = 'slide'
  }
  if (action) emitAction(action)
}

export function installMobileGestures() {
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchend', handleTouchEnd, { passive: true })
}

export function uninstallMobileGestures() {
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchend', handleTouchEnd)
}
