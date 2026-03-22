import { useEffect, useMemo, useState } from 'react'
import { COLOR_PALETTE } from './config'
import { fetchBoardState, type BoardState, type PixelUpdate, setPixel } from './api'
import { PixelCanvas } from './PixelCanvas'
import {
  connectSocket,
  emitPixelUpdate,
  getConnectionStatus,
  subscribePixelUpdates,
  subscribeStatus,
  type ConnectionStatus,
} from './socketClient'

export function PixelBoardPage() {
  const [board, setBoard] = useState<BoardState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentColor, setCurrentColor] = useState(COLOR_PALETTE[0])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(getConnectionStatus)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const initial = await fetchBoardState()
        if (!cancelled) {
          setBoard(initial)
          setError(null)
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('Не удалось загрузить доску')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const unsubStatus = subscribeStatus(setConnectionStatus)
    connectSocket()
    const unsubPixels = subscribePixelUpdates((update) => {
      setBoard((prev) => {
        if (!prev) return prev
        const idx = update.y * prev.width + update.x
        if (idx < 0 || idx >= prev.pixels.length) return prev
        if (prev.pixels[idx] === update.color) return prev
        const nextPixels = prev.pixels.slice()
        nextPixels[idx] = update.color
        return { ...prev, pixels: nextPixels }
      })
    })

    return () => {
      unsubPixels()
      unsubStatus()
    }
  }, [])

  const connectionLabel = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'disconnected':
      default:
        return 'Disconnected'
    }
  }, [connectionStatus])

  const handlePixelClick = async (update: PixelUpdate) => {
    if (!board) return
    const idx = update.y * board.width + update.x
    if (idx < 0 || idx >= board.pixels.length) return

    // оптимистичное обновление
    setBoard((prev) => {
      if (!prev) return prev
      const pixels = prev.pixels.slice()
      pixels[idx] = update.color
      return { ...prev, pixels }
    })

    try {
      await setPixel(update)
      emitPixelUpdate(update)
    } catch (e) {
      console.error(e)
      // при ошибке можно было бы откатить, но для MVP просто логируем
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-4 text-white">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 items-start justify-center">
        <div className="flex flex-col items-center gap-3 flex-1">
          <h1 className="text-xl md:text-2xl font-semibold mb-1">Pixel Board</h1>
          {loading && <p className="text-slate-300 text-sm">Загружаем доску...</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {board && (
            <PixelCanvas
              board={board}
              onPixelClick={handlePixelClick}
              currentColor={currentColor}
            />
          )}
          {board && (
            <p className="text-xs text-slate-400 mt-1">
              Размер: {board.width}×{board.height}
            </p>
          )}
        </div>

        <div className="w-full md:w-64 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium mb-2 text-slate-200">Палитра</h2>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={[
                    'w-8 h-8 rounded-md border transition-transform',
                    currentColor === color
                      ? 'ring-2 ring-emerald-400 border-white scale-110'
                      : 'border-slate-700 hover:scale-105',
                  ].join(' ')}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="text-sm text-slate-300 space-y-1">
            <p>
              <span className="font-medium text-slate-100">Статус соединения:</span>{' '}
              <span
                className={
                  connectionStatus === 'connected'
                    ? 'text-emerald-400'
                    : connectionStatus === 'connecting'
                      ? 'text-amber-400'
                      : 'text-red-400'
                }
              >
                {connectionLabel}
              </span>
            </p>
            <p className="text-xs text-slate-500">
              Клик или тап по пикселю — закрасить выбранным цветом. Удерживайте кнопку мыши для
              рисования.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

