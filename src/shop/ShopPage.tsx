import { useState } from 'react'
import { MerchCatalog } from './MerchCatalog'
import { PhotoSubmission } from './PhotoSubmission'
import { CharacterShop } from './CharacterShop'

type ShopTab = 'merch' | 'photo' | 'characters'

export function ShopPage() {
  const [tab, setTab] = useState<ShopTab>('merch')

  return (
    <div 
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ fontFamily: 'Unbounded, system-ui, -apple-system, sans-serif', paddingTop: 'max(var(--safe-top), 16px)' }}
    >
      {/* Segmented Control */}
      <div className="px-5 pb-3 pt-4">
        <div className="glass-panel rounded-full p-1 gap-1 flex">
          <button
            onClick={() => setTab('merch')}
            className={[
              'flex-1 py-2 rounded-full text-[14px] font-semibold transition',
              tab === 'merch'
                ? 'bg-white text-black shadow-[0_6px_16px_rgba(0,0,0,0.15)]'
                : 'text-white/80'
            ].join(' ')}
          >
            Мерч
          </button>
          <button
            onClick={() => setTab('characters')}
            className={[
              'flex-1 py-2 rounded-full text-[14px] font-semibold transition',
              tab === 'characters'
                ? 'bg-white text-black shadow-[0_6px_16px_rgba(0,0,0,0.15)]'
                : 'text-white/80'
            ].join(' ')}
          >
            Персонажи
          </button>
          <button
            onClick={() => setTab('photo')}
            className={[
              'flex-1 py-2 rounded-full text-[14px] font-semibold transition',
              tab === 'photo'
                ? 'bg-white text-black shadow-[0_6px_16px_rgba(0,0,0,0.15)]'
                : 'text-white/80'
            ].join(' ')}
          >
            Фото на ТВ
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-10">
        {tab === 'merch' ? (
          <MerchCatalog />
        ) : tab === 'characters' ? (
          <CharacterShop />
        ) : (
          <PhotoSubmission />
        )}
      </div>
    </div>
  )
}
