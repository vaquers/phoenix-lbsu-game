import { useState } from 'react'
import { MerchCatalog } from './MerchCatalog'
import { PhotoSubmission } from './PhotoSubmission'
import xmarkIcon from '../../assets/symbols/xmark.svg'

type ShopTab = 'merch' | 'photo'

export function ShopPage() {
  const [tab, setTab] = useState<ShopTab>('merch')

  return (
    <div 
      className="w-full h-full flex flex-col overflow-hidden font-sans"
      style={{ paddingTop: 'max(var(--safe-top), 16px)' }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-2">
        <button className="top-capsule flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-semibold">
          <img src={xmarkIcon} alt="" className="w-4 h-4" />
          Close
        </button>
        <div className="top-capsule flex items-center gap-3 px-4 py-2 rounded-full">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 12l4 4 8-8" />
          </svg>
          <span className="text-white/80 text-lg">• • •</span>
        </div>
      </div>

      {/* Segmented Control */}
      <div className="px-5 pb-3 pt-4">
        <div className="glass-panel rounded-full p-1 gap-1 flex">
          <button
            onClick={() => setTab('merch')}
            className={[
              'flex-1 py-2 rounded-full text-[16px] font-semibold transition',
              tab === 'merch'
                ? 'bg-white text-black shadow-[0_6px_16px_rgba(0,0,0,0.15)]'
                : 'text-white/80'
            ].join(' ')}
          >
            Мерч
          </button>
          <button
            onClick={() => setTab('photo')}
            className={[
              'flex-1 py-2 rounded-full text-[16px] font-semibold transition',
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
        {tab === 'merch' ? <MerchCatalog /> : <PhotoSubmission />}
      </div>
    </div>
  )
}
