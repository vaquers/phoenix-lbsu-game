import { io, Socket } from 'socket.io-client'
import { BACKEND_URL } from './config'
import type { PixelUpdate } from '../shared/types'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

export type PixelUpdateHandler = (update: PixelUpdate) => void
export type ZoneUpdateHandler = (zoneOwners: Record<number, string | null>) => void
export type BoardResetHandler = (state: { width: number; height: number; pixels: string[]; zoneOwners: Record<number, string | null> }) => void

let socket: Socket | null = null
let listeners: Set<PixelUpdateHandler> = new Set()
let zoneListeners: Set<ZoneUpdateHandler> = new Set()
let resetListeners: Set<BoardResetHandler> = new Set()
let status: ConnectionStatus = 'disconnected'
let statusListeners: Set<(status: ConnectionStatus) => void> = new Set()

function notifyStatus(newStatus: ConnectionStatus) {
  status = newStatus
  statusListeners.forEach((cb) => cb(status))
}

export function getConnectionStatus() {
  return status
}

export function subscribeStatus(cb: (status: ConnectionStatus) => void) {
  statusListeners.add(cb)
  cb(status)
  return () => {
    statusListeners.delete(cb)
  }
}

export function connectSocket() {
  if (socket) return socket

  notifyStatus('connecting')
  socket = io(BACKEND_URL, {
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    notifyStatus('connected')
  })

  socket.on('disconnect', () => {
    notifyStatus('disconnected')
  })

  socket.on('pixel:update', (update: PixelUpdate) => {
    listeners.forEach((cb) => cb(update))
  })

  socket.on('zone:update', (payload: { zoneOwners: Record<number, string | null> }) => {
    zoneListeners.forEach((cb) => cb(payload.zoneOwners))
  })

  socket.on('board:reset', (state: { width: number; height: number; pixels: string[]; zoneOwners: Record<number, string | null> }) => {
    resetListeners.forEach((cb) => cb(state))
  })

  socket.io.on('reconnect_attempt', () => {
    notifyStatus('connecting')
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
    notifyStatus('disconnected')
  }
}

export function subscribePixelUpdates(handler: PixelUpdateHandler) {
  listeners.add(handler)
  connectSocket()

  return () => {
    listeners.delete(handler)
  }
}

export function subscribeZoneUpdates(handler: ZoneUpdateHandler) {
  zoneListeners.add(handler)
  connectSocket()
  return () => {
    zoneListeners.delete(handler)
  }
}

export function subscribeBoardReset(handler: BoardResetHandler) {
  resetListeners.add(handler)
  connectSocket()
  return () => {
    resetListeners.delete(handler)
  }
}

export function emitPixelUpdate(update: PixelUpdate) {
  connectSocket()
  socket?.emit('pixel:set', update)
}
