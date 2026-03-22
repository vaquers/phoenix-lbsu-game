export type InputAction = 'left' | 'right' | 'jump' | 'slide' | 'restart' | 'pause'

type Listener = (action: InputAction) => void

const listeners = new Set<Listener>()

function notify(action: InputAction) {
  listeners.forEach((fn) => fn(action))
}

/** Вызвать действие извне (например, из свайпов). */
export function emitAction(action: InputAction) {
  notify(action)
}

export function subscribeInput(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.repeat) return
  switch (e.key.toLowerCase()) {
    case 'a':
    case 'arrowleft':
      e.preventDefault()
      notify('left')
      break
    case 'd':
    case 'arrowright':
      e.preventDefault()
      notify('right')
      break
    case 'w':
    case 'arrowup':
    case ' ':
      e.preventDefault()
      notify('jump')
      break
    case 's':
    case 'arrowdown':
      e.preventDefault()
      notify('slide')
      break
    case 'enter':
      e.preventDefault()
      notify('restart')
      break
    case 'escape':
      e.preventDefault()
      notify('pause')
      break
  }
}

let installed = false
export function installKeyboardInput() {
  if (installed) return
  installed = true
  window.addEventListener('keydown', onKeyDown)
}

export function uninstallKeyboardInput() {
  if (!installed) return
  installed = false
  window.removeEventListener('keydown', onKeyDown)
}
