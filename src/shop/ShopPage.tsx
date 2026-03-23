import { useState } from 'react'
import { MerchCatalog } from './MerchCatalog'
import { PhotoSubmission } from './PhotoSubmission'

type ShopTab = 'merch' | 'photo'

export function ShopPage() {
  const [tab, setTab] = useState<ShopTab>('merch')

  return (
    <div 
      className="w-full h-full flex flex-col bg-[#F0F0F2] text-black overflow-hidden font-sans"
      style={{ paddingTop: 'max(var(--safe-top), 16px)' }}
    >
      {/* Segmented Control */}
      <div className="px-4 pb-3 pt-2">
        <div className="flex bg-[#E3E3E8] rounded-[24px] p-1 gap-1">
          <button
            onClick={() => setTab('merch')}
            className={[
              'flex-1 py-2 rounded-[20px] text-[15px] font-semibold transition',
              tab === 'merch'
                ? 'bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#8E8E93] hover:text-[#6c6c70]'
            ].join(' ')}
          >
            Мерч
          </button>
          <button
            onClick={() => setTab('photo')}
            className={[
              'flex-1 py-2 rounded-[20px] text-[15px] font-semibold transition',
              tab === 'photo'
                ? 'bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#8E8E93] hover:text-[#6c6c70]'
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
