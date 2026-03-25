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
import xmarkIcon from '../../assets/symbols/xmark.svg'

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
        background: 'transparent',
        paddingBottom: 'var(--tabbar-height)',
      }}
    >
      <div className="flex items-center justify-between px-5 pt-4">
        <button className="top-capsule flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-semibold">
          <img src={xmarkIcon} alt="" className="w-4 h-4" />
          Close
        </button>
        <div className="top-capsule flex items-center gap-3 px-4 py-2 rounded-full">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 12l4 4 8-8" />
          </svg>
          <span className="text-white/80 text-lg">• • •</span>
        </div>
      </div>

      <PixelBoardToolbar />

      {/* Canvas area — rounded white container */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 relative overflow-hidden"
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-card)',
          marginLeft: 'calc(var(--safe-left) + 12px)',
          marginRight: 'calc(var(--safe-right) + 12px)',
          marginBottom: 8,
          boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
          touchAction: 'none',
          cursor: 'crosshair',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        {boardLoaded && <PixelBoardStage />}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="glass-panel-strong rounded-xl px-6 py-4">
              <p className="text-black/70 text-sm">Loading board...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="glass-panel-strong rounded-xl px-6 py-4">
              <p className="text-black/70 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Connection indicator */}
        <span
          className={[
            'absolute bottom-3 right-3 w-2 h-2 rounded-full z-20 pointer-events-none transition-colors',
            connectionStatus === 'connected'
              ? 'bg-[#38E26C]'
              : connectionStatus === 'connecting'
                ? 'bg-[#FFD36B]'
                : 'bg-[#EC432D]',
          ].join(' ')}
        />
      </div>
    </div>
  )
}
