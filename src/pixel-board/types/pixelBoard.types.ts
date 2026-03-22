export type Tool = 'draw' | 'erase' | 'move'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

export interface ViewportState {
  x: number
  y: number
  scale: number
}

export interface VisibleRange {
  startCol: number
  startRow: number
  endCol: number
  endRow: number
}

export type PixelMap = Map<string, string>
