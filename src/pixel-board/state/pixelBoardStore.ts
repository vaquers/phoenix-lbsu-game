import { create } from 'zustand'
import type { Tool, ConnectionStatus } from '../types/pixelBoard.types'
import { pixelKey, flatArrayToSparseMap } from '../utils/boardMath'
import { computeMinScale } from '../utils/viewportMath'
import {
  DEFAULT_SCALE,
  COLOR_PALETTE,
  ERASER_COLOR,
  ABS_MIN_SCALE,
} from '../constants/pixelBoard.config'

/**
 * Mutable pixel data kept outside Zustand state to avoid copying a large Map
 * on every stroke. Components react to `pixelVersion` bumps instead.
 */
let _pixelData = new Map<string, string>()

export function getPixelData(): Map<string, string> {
  return _pixelData
}

interface PixelBoardState {
  boardWidth: number
  boardHeight: number
  boardLoaded: boolean
  pixelVersion: number
  zoneOwners: Record<number, string | null>

  viewportX: number
  viewportY: number
  scale: number
  minScale: number
  stageWidth: number
  stageHeight: number

  selectedColor: string
  tool: Tool
  showGrid: boolean
  showPalette: boolean

  connectionStatus: ConnectionStatus
  loading: boolean
  error: string | null
}

interface PixelBoardActions {
  setPixel: (x: number, y: number, color: string) => void
  erasePixel: (x: number, y: number) => void
  clearBoard: () => Array<{ x: number; y: number }>
  setViewport: (x: number, y: number, scale: number) => void
  setStageSize: (w: number, h: number) => void
  setSelectedColor: (color: string) => void
  setTool: (tool: Tool) => void
  toggleGrid: () => void
  setShowPalette: (show: boolean) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  loadBoard: (width: number, height: number, pixels: string[], zoneOwners?: Record<number, string | null>) => void
  applyRemotePixel: (x: number, y: number, color: string) => void
  setZoneOwners: (zoneOwners: Record<number, string | null>) => void
  resetBoard: (width: number, height: number, pixels: string[], zoneOwners: Record<number, string | null>) => void
}

export type PixelBoardStore = PixelBoardState & PixelBoardActions

export const usePixelBoardStore = create<PixelBoardStore>()((set, get) => ({
  boardWidth: 256,
  boardHeight: 256,
  boardLoaded: false,
  pixelVersion: 0,
  zoneOwners: {},

  viewportX: 0,
  viewportY: 0,
  scale: DEFAULT_SCALE,
  minScale: ABS_MIN_SCALE,
  stageWidth: 0,
  stageHeight: 0,

  selectedColor: COLOR_PALETTE[0],
  tool: 'draw',
  showGrid: true,
  showPalette: false,

  connectionStatus: 'disconnected',
  loading: true,
  error: null,

  setPixel: (x, y, color) => {
    const { boardWidth, boardHeight } = get()
    if (x < 0 || x >= boardWidth || y < 0 || y >= boardHeight) return
    const key = pixelKey(x, y)
    if (_pixelData.get(key) === color) return
    _pixelData.set(key, color)
    set((s) => ({ pixelVersion: s.pixelVersion + 1 }))
  },

  erasePixel: (x, y) => {
    const { boardWidth, boardHeight } = get()
    if (x < 0 || x >= boardWidth || y < 0 || y >= boardHeight) return
    const key = pixelKey(x, y)
    if (!_pixelData.has(key)) return
    _pixelData.delete(key)
    set((s) => ({ pixelVersion: s.pixelVersion + 1 }))
  },

  clearBoard: () => {
    const coords: Array<{ x: number; y: number }> = []
    _pixelData.forEach((_color, key) => {
      const sep = key.indexOf(':')
      coords.push({
        x: parseInt(key.substring(0, sep), 10),
        y: parseInt(key.substring(sep + 1), 10),
      })
    })
    _pixelData.clear()
    set((s) => ({ pixelVersion: s.pixelVersion + 1 }))
    return coords
  },

  setViewport: (x, y, scale) => set({ viewportX: x, viewportY: y, scale }),

  setStageSize: (w, h) => {
    const { boardWidth, boardHeight } = get()
    set({
      stageWidth: w,
      stageHeight: h,
      minScale: computeMinScale(w, h, boardWidth, boardHeight),
    })
  },

  setSelectedColor: (color) =>
    set({ selectedColor: color, tool: 'draw', showPalette: false }),

  setTool: (tool) => set({ tool, showPalette: false }),

  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),

  setShowPalette: (show) => set({ showPalette: show }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  loadBoard: (width, height, flatPixels, zoneOwners) => {
    _pixelData = flatArrayToSparseMap(flatPixels, width)
    const { stageWidth, stageHeight } = get()
    set((s) => ({
      boardWidth: width,
      boardHeight: height,
      boardLoaded: true,
      loading: false,
      error: null,
      pixelVersion: s.pixelVersion + 1,
      minScale: computeMinScale(stageWidth, stageHeight, width, height),
      zoneOwners: zoneOwners ?? s.zoneOwners,
    }))
  },

  applyRemotePixel: (x, y, color) => {
    const { boardWidth, boardHeight } = get()
    if (x < 0 || x >= boardWidth || y < 0 || y >= boardHeight) return
    const key = pixelKey(x, y)
    const isErase =
      !color || color === ERASER_COLOR || color === '#FFFFFF'
    if (isErase) {
      if (!_pixelData.has(key)) return
      _pixelData.delete(key)
    } else {
      if (_pixelData.get(key) === color) return
      _pixelData.set(key, color)
    }
    set((s) => ({ pixelVersion: s.pixelVersion + 1 }))
  },

  setZoneOwners: (zoneOwners) => set({ zoneOwners }),

  resetBoard: (width, height, flatPixels, zoneOwners) => {
    _pixelData = flatArrayToSparseMap(flatPixels, width)
    const { stageWidth, stageHeight } = get()
    set((s) => ({
      boardWidth: width,
      boardHeight: height,
      boardLoaded: true,
      loading: false,
      error: null,
      pixelVersion: s.pixelVersion + 1,
      minScale: computeMinScale(stageWidth, stageHeight, width, height),
      zoneOwners,
    }))
  },
}))
