import { useState } from 'react'
import { MerchCatalog } from './MerchCatalog'
import { PhotoSubmission } from './PhotoSubmission'

type ShopTab = 'merch' | 'photo'

export function ShopPage() {
  const [tab, setTab] = useState<ShopTab>('merch')

  return (
    <div className="w-full h-full flex flex-col bg-[#F0F0F2] text-black overflow-hidden font-sans">
      {/* 
        Mockup of the Native Telegram / iOS Header
        Added to structurally match the "pixel-perfect" request exactly.
      */}
      <div className="pt-10 px-4 pb-1 flex justify-between items-center transition-all">
        <button className="flex items-center gap-1.5 bg-[#999999]/90 text-white px-3 py-1.5 rounded-full text-[15px] font-medium tracking-wide">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Close
        </button>
        <button className="flex items-center gap-1.5 bg-[#999999]/90 text-white px-3 py-1 rounded-full">
          <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
          </svg>
          <span className="text-[20px] leading-none mb-1 opacity-90 tracking-widest">•••</span>
        </button>
      </div>

      {/* Segmented Control */}
      <div className="px-4 py-3">
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
