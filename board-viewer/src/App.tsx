import { useEffect, useMemo, useState } from 'react'
import { io, Socket } from 'socket.io-client'

type BoardState = {
  width: number
  height: number
  pixels: string[]
}

type PixelUpdate = {
  x: number
  y: number
  color: string
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000'

function createEmptyBoard(width: number, height: number): BoardState {
  return {
    width,
    height,
    pixels: new Array(width * height).fill('#000000'),
  }
}

export function App() {
  const [board, setBoard] = useState<BoardState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [updatesCount, setUpdatesCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/board`)
        if (!res.ok) throw new Error('Failed to load board')
        const data = (await res.json()) as BoardState
        if (!cancelled) {
          setBoard(
            data.width && data.height && Array.isArray(data.pixels)
              ? data
              : createEmptyBoard(128, 128),
          )
          setError(null)
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) {
          setError('Не удалось загрузить доску')
          setBoard(createEmptyBoard(128, 128))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const socket: Socket = io(BACKEND_URL, {
      transports: ['websocket'],
    })

    setConnectionStatus('connecting')

    socket.on('connect', () => {
      setConnectionStatus('connected')
    })

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected')
    })

    socket.on('pixel:update', (update: PixelUpdate) => {
      setUpdatesCount((c) => c + 1)
      setBoard((prev) => {
        if (!prev) return prev
        const idx = update.y * prev.width + update.x
        if (idx < 0 || idx >= prev.pixels.length) return prev
        if (prev.pixels[idx] === update.color) return prev
        const pixels = prev.pixels.slice()
        pixels[idx] = update.color
        return { ...prev, pixels }
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const canvasSize = 512

  const boardInfo = useMemo(() => {
    if (!board) return ''
    return `${board.width}×${board.height}`
  }, [board])

  return (
    <div className="viewer-root">
      <div className="viewer-card">
        <header className="viewer-header">
          <h1 className="viewer-title">Pixel Board Viewer</h1>
          <div className="viewer-status-row">
            <span
              className={[
                'viewer-status-dot',
                connectionStatus === 'connected'
                  ? 'viewer-status-dot--ok'
                  : connectionStatus === 'connecting'
                  ? 'viewer-status-dot--warn'
                  : 'viewer-status-dot--err',
              ].join(' ')}
            />
            <span className="viewer-status-text">
              {connectionStatus === 'connected'
                ? 'Connected'
                : connectionStatus === 'connecting'
                ? 'Connecting...'
                : 'Disconnected'}
            </span>
          </div>
        </header>

        <main className="viewer-main">
          <div className="viewer-canvas-wrapper">
            {loading && <p className="viewer-text-muted">Загружаем доску...</p>}
            {error && <p className="viewer-text-error">{error}</p>}
            {board && (
              <CanvasView board={board} size={canvasSize} key={board.width + 'x' + board.height} />
            )}
          </div>

          <aside className="viewer-sidebar">
            <p className="viewer-text-muted">Размер доски: {boardInfo || '—'}</p>
            <p className="viewer-text-muted">Обновлений: {updatesCount}</p>
          </aside>
        </main>
      </div>
    </div>
  )
}

type CanvasViewProps = {
  board: BoardState
  size: number
}

function CanvasView({ board, size }: CanvasViewProps) {
  const canvasId = 'viewer-canvas'

  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cellW = size / board.width
    const cellH = size / board.height

    ctx.clearRect(0, 0, size, size)

    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const idx = y * board.width + x
        const color = board.pixels[idx] ?? '#000000'
        ctx.fillStyle = color
        ctx.fillRect(x * cellW, y * cellH, cellW, cellH)
      }
    }
  }, [board, size, canvasId])

  return (
    <canvas
      id={canvasId}
      width={size}
      height={size}
      className="viewer-canvas"
    />
  )
}

