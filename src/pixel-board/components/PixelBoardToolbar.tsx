import { memo, useCallback } from 'react'
import { usePixelBoardStore } from '../state/pixelBoardStore'
import { useUserStore } from '../../shared/userStore'
import { COLOR_PALETTE, ERASER_COLOR } from '../constants/pixelBoard.config'
import { centerViewport, fitBoardScale } from '../utils/viewportMath'

import pencilIcon from '../../../assets/symbols/pencil.svg'
import eraserIcon from '../../../assets/symbols/eraser.line.dashed.svg'
import handIcon from '../../../assets/symbols/hand.draw.svg'
import gridIcon from '../../../assets/symbols/grid.svg'
import scopeIcon from '../../../assets/symbols/scope.svg'

function ToolCircle({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-full flex items-center justify-center transition-all active:scale-90 flex-shrink-0',
        active
          ? 'bg-white/75 border border-white/70'
          : 'bg-white/55 border border-white/50',
      ].join(' ')}
      style={{ width: 48, height: 48 }}
      title={label}
    >
      <img
        src={icon}
        alt={label}
        className="pointer-events-none"
        style={{ width: 24, height: 24, filter: 'brightness(0) opacity(0.85)' }}
      />
    </button>
  )
}

export const PixelBoardToolbar = memo(function PixelBoardToolbar() {
  const tool = usePixelBoardStore((s) => s.tool)
  const showGrid = usePixelBoardStore((s) => s.showGrid)
  const showPalette = usePixelBoardStore((s) => s.showPalette)
  const selectedColor = usePixelBoardStore((s) => s.selectedColor)
  const zoneOwners = usePixelBoardStore((s) => s.zoneOwners)
  const userId = useUserStore((s) => s.user?.id)

  const setTool = usePixelBoardStore((s) => s.setTool)
  const toggleGrid = usePixelBoardStore((s) => s.toggleGrid)
  const setShowPalette = usePixelBoardStore((s) => s.setShowPalette)
  const setViewport = usePixelBoardStore((s) => s.setViewport)
  const setSelectedColor = usePixelBoardStore((s) => s.setSelectedColor)

  const isErase = tool === 'erase'
  const displayColor = isErase ? ERASER_COLOR : selectedColor



  const handleFitBoard = useCallback(() => {
    const s = usePixelBoardStore.getState()
    const fitScale = fitBoardScale(
      s.boardWidth,
      s.boardHeight,
      s.stageWidth,
      s.stageHeight,
    )
    const center = centerViewport(
      s.boardWidth,
      s.boardHeight,
      s.stageWidth,
      s.stageHeight,
      fitScale,
    )
    setViewport(center.x, center.y, fitScale)
  }, [setViewport])

  return (
    <>
      {/* Toolbar row */}
      <div
        className="relative z-30 flex items-center justify-between"
        style={{
          paddingTop: '12px',
          paddingBottom: 12,
          paddingLeft: 'calc(var(--safe-left) + 16px)',
          paddingRight: 'calc(var(--safe-right) + 16px)',
        }}
      >
        <ToolCircle
          active={tool === 'draw'}
          icon={pencilIcon}
          label="Draw"
          onClick={() => setTool('draw')}
        />
        <ToolCircle
          active={isErase}
          icon={eraserIcon}
          label="Erase"
          onClick={() => setTool('erase')}
        />
        <ToolCircle
          active={tool === 'move'}
          icon={handIcon}
          label="Move"
          onClick={() => setTool('move')}
        />
        <ToolCircle
          active={showGrid}
          icon={gridIcon}
          label="Grid"
          onClick={toggleGrid}
        />
        <ToolCircle
          active={false}
          icon={scopeIcon}
          label="Fit"
          onClick={handleFitBoard}
        />

        {/* Color picker — 36x36 circle inside 48x48 button */}
        <button
          onClick={() => setShowPalette(!showPalette)}
          className="rounded-full flex items-center justify-center flex-shrink-0 bg-white/60 transition-all active:scale-90 border border-white/50"
          style={{ width: 48, height: 48 }}
        >
          <span
            className="rounded-full block"
            style={{
              width: 36,
              height: 36,
              backgroundColor: displayColor,
              boxShadow: isErase ? 'inset 0 0 0 2px rgba(0,0,0,0.1)' : 'none',
            }}
          />
        </button>
      </div>

      <div
        className="px-4 pb-2 text-[12px] text-black/70"
        style={{
          paddingLeft: 'calc(var(--safe-left) + 16px)',
          paddingRight: 'calc(var(--safe-right) + 16px)',
        }}
      >
        {(() => {
          const myZoneIdRaw = userId
            ? Object.entries(zoneOwners || {}).find(([, id]) => id === userId)?.[0]
            : undefined
          const myZoneId = myZoneIdRaw !== undefined ? Number(myZoneIdRaw) : null
          if (Number.isFinite(myZoneId) && myZoneId !== null) {
            return `Ваша зона: ${Number(myZoneId) + 1}`
          }
          return 'Зона не занята — выберите место и начните рисовать'
        })()}
      </div>

      {/* Palette popup */}
      {showPalette && (
        <div
          className="absolute inset-0 z-40"
          onClick={() => setShowPalette(false)}
        >
          <div
            className="absolute glass-panel-strong rounded-2xl p-3 shadow-xl"
            style={{
              top: 'calc(var(--safe-top) + 76px)',
              right: 'calc(var(--safe-right) + 12px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={[
                    'w-10 h-10 rounded-xl border-2 transition-all active:scale-90',
                    !isErase && selectedColor === color
                      ? 'border-white/80 scale-105'
                      : 'border-transparent hover:border-white/40',
                  ].join(' ')}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-white/30 flex items-center gap-2">
              <button
                onClick={() => setTool('erase')}
                className={[
                  'flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium transition-all',
                  isErase
                    ? 'bg-white/70 text-black'
                    : 'bg-white/30 text-black/70 border border-white/40',
                ].join(' ')}
              >
                <img
                  src={eraserIcon}
                  alt=""
                  className="w-4 h-4"
                  style={{
                    filter: isErase
                      ? 'brightness(0) opacity(0.9)'
                      : 'brightness(0) opacity(0.6)',
                  }}
                />
                Eraser
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
})
