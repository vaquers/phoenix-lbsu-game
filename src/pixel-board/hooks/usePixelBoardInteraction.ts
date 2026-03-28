import { useEffect, useRef, useCallback } from 'react'
import { usePixelBoardStore, getPixelData } from '../state/pixelBoardStore'
import { screenToBoardCoords, zoomAtPoint, clampScale } from '../utils/viewportMath'
import { pixelKey } from '../utils/boardMath'
import { ERASER_COLOR, PINCH_COOLDOWN_MS } from '../constants/pixelBoard.config'
import { api } from '../../shared/api'
import { useUserStore } from '../../shared/userStore'
import { getZoneByPixel } from '../../shared/teamZones'
import { emitPixelUpdate } from '../socketClient'

type GestureState = 'idle' | 'drawing' | 'panning' | 'single-pan' | 'cooldown'

interface Pointer {
  x: number
  y: number
}

interface GestureData {
  state: GestureState
  pointers: Map<number, Pointer>
  lastPinchDist: number
  lastPinchCX: number
  lastPinchCY: number
  lastSingleX: number
  lastSingleY: number
  drawnCells: Set<string>
  cooldownTimer: number
}

export function usePixelBoardInteraction(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const gestureRef = useRef<GestureData>({
    state: 'idle',
    pointers: new Map(),
    lastPinchDist: 0,
    lastPinchCX: 0,
    lastPinchCY: 0,
    lastSingleX: 0,
    lastSingleY: 0,
    drawnCells: new Set(),
    cooldownTimer: 0,
  })

  const paintCell = useCallback(async (screenX: number, screenY: number) => {
    const el = containerRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const sx = screenX - rect.left
    const sy = screenY - rect.top

    const s = usePixelBoardStore.getState()
    const [bx, by] = screenToBoardCoords(sx, sy, s.viewportX, s.viewportY, s.scale)
    if (bx < 0 || bx >= s.boardWidth || by < 0 || by >= s.boardHeight) return

    const userId = useUserStore.getState().user?.id
    if (!userId) return

    const zoneId = getZoneByPixel(bx, by, s.boardWidth, s.boardHeight)
    if (zoneId === null) return

    const owners = s.zoneOwners || {}
    const owner = owners[zoneId]
    const myZoneId = Object.entries(owners).find(([, id]) => id === userId)?.[0]
    const myZone = myZoneId ? Number(myZoneId) : null

    if (!owner) {
      if (myZone !== null && myZone !== zoneId) return
      // Optimistically claim the zone locally to prevent drawing elsewhere
      if (myZone === null) {
        s.setZoneOwners({ ...owners, [zoneId]: userId })
      }
    } else if (owner !== userId) {
      return
    }

    const key = pixelKey(bx, by)
    const g = gestureRef.current
    if (g.drawnCells.has(key)) return
    g.drawnCells.add(key)

    const isErase = s.tool === 'erase'
    const color = isErase ? ERASER_COLOR : s.selectedColor

    if (isErase) {
      const pixels = getPixelData()
      if (!pixels.has(key)) return
      s.erasePixel(bx, by)
    } else {
      s.setPixel(bx, by, color)
    }

    const update = { x: bx, y: by, color }
    api.setPixel({ ...update, userId }).catch(() => {
      // rollback optimistic local draw on failure
      s.erasePixel(bx, by)
    })
    emitPixelUpdate({ ...update, userId })
  }, [containerRef])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const g = gestureRef.current

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault()
      el.setPointerCapture(e.pointerId)
      g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (g.pointers.size === 1 && g.state === 'idle') {
        const currentTool = usePixelBoardStore.getState().tool
        if (currentTool === 'move') {
          g.state = 'single-pan'
          g.lastSingleX = e.clientX
          g.lastSingleY = e.clientY
        } else {
          g.state = 'drawing'
          g.drawnCells.clear()
          void paintCell(e.clientX, e.clientY)
        }
      }

      if (g.pointers.size >= 2 && g.state !== 'panning') {
        g.state = 'panning'
        const pts = Array.from(g.pointers.values())
        g.lastPinchDist = Math.hypot(
          pts[1].x - pts[0].x,
          pts[1].y - pts[0].y,
        )
        g.lastPinchCX = (pts[0].x + pts[1].x) / 2
        g.lastPinchCY = (pts[0].y + pts[1].y) / 2
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!g.pointers.has(e.pointerId)) return
      g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (g.state === 'panning' && g.pointers.size >= 2) {
        const pts = Array.from(g.pointers.values())
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
        const cx = (pts[0].x + pts[1].x) / 2
        const cy = (pts[0].y + pts[1].y) / 2
        const dx = cx - g.lastPinchCX
        const dy = cy - g.lastPinchCY

        const rect = el.getBoundingClientRect()
        const anchorX = cx - rect.left
        const anchorY = cy - rect.top

        const s = usePixelBoardStore.getState()
        const scaleFactor = g.lastPinchDist > 0 ? dist / g.lastPinchDist : 1
        const newScale = clampScale(s.scale * scaleFactor, s.minScale)
        const ratio = newScale / s.scale
        const nx = anchorX - (anchorX - s.viewportX) * ratio + dx
        const ny = anchorY - (anchorY - s.viewportY) * ratio + dy

        s.setViewport(nx, ny, newScale)

        g.lastPinchDist = dist
        g.lastPinchCX = cx
        g.lastPinchCY = cy
        return
      }

      if (g.state === 'drawing' && g.pointers.size === 1) {
        void paintCell(e.clientX, e.clientY)
      }

      if (g.state === 'single-pan' && g.pointers.size === 1) {
        const dx = e.clientX - g.lastSingleX
        const dy = e.clientY - g.lastSingleY
        g.lastSingleX = e.clientX
        g.lastSingleY = e.clientY
        const s = usePixelBoardStore.getState()
        s.setViewport(s.viewportX + dx, s.viewportY + dy, s.scale)
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      g.pointers.delete(e.pointerId)
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {}

      if (g.pointers.size === 0) {
        if (g.state === 'panning' || g.state === 'single-pan') {
          g.state = 'cooldown'
          clearTimeout(g.cooldownTimer)
          g.cooldownTimer = window.setTimeout(() => {
            if (g.state === 'cooldown') g.state = 'idle'
          }, PINCH_COOLDOWN_MS)
        } else {
          g.state = 'idle'
        }
        g.drawnCells.clear()
        g.lastPinchDist = 0
        return
      }

      if (g.state === 'panning' && g.pointers.size === 1) {
        g.state = 'cooldown'
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15

      const s = usePixelBoardStore.getState()
      const result = zoomAtPoint(
        mx,
        my,
        s.scale,
        s.scale * factor,
        s.viewportX,
        s.viewportY,
        s.minScale,
      )
      s.setViewport(result.x, result.y, result.scale)
    }

    el.addEventListener('pointerdown', onPointerDown, { passive: false })
    el.addEventListener('pointermove', onPointerMove, { passive: false })
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
      el.removeEventListener('wheel', onWheel)
      clearTimeout(g.cooldownTimer)
    }
  }, [containerRef, paintCell])
}
