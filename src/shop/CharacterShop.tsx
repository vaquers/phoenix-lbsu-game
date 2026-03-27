import { useEffect, useMemo, useState } from 'react'
import { CHARACTER_CATALOG } from '../game/characters/catalog'
import { useCharacterStore } from '../game/characters/characterStore'
import { useUserStore } from '../shared/userStore'
import bitcoinSign from '../../assets/symbols/bitcoinsign.svg'
import previewDefault from '../../assets/models_shop/robotechnic.png'
import previewGranny from '../../assets/models_shop/granny.png'
import previewBigman from '../../assets/models_shop/bigman.png'
import previewGreenwoman from '../../assets/models_shop/greenwoman.png'
import previewMouse from '../../assets/models_shop/mouse.png'
import previewMusculman from '../../assets/models_shop/musculman.png'

type AvailabilityMap = Record<string, boolean>

function TitleCase(input: string) {
  return input.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

const SHOP_PREVIEWS: Record<string, string> = {
  robototechnic: previewDefault,
  granny: previewGranny,
  bigman: previewBigman,
  greenwoman: previewGreenwoman,
  mouse: previewMouse,
  musculman: previewMusculman,
}

export function CharacterShop() {
  const { activeId, unlockedIds, unlock, setActive } = useCharacterStore()
  const userCoins = useUserStore((s) => s.user?.coins ?? 0)
  const spendCoins = useUserStore((s) => s.spendCoins)
  const [message, setMessage] = useState<string | null>(null)
  const [availability, setAvailability] = useState<AvailabilityMap>({})

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      const result: AvailabilityMap = {}
      await Promise.all(
        CHARACTER_CATALOG.map(async (c) => {
          const urls = [c.gameModelPath].filter(Boolean)
          if (!urls.length) {
            result[c.id] = false
            return
          }
          try {
            const responses = await Promise.all(
              urls.map(async (url) => {
                const res = await fetch(url, { method: 'HEAD' })
                if (res.ok) return true
                const fallback = await fetch(url, { method: 'GET' })
                return fallback.ok
              }),
            )
            result[c.id] = responses.every(Boolean)
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
      setMessage('Модель недоступна. Проверь assets/models.')
      return
    }
    if (userCoins < price) {
      setMessage('Недостаточно коинов')
      return
    }
    unlock(id)
    spendCoins(price)
    setMessage('Персонаж куплен!')
    setTimeout(() => setMessage(null), 2000)
  }

  const cards = useMemo(() => {
    return CHARACTER_CATALOG.map((c) => {
      const isUnlocked = unlockedIds.includes(c.id) || c.isDefault || c.isUnlockedByDefault
      const isSelected = activeId === c.id
      const available = availability[c.id] ?? true
      const displayName = c.name || TitleCase(c.id)
      const preview = SHOP_PREVIEWS[c.id] ?? previewDefault
      return { ...c, isUnlocked, isSelected, available, displayName, preview }
    })
  }, [activeId, availability, unlockedIds])

  const [currentIndex, setCurrentIndex] = useState(0)
  useEffect(() => {
    const idx = cards.findIndex((c) => c.id === activeId)
    if (idx >= 0) setCurrentIndex(idx)
  }, [activeId, cards])

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

      <div
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
        onScroll={(e) => {
          const el = e.currentTarget
          const cardWidth = el.clientWidth
          const idx = Math.round(el.scrollLeft / cardWidth)
          if (!Number.isNaN(idx)) setCurrentIndex(Math.min(cards.length - 1, Math.max(0, idx)))
        }}
      >
        {cards.map((c) => (
          <div
            key={c.id}
            className={[
              'snap-center min-w-[88%] max-w-[88%] rounded-[28px] p-5',
              'bg-white/20 backdrop-blur-md border border-white/30',
              c.isSelected ? 'ring-2 ring-[#EC432D]/70' : 'ring-1 ring-white/20',
            ].join(' ')}
          >
            <div className="h-[260px] rounded-[22px] overflow-hidden bg-white/10 border border-white/20">
              <img src={c.preview} alt={c.displayName} className="w-full h-full object-cover" />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <h4 className="text-black font-bold text-[16px]">{c.displayName}</h4>
              <span className="text-black/70 text-sm flex items-center gap-1">
                {c.price}
                <img src={bitcoinSign} className="w-3.5 h-3.5" />
              </span>
            </div>

            {c.isSelected ? (
              <button
                className="mt-3 w-full rounded-full bg-[#D9D9D9] text-black/70 text-sm font-semibold py-2 cursor-default"
                disabled
              >
                Выбран
              </button>
            ) : c.isUnlocked ? (
              <button
                className="mt-3 w-full rounded-full bg-white/80 text-black text-sm font-semibold py-2 hover:bg-white"
                onClick={() => setActive(c.id)}
                disabled={!c.available}
              >
                Выбрать
              </button>
            ) : (
              <button
                className="mt-3 w-full rounded-full bg-[#EC432D] text-white text-sm font-semibold py-2 hover:bg-[#d63b27]"
                onClick={() => onBuy(c.id, c.price, c.available)}
                disabled={!c.available}
              >
                Купить
              </button>
            )}

            {!c.available && (
              <div className="mt-2 text-[12px] text-black/60 text-center">
                Нет локального ассета
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        {cards.map((c, idx) => (
          <span
            key={c.id}
            className={[
              'w-2 h-2 rounded-full transition',
              idx === currentIndex ? 'bg-[#EC432D]' : 'bg-white/40',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}
