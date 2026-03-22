export interface SafeAreaInset {
  top: number
  bottom: number
  left: number
  right: number
}

export interface TelegramSafeAreaState {
  /** Device-level safe area (notch, home indicator, rounded corners) */
  safeArea: SafeAreaInset
  /** Telegram UI safe area (header bar, bottom area) */
  contentSafeArea: SafeAreaInset
  /** Combined insets: safeArea + contentSafeArea for layout use */
  combined: SafeAreaInset
  /** Whether safe area values have been resolved */
  isReady: boolean
  /** Where the values come from */
  source: 'telegram' | 'env-fallback' | 'default'
}

export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  safeAreaInset?: SafeAreaInset
  contentSafeAreaInset?: SafeAreaInset
  onEvent: (event: string, callback: () => void) => void
  offEvent: (event: string, callback: () => void) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}
