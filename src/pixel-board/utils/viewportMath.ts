import type { VisibleRange } from '../types/pixelBoard.types'
import { ABS_MIN_SCALE, MAX_SCALE } from '../constants/pixelBoard.config'

export function computeMinScale(
  stageWidth: number,
  stageHeight: number,
  boardWidth: number,
  boardHeight: number,
): number {
  if (stageWidth <= 0 || stageHeight <= 0 || boardWidth <= 0 || boardHeight <= 0) {
    return ABS_MIN_SCALE
  }
  return Math.max(
    ABS_MIN_SCALE,
    Math.min(stageWidth / boardWidth, stageHeight / boardHeight),
  )
}

export function clampScale(scale: number, minScale: number = ABS_MIN_SCALE): number {
  return Math.min(MAX_SCALE, Math.max(minScale, scale))
}

export function getVisibleRange(
  vpX: number,
  vpY: number,
  scale: number,
  stageWidth: number,
  stageHeight: number,
  boardWidth: number,
  boardHeight: number,
): VisibleRange {
  const left = -vpX / scale
  const top = -vpY / scale
  const right = left + stageWidth / scale
  const bottom = top + stageHeight / scale
  return {
    startCol: Math.max(0, Math.floor(left) - 1),
    startRow: Math.max(0, Math.floor(top) - 1),
    endCol: Math.min(boardWidth, Math.ceil(right) + 1),
    endRow: Math.min(boardHeight, Math.ceil(bottom) + 1),
  }
}

export function screenToBoardCoords(
  screenX: number,
  screenY: number,
  vpX: number,
  vpY: number,
  scale: number,
): [number, number] {
  return [
    Math.floor((screenX - vpX) / scale),
    Math.floor((screenY - vpY) / scale),
  ]
}

export function zoomAtPoint(
  anchorX: number,
  anchorY: number,
  oldScale: number,
  newScale: number,
  vpX: number,
  vpY: number,
  minScale: number = ABS_MIN_SCALE,
): { x: number; y: number; scale: number } {
  const clamped = clampScale(newScale, minScale)
  const ratio = clamped / oldScale
  return {
    x: anchorX - (anchorX - vpX) * ratio,
    y: anchorY - (anchorY - vpY) * ratio,
    scale: clamped,
  }
}

export function centerViewport(
  boardWidth: number,
  boardHeight: number,
  stageWidth: number,
  stageHeight: number,
  scale: number,
): { x: number; y: number } {
  return {
    x: (stageWidth - boardWidth * scale) / 2,
    y: (stageHeight - boardHeight * scale) / 2,
  }
}

export function fitBoardScale(
  boardWidth: number,
  boardHeight: number,
  stageWidth: number,
  stageHeight: number,
  padding: number = 16,
): number {
  const availW = stageWidth - padding * 2
  const availH = stageHeight - padding * 2
  if (availW <= 0 || availH <= 0) return ABS_MIN_SCALE
  const minScale = computeMinScale(stageWidth, stageHeight, boardWidth, boardHeight)
  return clampScale(Math.min(availW / boardWidth, availH / boardHeight), minScale)
}
