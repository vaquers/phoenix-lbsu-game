import { useState } from 'react'
import { MerchCatalog } from './MerchCatalog'
import { PhotoSubmission } from './PhotoSubmission'

type ShopTab = 'merch' | 'photo'

export function ShopPage() {
  const [tab, setTab] = useState<ShopTab>('merch')

  return (
    <div 
      className="w-full h-full flex flex-col bg-[color:var(--bg)] text-[color:var(--text-primary)] overflow-hidden font-sans"
      style={{ paddingTop: 'max(var(--safe-top), 16px)' }}
    >
      {/* Segmented Control */}
      <div className="px-4 pb-3 pt-2">
        <div className="flex bg-[color:var(--surface-2)] rounded-[24px] p-1 gap-1 border border-[color:var(--border)]">
          <button
            onClick={() => setTab('merch')}
            className={[
              'flex-1 py-2 rounded-[20px] text-[15px] font-semibold transition',
              tab === 'merch'
                ? 'bg-[color:var(--surface-3)] text-[color:var(--text-primary)] shadow-[0_2px_10px_rgba(0,0,0,0.35)] ring-1 ring-white/10'
                : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)]'
            ].join(' ')}
          >
            Мерч
          </button>
          <button
            onClick={() => setTab('photo')}
            className={[
              'flex-1 py-2 rounded-[20px] text-[15px] font-semibold transition',
              tab === 'photo'
                ? 'bg-[color:var(--surface-3)] text-[color:var(--text-primary)] shadow-[0_2px_10px_rgba(0,0,0,0.35)] ring-1 ring-white/10'
                : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)]'
            ].join(' ')}
          >
            Фото на ТВ
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-10">
        {tab === 'merch' ? <MerchCatalog /> : <PhotoSubmission />}
      </div>
    </div>
  )
}
