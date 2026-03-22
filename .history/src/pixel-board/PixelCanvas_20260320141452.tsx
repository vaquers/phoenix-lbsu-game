import { useEffect, useRef } from 'react'
import type { BoardState, PixelUpdate } from './api'

type Props = {
  board: BoardState | null
  onPixelClick: (update: PixelUpdate) => void
  currentColor: string
  className?: string
}

export function PixelCanvas({ board, onPixelClick, currentColor, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const viewRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 })
  const rectRef = useRef({ width: 0, height: 0, dpr: 1 })

  const rafRef = useRef<number | null>(null)
  const scheduleDraw = () => {
    if (rafRef.current != null) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      draw()
    })
  }

  const draw = () => {
    if (!board) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height, dpr } = rectRef.current
    if (width <= 0 || height <= 0) return

    const { scale, offsetX, offsetY } = viewRef.current
    const cellW = width / board.width
    const cellH = height / board.height
    const drawCellW = cellW * scale
    const drawCellH = cellH * scale

    // Ensure we always render to current pixel ratio.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.clearRect(0, 0, width, height)

    // Background white.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const idx = y * board.width + x
        const color = board.pixels[idx] ?? '#000000'
        ctx.fillStyle = color
        ctx.fillRect(offsetX + x * drawCellW, offsetY + y * drawCellH, drawCellW, drawCellH)
      }
    }

    // Light grid lines to help orientation (only at reasonably sized zoom).
    if (scale >= 0.5) {
      ctx.strokeStyle = 'rgba(15,23,42,0.12)'
      ctx.lineWidth = 0.5
      const w = drawCellW
      const h = drawCellH
      for (let x = 0; x <= board.width; x++) {
        const xPos = offsetX + x * w + 0.5
        ctx.beginPath()
        ctx.moveTo(xPos, 0)
        ctx.lineTo(xPos, height)
        ctx.stroke()
      }
      for (let y = 0; y <= board.height; y++) {
        const yPos = offsetY + y * h + 0.5
        ctx.beginPath()
        ctx.moveTo(0, yPos)
        ctx.lineTo(width, yPos)
        ctx.stroke()
      }
    }
  }

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
  const minScale = 0.5
  const maxScale = 8

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const clientToBoard = (p: { x: number; y: number }) => {
    if (!board) return null
    const { width, height } = rectRef.current
    if (width <= 0 || height <= 0) return null

    const { scale, offsetX, offsetY } = viewRef.current
    const cellW = width / board.width
    const cellH = height / board.height

    const xFloat = (p.x - offsetX) / (cellW * scale)
    const yFloat = (p.y - offsetY) / (cellH * scale)
    const x = Math.floor(xFloat)
    const y = Math.floor(yFloat)

    if (x < 0 || x >= board.width || y < 0 || y >= board.height) return null
    return { x, y }
  }

  const paintAtClientPoint = (clientX: number, clientY: number) => {
    if (!board) return
    const p = getCanvasPoint(clientX, clientY)
    if (!p) return
    const cell = clientToBoard(p)
    if (!cell) return
    onPixelClick({ x: cell.x, y: cell.y, color: currentColor })
  }

  const activePointersRef = useRef(new Map<number, { x: number; y: number }>())
  const gestureRef = useRef<{
    startDist: number
    startScale: number
    startOffsetX: number
    startOffsetY: number
    startCenter: { x: number; y: number }
    startBoardAtCenter: { x: number; y: number } // float values
  } | null>(null)

  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    moved: boolean
    startOffsetX: number
    startOffsetY: number
    paintMode: boolean // paint continuously on move
    allowDrag: boolean // when scale != 1, use dragging instead of painting
  } | null>(null)

  const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      rectRef.current = {
        width: rect.width,
        height: rect.height,
        dpr,
      }
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      scheduleDraw()
    }

    updateSize()
    const ro = new ResizeObserver(() => updateSize())
    ro.observe(parent)
    return () => {
      ro.disconnect()
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scheduleDraw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board])

  return (
    <canvas
      ref={canvasRef}
      onWheel={(e) => {
        if (!board) return
        // Let users zoom on trackpads/mouse wheel.
        e.preventDefault()
        const p = getCanvasPoint(e.clientX, e.clientY)
        if (!p) return

        const { width, height } = rectRef.current
        if (width <= 0 || height <= 0) return

        const { scale, offsetX, offsetY } = viewRef.current
        const cellW = width / board.width
        const cellH = height / board.height

        // deltaY > 0 => wheel down => zoom out.
        const delta = -e.deltaY
        const zoom = Math.exp(delta * 0.001)
        const nextScale = clamp(scale * zoom, minScale, maxScale)

        // Keep the point under the cursor stable.
        const xFloat = (p.x - offsetX) / (cellW * scale)
        const yFloat = (p.y - offsetY) / (cellH * scale)

        viewRef.current.scale = nextScale
        viewRef.current.offsetX = p.x - xFloat * cellW * nextScale
        viewRef.current.offsetY = p.y - yFloat * cellH * nextScale
        scheduleDraw()
      }}
      onPointerDown={(e) => {
        if (!board) return
        const p = getCanvasPoint(e.clientX, e.clientY)
        if (!p) return

        activePointersRef.current.set(e.pointerId, p)

        // Pinch gesture (2 pointers) => zoom/pan mode.
        if (activePointersRef.current.size === 2) {
          const pts = [...activePointersRef.current.values()]
          const p1 = pts[0]
          const p2 = pts[1]
          const startDist = distance(p1, p2)
          const safeStartDist = Math.max(1, startDist)
          const startCenter = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
          const { scale, offsetX, offsetY } = viewRef.current
          const { width, height } = rectRef.current
          const cellW = width / board.width
          const cellH = height / board.height

          const xFloat = (startCenter.x - offsetX) / (cellW * scale)
          const yFloat = (startCenter.y - offsetY) / (cellH * scale)
          gestureRef.current = {
            startDist: safeStartDist,
            startScale: scale,
            startOffsetX: offsetX,
            startOffsetY: offsetY,
            startCenter,
            startBoardAtCenter: { x: xFloat, y: yFloat },
          }
          dragRef.current = null
          scheduleDraw()
          ;(e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId)
          return
        }

        // Single pointer:
        // - If scale === 1: paint immediately + paint while moving with the pointer held down.
        // - If scale !== 1: allow dragging (pan); paint only on tap (no significant movement).
        const { scale } = viewRef.current
        const allowDrag = scale !== 1
        const paintMode = !allowDrag

        dragRef.current = {
          pointerId: e.pointerId,
          startX: p.x,
          startY: p.y,
          moved: false,
          startOffsetX: viewRef.current.offsetX,
          startOffsetY: viewRef.current.offsetY,
          paintMode,
          allowDrag,
        }

        ;(e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId)

        if (paintMode) {
          paintAtClientPoint(e.clientX, e.clientY)
        }
      }}
      onPointerMove={(e) => {
        if (!board) return
        const p = getCanvasPoint(e.clientX, e.clientY)
        if (!p) return

        // Update pointer position.
        if (activePointersRef.current.has(e.pointerId)) {
          activePointersRef.current.set(e.pointerId, p)
        }

        // Two-pointer gesture => zoom/pan.
        if (activePointersRef.current.size === 2) {
          const gesture = gestureRef.current
          if (!gesture) return
          const pts = [...activePointersRef.current.values()]
          const p1 = pts[0]
          const p2 = pts[1]
          const dist = distance(p1, p2)
          const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }

          const { width, height } = rectRef.current
          if (width <= 0 || height <= 0) return
          const cellW = width / board.width
          const cellH = height / board.height

          const nextScale = clamp(
            (dist / Math.max(1, gesture.startDist)) * gesture.startScale,
            minScale,
            maxScale,
          )

          // Keep board coordinate under the pinch center stable.
          const xFloat = gesture.startBoardAtCenter.x
          const yFloat = gesture.startBoardAtCenter.y
          viewRef.current.scale = nextScale
          viewRef.current.offsetX = center.x - xFloat * cellW * nextScale
          viewRef.current.offsetY = center.y - yFloat * cellH * nextScale
          scheduleDraw()
          return
        }

        const drag = dragRef.current
        if (!drag) return
        if (drag.pointerId !== e.pointerId) return

        const dx = p.x - drag.startX
        const dy = p.y - drag.startY
        const distPx = Math.hypot(dx, dy)
        const tapThresholdPx = 8

        if (drag.allowDrag) {
          if (!drag.moved && distPx > tapThresholdPx) {
            drag.moved = true
          }
          if (drag.moved) {
            viewRef.current.offsetX = drag.startOffsetX + dx
            viewRef.current.offsetY = drag.startOffsetY + dy
            scheduleDraw()
          }
          return
        }

        // Paint while moving (only when scale === 1).
        if (drag.paintMode) {
          if (!drag.moved && distPx > 0.5) drag.moved = true
          // Paint at the current pointer location.
          paintAtClientPoint(e.clientX, e.clientY)
        }
      }}
      onPointerUp={(e) => {
        if (!board) return
        activePointersRef.current.delete(e.pointerId)

        const drag = dragRef.current
        if (!drag || drag.pointerId !== e.pointerId) return

        const p = getCanvasPoint(e.clientX, e.clientY)
        if (!p) return

        const dx = p.x - drag.startX
        const dy = p.y - drag.startY
        const distPx = Math.hypot(dx, dy)
        const tapThresholdPx = 8

        // If scale !== 1 and user tapped (no drag), paint once.
        if (drag.allowDrag && distPx <= tapThresholdPx) {
          paintAtClientPoint(e.clientX, e.clientY)
        }

        dragRef.current = null
        if (activePointersRef.current.size < 2) {
          gestureRef.current = null
        }
      }}
      onPointerCancel={(e) => {
        activePointersRef.current.delete(e.pointerId)
        dragRef.current = null
        if (activePointersRef.current.size < 2) {
          gestureRef.current = null
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault()
      }}
      className={['touch-none bg-white', className ?? 'w-full h-full'].filter(Boolean).join(' ')}
      style={{ backgroundColor: '#ffffff' }}
    />
  )
}

