import { useState } from 'react'
import { useUserStore } from '../shared/userStore'
import { MerchCatalog } from './MerchCatalog'
import { PhotoSubmission } from './PhotoSubmission'

type ShopTab = 'merch' | 'photo'

export function ShopPage() {
  const [tab, setTab] = useState<ShopTab>('merch')
  const user = useUserStore((s) => s.user)

  return (
    <div className="w-full h-full flex flex-col text-white overflow-hidden bg-brand">
      <div
        style={{
          padding:
            'calc(var(--safe-top) + 16px) calc(var(--safe-right) + 16px) 8px calc(var(--safe-left) + 16px)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">Магазин</h1>
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1.5">
            <span className="text-amber-400 font-bold text-sm">
              {Math.floor(user?.coins ?? 0)} 🪙
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('merch')}
            className={[
              'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition',
              tab === 'merch'
                ? 'bg-white/15 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10',
            ].join(' ')}
          >
            Мерч
          </button>
          <button
            onClick={() => setTab('photo')}
            className={[
              'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition',
              tab === 'photo'
                ? 'bg-white/15 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10',
            ].join(' ')}
          >
            Фото на ТВ
          </button>
        </div>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{
          padding:
            '0 calc(var(--safe-right) + 16px) var(--tabbar-height) calc(var(--safe-left) + 16px)',
        }}
      >
        {tab === 'merch' ? <MerchCatalog /> : <PhotoSubmission />}
      </div>
    </div>
  )
}
