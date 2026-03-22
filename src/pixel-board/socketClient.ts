import { io, Socket } from 'socket.io-client'
import { BACKEND_URL } from './config'
import type { PixelUpdate } from '../shared/types'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

export type PixelUpdateHandler = (update: PixelUpdate) => void

let socket: Socket | null = null
let listeners: Set<PixelUpdateHandler> = new Set()
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

export function emitPixelUpdate(update: PixelUpdate) {
  connectSocket()
  socket?.emit('pixel:set', update)
}
