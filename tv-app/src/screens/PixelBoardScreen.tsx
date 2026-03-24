import { useState, useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { tvApi } from '../api'
import { BACKEND_URL } from '../config'
import type { PixelBoardState, PixelUpdate } from '../types'

export function PixelBoardScreen() {
  const [board, setBoard] = useState<PixelBoardState | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    tvApi.getBoardState().then(setBoard).catch(console.error)
  }, [])

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('pixel:update', (update: PixelUpdate) => {
      setBoard((prev) => {
        if (!prev) return prev
        const idx = update.y * prev.width + update.x
        if (idx < 0 || idx >= prev.pixels.length) return prev
        const nextPixels = prev.pixels.slice()
        nextPixels[idx] = update.color
        return { ...prev, pixels: nextPixels }
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const draw = useCallback(() => {
    if (!board || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const displayW = canvas.width
    const displayH = canvas.height
    const cellW = displayW / board.width
    const cellH = displayH / board.height

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, displayW, displayH)

    for (let row = 0; row < board.height; row++) {
      for (let col = 0; col < board.width; col++) {
        const idx = row * board.width + col
        const color = board.pixels[idx] ?? '#000000'
        if (color === '#000000') continue
        ctx.fillStyle = color
        ctx.fillRect(
          Math.floor(col * cellW),
          Math.floor(row * cellH),
          Math.ceil(cellW),
          Math.ceil(cellH),
        )
      }
    }
  }, [board])

  useEffect(() => {
    draw()
  }, [draw])

  const canvasSize = Math.min(1080, typeof window !== 'undefined' ? window.innerHeight - 160 : 900)

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-[color:var(--text-primary)]">
      <h1 className="text-5xl font-bold tracking-tight mb-6 opacity-90">
        🎨 Pixel Board
      </h1>

      {!board && (
        <div className="text-[color:var(--text-muted)] text-2xl">Загрузка доски...</div>
      )}

      {board && (
        <>
          <canvas
            ref={canvasRef}
            width={board.width}
            height={board.height}
            className="rounded-2xl shadow-2xl border border-white/10"
            style={{
              width: canvasSize,
              height: canvasSize,
              imageRendering: 'pixelated',
            }}
          />
          <p className="text-lg text-[color:var(--text-muted)] mt-4">
            {board.width} × {board.height} пикселей
          </p>
        </>
      )}
    </div>
  )
}
