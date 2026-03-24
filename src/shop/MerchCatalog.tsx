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
    return <p className="text-[color:var(--text-muted)] text-sm mt-4 text-center">Загрузка каталога...</p>
  }

  return (
    <div>
      {message && (
        <div
          className={[
            'mb-4 px-4 py-2.5 rounded-xl text-sm font-medium text-center',
            message.type === 'success'
              ? 'bg-[rgba(255,138,61,0.12)] text-[color:var(--accent-orange)] border border-[rgba(255,138,61,0.25)]'
              : 'bg-[rgba(255,107,107,0.12)] text-[color:var(--accent-red)] border border-[rgba(255,107,107,0.25)]',
          ].join(' ')}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-[14px] pb-6">
        {items.map((item) => {
          const canAfford = (user?.coins ?? 0) >= item.price
          const isBuying = purchasing === item.id
          
          return (
            <div
              key={item.id}
              className="bg-[color:var(--surface-2)] rounded-[28px] p-3.5 flex flex-col border border-[color:var(--border)] shadow-[0_8px_24px_rgba(0,0,0,0.35)] h-full"
            >
              <div className="w-full aspect-square rounded-[20px] mb-3 flex items-center justify-center overflow-hidden bg-[color:var(--surface-3)] border border-[color:var(--border)]">
                {/* Dynamically fallback to procedural initials if image is missing */}
                <img 
                  src="/merch/stickers.png" 
                  alt={item.title}
                  className="w-full h-full object-contain transform hover:scale-105 transition duration-300"
                  onError={(e) => { 
                    e.currentTarget.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${item.id}&backgroundColor=ffffff` 
                  }} 
                />
              </div>
              
              <h3 className="font-bold text-[15px] leading-tight text-[color:var(--text-primary)] line-clamp-2">
                {item.title}
              </h3>
              
              <p className="text-[color:var(--text-muted)] text-[13px] mt-1.5 mb-3 leading-snug flex-1 line-clamp-2 font-medium">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[color:var(--text-primary)] font-semibold text-[16px] flex items-center gap-0.5">
                  {item.price} <span className="text-[13px] opacity-90">💰</span>
                </span>
                
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford || !item.available || isBuying}
                  className={[
                    'px-[14px] py-1.5 rounded-full text-[13px] font-semibold transition',
                    canAfford && item.available
                      ? 'bg-[color:var(--accent-blue)] text-white hover:brightness-110 active:scale-95 shadow-[0_0_16px_rgba(59,130,246,0.35)]'
                      : 'bg-[color:var(--surface-3)] text-[color:var(--text-muted)] cursor-not-allowed border border-[color:var(--border)]',
                  ].join(' ')}
                >
                  {isBuying ? '...' : 'Купить'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
