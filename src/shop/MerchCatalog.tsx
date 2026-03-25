import { useEffect, useState } from 'react'
import { api } from '../shared/api'
import { useUserStore } from '../shared/userStore'
import type { MerchItem } from '../shared/types'
import bitcoinSign from '../../assets/symbols/bitcoinsign.svg'

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
    return <p className="text-white/80 text-sm mt-4 text-center">Загрузка каталога...</p>
  }

  return (
    <div>
      {message && (
        <div
          className={[
            'mb-4 px-4 py-2.5 rounded-[22px] text-sm font-medium text-center border',
            message.type === 'success'
              ? 'bg-white/40 text-black border border-white/40'
              : 'bg-white/35 text-black border border-white/30',
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
              className="glass-panel-strong rounded-[var(--radius-card)] p-3.5 flex flex-col h-full"
            >
              <div className="w-full aspect-square rounded-[24px] mb-3 flex items-center justify-center overflow-hidden bg-white/80">
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
              
              <p className="text-[rgba(0,0,0,0.7)] text-[13px] mt-1.5 mb-3 leading-snug flex-1 line-clamp-2 font-medium">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-black font-semibold text-[16px] flex items-center gap-1">
                  {item.price}
                  <img src={bitcoinSign} alt="btc" className="w-4 h-4" />
                </span>
                
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford || !item.available || isBuying}
                  className={[
                    'px-[14px] py-1.5 rounded-full text-[13px] font-semibold transition',
                    canAfford && item.available
                      ? 'bg-[color:var(--accent)] text-white active:scale-95'
                      : 'bg-[color:var(--secondary-btn)] text-white/70 cursor-not-allowed',
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
