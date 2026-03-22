import { useEffect, useMemo, useState } from 'react'
import { COLOR_PALETTE } from './config'
import { parseColor } from './colorUtils'
import { fetchBoardState, type BoardState, type PixelUpdate, setPixel } from './api'
import { PixelCanvas } from './PixelCanvas'
import { ColorPickerModal } from './ColorPickerModal'
import {
  connectSocket,
  emitPixelUpdate,
  getConnectionStatus,
  subscribePixelUpdates,
  subscribeStatus,
  type ConnectionStatus,
} from './socketClient'

export function PixelBoardPage() {
  const presetColors = useMemo(() => COLOR_PALETTE.slice(0, 9), [])
  const [board, setBoard] = useState<BoardState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentColor, setCurrentColor] = useState(COLOR_PALETTE[0])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(getConnectionStatus)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

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

  const isPresetActive = (preset: string) => {
    const a = parseColor(preset)
    const b = parseColor(currentColor)
    return a.r === b.r && a.g === b.g && a.b === b.b
  }

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
    <div className="w-full h-full relative overflow-hidden bg-slate-900 text-white">
      {/* Fullscreen white canvas behind UI overlays */}
      <PixelCanvas
        board={board}
        onPixelClick={handlePixelClick}
        currentColor={currentColor}
        className="absolute inset-0 w-full h-full"
      />

      <div className="relative z-[1500] px-4 pt-4 flex items-start justify-between gap-4 pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto bg-slate-900/35 backdrop-blur rounded-2xl px-3 py-2">
          <h1 className="text-xl md:text-2xl font-semibold">Pixel Board</h1>
          {loading && <p className="text-slate-300 text-sm">Загружаем доску...</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {board && (
            <p className="text-xs text-slate-400">
              Размер: {board.width}×{board.height}
            </p>
          )}
          <p className="text-xs text-slate-500 mt-2 max-w-[520px]">
            Клик или тап по пикселю — закрасить выбранным цветом. Два пальца — зум/панель.
          </p>
        </div>

        <div className="text-sm text-slate-300 space-y-1 text-right pt-1 pointer-events-auto bg-slate-900/35 backdrop-blur rounded-2xl px-3 py-2">
          <p>
            <span className="font-medium text-slate-100">Status:</span>{' '}
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
        </div>
      </div>

      {/* Bottom color picker bar (above TabBar overlay) */}
      <div className="fixed left-0 right-0 bottom-24 z-[1500] px-4">
        <div className="w-full max-w-md mx-auto bg-white/75 backdrop-blur rounded-2xl px-4 py-3 flex flex-wrap items-center justify-center gap-3 text-slate-900">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setCurrentColor(color)}
              aria-label={`Color ${color}`}
              className={[
                'w-8 h-8 rounded-full border transition-transform',
                isPresetActive(color)
                  ? 'border-fuchsia-500 ring-2 ring-white/60 scale-110'
                  : 'border-slate-200 hover:scale-105',
              ].join(' ')}
              style={{ backgroundColor: color }}
            />
          ))}

          <button
            type="button"
            aria-label="Open color picker"
            onClick={() => setIsColorPickerOpen(true)}
            className="w-8 h-8 rounded-full border border-slate-300/80 bg-white/60 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <span className="text-lg font-semibold leading-none">+</span>
          </button>
        </div>
      </div>

      {isColorPickerOpen && (
        <ColorPickerModal
          value={currentColor}
          onChange={setCurrentColor}
          onClose={() => setIsColorPickerOpen(false)}
          presetColors={presetColors}
        />
      )}
    </div>
  )
}

