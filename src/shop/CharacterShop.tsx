import { useEffect, useMemo, useState } from 'react'
import { CHARACTER_CATALOG } from '../game/characters/catalog'
import { useCharacterStore } from '../game/characters/characterStore'
import { useUserStore } from '../shared/userStore'
import bitcoinSign from '../../assets/symbols/bitcoinsign.svg'

export function CharacterShop() {
  const { activeId, unlockedIds, unlock, setActive } = useCharacterStore()
  const userCoins = useUserStore((s) => s.user?.coins ?? 0)
  const spendCoins = useUserStore((s) => s.spendCoins)
  const [message, setMessage] = useState<string | null>(null)

  const [availability, setAvailability] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      const result: Record<string, boolean> = {}
      await Promise.all(
        CHARACTER_CATALOG.map(async (c) => {
          if (!c.modelPath) {
            result[c.id] = false
            return
          }
          try {
            const res = await fetch(c.modelPath, { method: 'HEAD' })
            result[c.id] = res.ok
          } catch {
            result[c.id] = false
          }
        }),
      )
      if (!cancelled) setAvailability(result)
    }
    check()
    return () => {
      cancelled = true
    }
  }, [])

  const onBuy = (id: string, price: number, available: boolean) => {
    if (!available) {
      setMessage('Нужен локальный файл модели')
      return
    }
    if (userCoins < price) {
      setMessage('Недостаточно коинов')
      return
    }
    unlock(id)
    spendCoins(price)
    setMessage('Персонаж куплен!')
    setTimeout(() => setMessage(null), 2500)
  }

  return (
    <div className="space-y-4">
      <div className="glass-panel-strong rounded-[24px] px-5 py-4 flex items-center justify-between">
        <span className="text-black font-semibold">Баланс</span>
        <span className="flex items-center gap-1 font-bold text-black">
          {Math.floor(userCoins)}
          <img src={bitcoinSign} className="w-4 h-4" />
        </span>
      </div>

      {message && (
        <div className="glass-panel rounded-[20px] px-4 py-2 text-center text-black text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {CHARACTER_CATALOG.map((c) => {
          const isUnlocked = unlockedIds.includes(c.id) || c.isDefault || c.isUnlockedByDefault
          const isSelected = activeId === c.id
          const available = availability[c.id] ?? true
          const disabled = !available

          return (
            <div key={c.id} className="glass-panel-strong rounded-[24px] p-4 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl bg-white/40 border border-white/40 flex items-center justify-center text-black font-bold">
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-black font-bold text-[16px]">{c.name}</h4>
                  {c.isDefault && <span className="text-[12px] text-black/60">Default</span>}
                </div>
                <div className="text-black/70 text-sm mt-1">
                  Цена: {c.price} <img src={bitcoinSign} className="inline w-3.5 h-3.5 ml-1" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {isSelected ? (
                  <button className="px-4 py-2 rounded-full bg-[#EC432D] text-white text-sm font-semibold">
                    Выбран
                  </button>
                ) : isUnlocked ? (
                  <button
                    className="px-4 py-2 rounded-full bg-white/70 text-black text-sm font-semibold"
                    onClick={() => setActive(c.id)}
                    disabled={disabled}
                  >
                    Выбрать
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 rounded-full bg-[#EC432D] text-white text-sm font-semibold"
                    onClick={() => onBuy(c.id, c.price, !disabled)}
                    disabled={disabled}
                  >
                    Купить
                  </button>
                )}
                {disabled && (
                  <span className="text-[11px] text-black/50 text-center">Нет ассета</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
