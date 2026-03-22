import { create } from 'zustand'
import { api } from './api'
import { USER_ID_KEY, USER_NAME_KEY } from './config'
import type { User } from './types'

interface UserStore {
  user: User | null
  loading: boolean
  error: string | null

  init: () => Promise<void>
  setName: (name: string) => Promise<void>
  recordGame: (score: number, coinsEarned: number) => Promise<void>
  spendCoins: (amount: number) => void
  refreshUser: () => Promise<void>
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  init: async () => {
    set({ loading: true, error: null })
    try {
      const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
      const tgAvatar = tgUser?.photo_url
      const tgName = tgUser?.first_name || `Player_${Date.now().toString(36)}`

      const storedId = localStorage.getItem(USER_ID_KEY)
      if (storedId) {
        try {
          const user = await api.getUser(storedId)
          if (tgAvatar && user.avatarUrl !== tgAvatar) {
            const updated = await api.updateUserAvatar(user.id, tgAvatar)
            set({ user: updated, loading: false })
            return
          }
          set({ user, loading: false })
          return
        } catch {
          localStorage.removeItem(USER_ID_KEY)
        }
      }
      const storedName = localStorage.getItem(USER_NAME_KEY) || tgName
      const user = await api.createUser(storedName, tgAvatar)
      localStorage.setItem(USER_ID_KEY, user.id)
      localStorage.setItem(USER_NAME_KEY, user.name)
      set({ user, loading: false })
    } catch (e: any) {
      set({ error: e.message || 'Failed to init user', loading: false })
    }
  },

  setName: async (name: string) => {
    const { user } = get()
    if (!user) return
    try {
      const updated = await api.updateUserName(user.id, name)
      localStorage.setItem(USER_NAME_KEY, updated.name)
      set({ user: updated })
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  recordGame: async (score: number, coinsEarned: number) => {
    const { user } = get()
    if (!user) return
    try {
      const updated = await api.recordGameResult(user.id, score, coinsEarned)
      set({ user: updated })
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  spendCoins: (amount: number) => {
    const { user } = get()
    if (!user) return
    set({ user: { ...user, coins: user.coins - amount } })
  },

  refreshUser: async () => {
    const { user } = get()
    if (!user) return
    try {
      const updated = await api.getUser(user.id)
      set({ user: updated })
    } catch {}
  },
}))
