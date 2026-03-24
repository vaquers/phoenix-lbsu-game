import { useEffect, useRef } from 'react'
import { usePixelBoardStore } from './state/pixelBoardStore'
import { PixelBoardStage } from './components/PixelBoardStage'
import { PixelBoardToolbar } from './components/PixelBoardToolbar'
import { usePixelBoardInteraction } from './hooks/usePixelBoardInteraction'
import { api } from '../shared/api'
import {
  connectSocket,
  subscribePixelUpdates,
  subscribeStatus,
} from './socketClient'
import { centerViewport } from './utils/viewportMath'
import { DEFAULT_SCALE } from './constants/pixelBoard.config'

export function PixelBoardPage() {
  const loading = usePixelBoardStore((s) => s.loading)
  const error = usePixelBoardStore((s) => s.error)
  const boardLoaded = usePixelBoardStore((s) => s.boardLoaded)
  const connectionStatus = usePixelBoardStore((s) => s.connectionStatus)

  const containerRef = useRef<HTMLDivElement>(null)
  const viewInitialised = useRef(false)

  usePixelBoardInteraction(containerRef)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width > 0 && height > 0) {
        usePixelBoardStore.getState().setStageSize(
          Math.round(width),
          Math.round(height),
        )
      }
    }
    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const state = await api.getBoardState()
        if (cancelled) return
        usePixelBoardStore.getState().loadBoard(state.width, state.height, state.pixels)
      } catch (e) {
        console.error(e)
        if (!cancelled) {
          const s = usePixelBoardStore.getState()
          s.setLoading(false)
          s.setError('Failed to load board')
        }
      }
    })()
    return () => { cancelled = true }
  }, [])

  const stageW = usePixelBoardStore((s) => s.stageWidth)
  const stageH = usePixelBoardStore((s) => s.stageHeight)
  const boardW = usePixelBoardStore((s) => s.boardWidth)
  const boardH = usePixelBoardStore((s) => s.boardHeight)

  useEffect(() => {
    if (!boardLoaded || stageW === 0 || stageH === 0 || viewInitialised.current)
      return
    viewInitialised.current = true
    const vp = centerViewport(boardW, boardH, stageW, stageH, DEFAULT_SCALE)
    usePixelBoardStore.getState().setViewport(vp.x, vp.y, DEFAULT_SCALE)
  }, [boardLoaded, stageW, stageH, boardW, boardH])

  useEffect(() => {
    const unsubStatus = subscribeStatus((status) => {
      usePixelBoardStore.getState().setConnectionStatus(status)
    })
    connectSocket()
    const unsubPixels = subscribePixelUpdates((update) => {
      usePixelBoardStore.getState().applyRemotePixel(update.x, update.y, update.color)
    })
    return () => {
      unsubPixels()
      unsubStatus()
    }
  }, [])

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{
        background: 'var(--bg)',
        paddingBottom: 'var(--tabbar-height)',
      }}
    >
      <PixelBoardToolbar />

      {/* Canvas area — rounded white container */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 relative overflow-hidden"
        style={{
          background: 'var(--surface-1)',
          borderRadius: 24,
          marginLeft: 'calc(var(--safe-left) + 12px)',
          marginRight: 'calc(var(--safe-right) + 12px)',
          marginBottom: 8,
          touchAction: 'none',
          cursor: 'crosshair',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        {boardLoaded && <PixelBoardStage />}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="glass-panel rounded-xl px-6 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              <p className="text-[color:var(--text-muted)] text-sm">Loading board...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-[rgba(217,106,106,0.12)] rounded-xl px-6 py-4 border border-[rgba(217,106,106,0.25)]">
              <p className="text-[color:var(--error)] text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Connection indicator */}
        <span
          className={[
            'absolute bottom-3 right-3 w-2 h-2 rounded-full z-20 pointer-events-none transition-colors',
            connectionStatus === 'connected'
              ? 'bg-[color:var(--success)]'
              : connectionStatus === 'connecting'
                ? 'bg-[color:var(--warning)]'
                : 'bg-[color:var(--error)]',
          ].join(' ')}
        />
      </div>
    </div>
  )
}
