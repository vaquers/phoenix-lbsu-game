import { memo, useCallback, useRef, useEffect } from 'react'
import { Stage, Layer, Rect, Shape } from 'react-konva'
import Konva from 'konva'
import { usePixelBoardStore, getPixelData } from '../state/pixelBoardStore'
import { getVisibleRange } from '../utils/viewportMath'
import { pixelKey, parsePixelKey } from '../utils/boardMath'
import {
  GRID_VISIBLE_MIN_SCALE,
  MAJOR_GRID_INTERVAL,
  MAJOR_GRID_VISIBLE_MIN_SCALE,
} from '../constants/pixelBoard.config'

export const PixelBoardStage = memo(function PixelBoardStage() {
  const boardW = usePixelBoardStore((s) => s.boardWidth)
  const boardH = usePixelBoardStore((s) => s.boardHeight)
  const vpX = usePixelBoardStore((s) => s.viewportX)
  const vpY = usePixelBoardStore((s) => s.viewportY)
  const scale = usePixelBoardStore((s) => s.scale)
  const stageW = usePixelBoardStore((s) => s.stageWidth)
  const stageH = usePixelBoardStore((s) => s.stageHeight)
  const showGrid = usePixelBoardStore((s) => s.showGrid)
  const pixelVersion = usePixelBoardStore((s) => s.pixelVersion)

  const pixelLayerRef = useRef<Konva.Layer>(null)
  const gridLayerRef = useRef<Konva.Layer>(null)

  useEffect(() => {
    pixelLayerRef.current?.batchDraw()
  }, [pixelVersion])

  const range = getVisibleRange(vpX, vpY, scale, stageW, stageH, boardW, boardH)

  const drawPixels = useCallback(
    (context: Konva.Context) => {
      const ctx = context._context as CanvasRenderingContext2D
      ctx.imageSmoothingEnabled = false

      const pixels = getPixelData()
      const visibleCells =
        (range.endCol - range.startCol) * (range.endRow - range.startRow)

      if (pixels.size < visibleCells) {
        pixels.forEach((color, key) => {
          const [x, y] = parsePixelKey(key)
          if (
            x < range.startCol ||
            x >= range.endCol ||
            y < range.startRow ||
            y >= range.endRow
          )
            return
          ctx.fillStyle = color
          ctx.fillRect(x, y, 1, 1)
        })
      } else {
        for (let row = range.startRow; row < range.endRow; row++) {
          for (let col = range.startCol; col < range.endCol; col++) {
            const color = pixels.get(pixelKey(col, row))
            if (!color) continue
            ctx.fillStyle = color
            ctx.fillRect(col, row, 1, 1)
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pixelVersion, range.startCol, range.startRow, range.endCol, range.endRow],
  )

  const gridVisible = showGrid && scale >= MAJOR_GRID_VISIBLE_MIN_SCALE
  const fineGridVisible = showGrid && scale >= GRID_VISIBLE_MIN_SCALE

  const drawGrid = useCallback(
    (context: Konva.Context) => {
      const ctx = context._context as CanvasRenderingContext2D
      const inv = 1 / scale

      const { startCol, startRow, endCol, endRow } = range

      if (fineGridVisible) {
        ctx.beginPath()
        for (let col = startCol; col <= endCol; col++) {
          ctx.moveTo(col, startRow)
          ctx.lineTo(col, endRow)
        }
        for (let row = startRow; row <= endRow; row++) {
          ctx.moveTo(startCol, row)
          ctx.lineTo(endCol, row)
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.08)'
        ctx.lineWidth = inv * 0.5
        ctx.stroke()
      }

      if (gridVisible) {
        ctx.beginPath()
        const majorStartCol =
          Math.ceil(startCol / MAJOR_GRID_INTERVAL) * MAJOR_GRID_INTERVAL
        const majorStartRow =
          Math.ceil(startRow / MAJOR_GRID_INTERVAL) * MAJOR_GRID_INTERVAL
        for (let col = majorStartCol; col <= endCol; col += MAJOR_GRID_INTERVAL) {
          ctx.moveTo(col, startRow)
          ctx.lineTo(col, endRow)
        }
        for (let row = majorStartRow; row <= endRow; row += MAJOR_GRID_INTERVAL) {
          ctx.moveTo(startCol, row)
          ctx.lineTo(endCol, row)
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.18)'
        ctx.lineWidth = inv
        ctx.stroke()
      }
    },
    [range.startCol, range.startRow, range.endCol, range.endRow, scale, gridVisible, fineGridVisible],
  )

  if (stageW === 0 || stageH === 0) return null

  return (
    <Stage
      width={stageW}
      height={stageH}
      listening={false}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      {/* Background layer */}
      <Layer listening={false} x={vpX} y={vpY} scaleX={scale} scaleY={scale}>
        <Rect
          x={0}
          y={0}
          width={boardW}
          height={boardH}
          fill="#ffffff"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={1 / scale}
          listening={false}
          perfectDrawEnabled={false}
        />
      </Layer>

      {/* Pixel cells layer */}
      <Layer
        ref={pixelLayerRef}
        listening={false}
        x={vpX}
        y={vpY}
        scaleX={scale}
        scaleY={scale}
      >
        <Shape sceneFunc={drawPixels} listening={false} perfectDrawEnabled={false} />
      </Layer>

      {/* Grid layer */}
      {(gridVisible || fineGridVisible) && (
        <Layer
          ref={gridLayerRef}
          listening={false}
          x={vpX}
          y={vpY}
          scaleX={scale}
          scaleY={scale}
        >
          <Shape sceneFunc={drawGrid} listening={false} perfectDrawEnabled={false} />
        </Layer>
      )}
    </Stage>
  )
})
