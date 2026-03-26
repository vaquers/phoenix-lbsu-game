import { create } from 'zustand'
import { CHARACTER_CATALOG, DEFAULT_CHARACTER_ID } from './catalog'

const CHARACTER_UNLOCKS_KEY = 'phoenix-character-unlocks'
const CHARACTER_ACTIVE_KEY = 'phoenix-character-active'

function loadUnlocked(): string[] {
  try {
    const raw = localStorage.getItem(CHARACTER_UNLOCKS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return [DEFAULT_CHARACTER_ID]
}

function loadActive(): string {
  try {
    const raw = localStorage.getItem(CHARACTER_ACTIVE_KEY)
    if (raw) return raw
  } catch {}
  return DEFAULT_CHARACTER_ID
}

function persistUnlocked(ids: string[]) {
  try {
    localStorage.setItem(CHARACTER_UNLOCKS_KEY, JSON.stringify(ids))
  } catch {}
}

function persistActive(id: string) {
  try {
    localStorage.setItem(CHARACTER_ACTIVE_KEY, id)
  } catch {}
}

export type CharacterStore = {
  unlockedIds: string[]
  activeId: string
  unlock: (id: string) => void
  setActive: (id: string) => void
  isUnlocked: (id: string) => boolean
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  unlockedIds: (() => {
    const ids = loadUnlocked()
    const defaults = CHARACTER_CATALOG.filter((c) => c.isUnlockedByDefault).map((c) => c.id)
    const merged = Array.from(new Set([...defaults, ...ids, DEFAULT_CHARACTER_ID]))
    persistUnlocked(merged)
    return merged
  })(),
  activeId: (() => {
    const active = loadActive()
    const unlocked = loadUnlocked()
    return unlocked.includes(active) ? active : DEFAULT_CHARACTER_ID
  })(),
  unlock: (id) =>
    set((s) => {
      if (s.unlockedIds.includes(id)) return s
      const next = [...s.unlockedIds, id]
      persistUnlocked(next)
      return { unlockedIds: next }
    }),
  setActive: (id) =>
    set((s) => {
      const exists = CHARACTER_CATALOG.some((c) => c.id === id)
      if (!exists) return s
      if (!s.unlockedIds.includes(id)) return s
      persistActive(id)
      return { activeId: id }
    }),
  isUnlocked: (id) => get().unlockedIds.includes(id),
}))
