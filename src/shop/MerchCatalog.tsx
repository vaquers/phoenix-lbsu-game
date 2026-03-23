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
    <div>
      {message && (
        <div
          className={[
            'mb-4 px-4 py-2.5 rounded-xl text-sm font-medium text-center',
            message.type === 'success'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700',
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
              className="bg-white rounded-[28px] p-3.5 flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-full"
            >
              <div className="w-full aspect-square rounded-[20px] mb-3 flex items-center justify-center overflow-hidden bg-white">
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
              
              <h3 className="font-bold text-[15px] leading-tight text-black line-clamp-2">
                {item.title}
              </h3>
              
              <p className="text-[#8E8E93] text-[13px] mt-1.5 mb-3 leading-snug flex-1 line-clamp-2 font-medium">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-black font-semibold text-[16px] flex items-center gap-0.5">
                  {item.price} <span className="text-[13px] opacity-90">💰</span>
                </span>
                
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford || !item.available || isBuying}
                  className={[
                    'px-[14px] py-1.5 rounded-full text-[13px] font-semibold transition',
                    canAfford && item.available
                      ? 'bg-[#007AFF] text-white hover:bg-[#006CE0] active:scale-95'
                      : 'bg-[#E5E5EA] text-[#8E8E93] cursor-not-allowed',
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
