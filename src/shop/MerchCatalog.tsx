import { useEffect, useState } from 'react'
import { api } from '../shared/api'
import { useUserStore } from '../shared/userStore'
import type { MerchItem } from '../shared/types'

export function MerchCatalog() {
  const [items, setItems] = useState<MerchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const user = useUserStore((s) => s.user)
  const spendCoins = useUserStore((s) => s.spendCoins)

  useEffect(() => {
    api
      .getMerch()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handlePurchase = async (item: MerchItem) => {
    if (!user) return
    if (user.coins < item.price) {
      setMessage({ text: `Не хватает коинов! Нужно ${item.price}, у вас ${Math.floor(user.coins)}`, type: 'error' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setPurchasing(item.id)
    try {
      await api.purchaseMerch(user.id, item.id)
      spendCoins(item.price)
      setMessage({ text: `${item.title} — покупка оформлена!`, type: 'success' })
    } catch (e: any) {
      setMessage({ text: e.message || 'Ошибка покупки', type: 'error' })
    } finally {
      setPurchasing(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  if (loading) {
    return <p className="text-slate-400 text-sm mt-4 text-center">Загрузка каталога...</p>
  }

  return (
    <div className="mt-3">
      {message && (
        <div
          className={[
            'mb-3 px-4 py-2 rounded-lg text-sm font-medium text-center',
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30',
          ].join(' ')}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const canAfford = (user?.coins ?? 0) >= item.price
          const isBuying = purchasing === item.id
          return (
            <div
              key={item.id}
              className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col"
            >
              <div className="aspect-square bg-white/5 rounded-lg mb-2 flex items-center justify-center text-4xl">
                {item.id === 'merch-1' && '🎨'}
                {item.id === 'merch-2' && '📌'}
                {item.id === 'merch-3' && '💎'}
                {item.id === 'merch-4' && '🧢'}
                {item.id === 'merch-5' && '👜'}
                {item.id === 'merch-6' && '👕'}
              </div>
              <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
              <p className="text-white/40 text-xs mt-1 flex-1">{item.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-amber-400 font-bold text-sm">{item.price} 🪙</span>
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford || !item.available || isBuying}
                  className={[
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition',
                    canAfford && item.available
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-95'
                      : 'bg-white/10 text-white/30 cursor-not-allowed',
                  ].join(' ')}
                >
                  {isBuying ? '...' : !item.available ? 'Нет' : !canAfford ? 'Мало 🪙' : 'Купить'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
