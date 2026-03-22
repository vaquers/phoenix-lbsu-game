import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { SafeAreaInset, TelegramSafeAreaState } from './types'

const ZERO: SafeAreaInset = { top: 0, bottom: 0, left: 0, right: 0 }

const DEFAULT_STATE: TelegramSafeAreaState = {
  safeArea: ZERO,
  contentSafeArea: ZERO,
  combined: ZERO,
  isReady: false,
  source: 'default',
}

const SafeAreaCtx = createContext<TelegramSafeAreaState>(DEFAULT_STATE)

/**
 * Access the current Telegram safe area insets.
 * Returns combined values (device + Telegram UI), raw values, and readiness state.
 * CSS custom properties (--safe-top, --safe-bottom, etc.) are always kept in sync.
 */
export function useTelegramSafeArea() {
  return useContext(SafeAreaCtx)
}

function combine(sa: SafeAreaInset, csa: SafeAreaInset): SafeAreaInset {
  return {
    top: sa.top + csa.top,
    bottom: sa.bottom + csa.bottom,
    left: Math.max(sa.left, csa.left),
    right: Math.max(sa.right, csa.right),
  }
}

function applyCssVars(sa: SafeAreaInset, csa: SafeAreaInset, merged: SafeAreaInset) {
  const r = document.documentElement.style

  r.setProperty('--tg-safe-top', `${sa.top}px`)
  r.setProperty('--tg-safe-bottom', `${sa.bottom}px`)
  r.setProperty('--tg-safe-left', `${sa.left}px`)
  r.setProperty('--tg-safe-right', `${sa.right}px`)

  r.setProperty('--tg-content-safe-top', `${csa.top}px`)
  r.setProperty('--tg-content-safe-bottom', `${csa.bottom}px`)
  r.setProperty('--tg-content-safe-left', `${csa.left}px`)
  r.setProperty('--tg-content-safe-right', `${csa.right}px`)

  r.setProperty('--safe-top', `${merged.top}px`)
  r.setProperty('--safe-bottom', `${merged.bottom}px`)
  r.setProperty('--safe-left', `${merged.left}px`)
  r.setProperty('--safe-right', `${merged.right}px`)
}

function applyEnvFallback() {
  const r = document.documentElement.style

  r.setProperty('--tg-safe-top', 'env(safe-area-inset-top, 0px)')
  r.setProperty('--tg-safe-bottom', 'env(safe-area-inset-bottom, 0px)')
  r.setProperty('--tg-safe-left', 'env(safe-area-inset-left, 0px)')
  r.setProperty('--tg-safe-right', 'env(safe-area-inset-right, 0px)')

  r.setProperty('--tg-content-safe-top', '0px')
  r.setProperty('--tg-content-safe-bottom', '0px')
  r.setProperty('--tg-content-safe-left', '0px')
  r.setProperty('--tg-content-safe-right', '0px')

  r.setProperty('--safe-top', 'env(safe-area-inset-top, 0px)')
  r.setProperty('--safe-bottom', 'env(safe-area-inset-bottom, 0px)')
  r.setProperty('--safe-left', 'env(safe-area-inset-left, 0px)')
  r.setProperty('--safe-right', 'env(safe-area-inset-right, 0px)')
}

export function TelegramSafeAreaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TelegramSafeAreaState>(DEFAULT_STATE)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const tg = window.Telegram?.WebApp

    if (tg) {
      tg.ready()
      tg.expand()

      const sync = () => {
        const sa: SafeAreaInset = tg.safeAreaInset ?? ZERO
        const csa: SafeAreaInset = tg.contentSafeAreaInset ?? ZERO
        const merged = combine(sa, csa)

        applyCssVars(sa, csa, merged)
        setState({
          safeArea: { ...sa },
          contentSafeArea: { ...csa },
          combined: merged,
          isReady: true,
          source: 'telegram',
        })
      }

      sync()
      tg.onEvent('safeAreaChanged', sync)
      tg.onEvent('contentSafeAreaChanged', sync)

      cleanupRef.current = () => {
        tg.offEvent('safeAreaChanged', sync)
        tg.offEvent('contentSafeAreaChanged', sync)
      }
    } else {
      applyEnvFallback()
      setState({
        safeArea: ZERO,
        contentSafeArea: ZERO,
        combined: ZERO,
        isReady: true,
        source: 'env-fallback',
      })
    }

    return () => cleanupRef.current?.()
  }, [])

  return (
    <SafeAreaCtx.Provider value={state}>
      {children}
    </SafeAreaCtx.Provider>
  )
}
