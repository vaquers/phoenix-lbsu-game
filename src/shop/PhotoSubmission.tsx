import { useState, useRef, useCallback } from 'react'
import { api } from '../shared/api'
import { useUserStore } from '../shared/userStore'
import { DISPLAY_SUBMISSION_COST } from '../shared/config'

import xmarkIcon from '../../assets/symbols/xmark.svg'
import bitcoinSign from '../../assets/symbols/bitcoinsign.svg'

export function PhotoSubmission() {
  const [step, setStep] = useState<'upload' | 'customize'>('upload')
  const [image, setImage] = useState<string | null>(null)
  
  // Customization state
  const [text, setText] = useState('ОСЕННИЙ ВАЙБ')
  const [fontIndex, setFontIndex] = useState(0)
  const [isUppercase, setIsUppercase] = useState(true)
  const [color, setColor] = useState('#FFFFFF')
  const [fontSize, setFontSize] = useState(36)
  
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)
  const user = useUserStore((s) => s.user)
  const spendCoins = useUserStore((s) => s.spendCoins)

  const canAfford = (user?.coins ?? 0) >= DISPLAY_SUBMISSION_COST

  // Dummy fonts for the demo
  const fonts = [
    'font-sans font-black',
    'font-sans font-normal',
    'font-serif font-bold',
    'font-serif font-normal',
    'font-mono font-bold',
    'font-mono font-normal',
    'italic font-bold',
    'italic font-normal'
  ]

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Выберите изображение', type: 'error' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Файл слишком большой (макс 5MB)', type: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result as string)
      setStep('customize')
      setMessage(null)
    }
    reader.onerror = () => {
      setMessage({ text: 'Ошибка чтения', type: 'error' })
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSubmit = async () => {
    if (!user || !image) return
    if (!canAfford) {
      setMessage({
        text: `Не хватает коинов! Нужно ${DISPLAY_SUBMISSION_COST}, у вас ${Math.floor(user.coins)}`,
        type: 'error',
      })
      return
    }

    setSubmitting(true)
    try {
      await api.submitDisplayPhoto(user.id, image, text)
      spendCoins(DISPLAY_SUBMISSION_COST)
      setImage(null)
      setStep('upload')
      if (fileRef.current) fileRef.current.value = ''
      setMessage({ text: 'Фото отправлено на TV!', type: 'success' })
    } catch (e: any) {
      setMessage({ text: e.message || 'Ошибка отправки', type: 'error' })
    } finally {
      setSubmitting(false)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  const handleReset = () => {
    setImage(null)
    setText('YOUR TEXT')
    setStep('upload')
    if (fileRef.current) fileRef.current.value = ''
  }

  if (step === 'upload') {
    return (
      <div className="flex flex-col h-full space-y-4">
        <div className="glass-panel-strong rounded-[var(--radius-card)] p-5 mt-2">
          <h3 className="font-bold text-[20px] text-black mb-2">Разместить фото на ТВ</h3>
          <p className="text-[rgba(0,0,0,0.6)] text-[16px] mb-4 leading-snug">
            Загрузите фото и добавьте текст — оно появится на большом экране на 60 секунд!
          </p>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-black flex items-center gap-1">
              Стоимость:
            </span>
            <span className="font-bold text-[18px] text-black flex items-center gap-1">
              {DISPLAY_SUBMISSION_COST}
              <img src={bitcoinSign} alt="btc" className="w-5 h-5" />
            </span>
          </div>
        </div>

        {message && (
          <div
            className={[
              'px-4 py-2.5 rounded-xl text-sm font-medium text-center border',
              message.type === 'success'
                ? 'bg-[rgba(79,175,124,0.12)] text-[color:var(--success)] border-[rgba(79,175,124,0.25)]'
                : 'bg-[rgba(217,106,106,0.12)] text-[color:var(--error)] border-[rgba(217,106,106,0.25)]',
            ].join(' ')}
          >
            {message.text}
          </div>
        )}

        <div className="flex-1 min-h-0 glass-panel-strong rounded-[var(--radius-card)] flex items-center justify-center p-6 relative overflow-hidden">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center pointer-events-none">
            <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-4 text-black/60 border border-white/40">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <span className="text-[20px] font-bold text-black mb-2">Добавить фото</span>
            <span className="text-[rgba(0,0,0,0.6)] text-[14px] text-center max-w-[220px]">
              Поддерживаются JPG, PNG (до 5 МБ)
            </span>
          </div>
        </div>
      </div>
    )
  }

  // CUSTOMIZE STEP
  return (
    <div className="fixed inset-0 z-[1001] flex flex-col font-sans overflow-hidden" style={{ paddingTop: 'max(var(--safe-top), 16px)' }}>
      {/* Top Capsules */}
      <div className="flex items-center justify-between px-5 pt-2">
        <button onClick={handleReset} className="top-capsule flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-semibold">
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

      {/* Action Row */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <button 
          onClick={handleReset}
          className="btn-secondary px-5 py-2 text-[16px] font-semibold"
        >
          Назад
        </button>
        <button 
          onClick={handleSubmit}
          disabled={submitting || !canAfford}
          className="btn-primary px-6 py-2 text-[16px] font-semibold"
        >
          {submitting ? '...' : 'Готово'}
        </button>
      </div>


      {/* Preview Area */}
      <div className="flex-1 min-h-0 w-full relative flex items-center justify-center p-4">
        {/* Force max dimensions and exact square to prevent overflow */}
        <div className="relative w-full h-full max-w-[340px] max-h-[340px] flex items-center justify-center">
          <div className="w-full h-full aspect-square rounded-[var(--radius-photo)] overflow-hidden bg-black shadow-lg relative"
               style={{ maxHeight: '100%', maxWidth: '100%' }}>
            {image && (
              <img
                src={image}
                alt="Photo preview"
                className="w-full h-full object-cover pointer-events-none"
              />
            )}
            {text !== undefined && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-[85%] w-full rounded-[12px] px-4 py-2 border-2 border-dashed border-[rgba(236,67,45,0.7)]">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={40}
                    className={[
                      'w-full bg-transparent border-none outline-none text-center resize-none overflow-visible placeholder-white/60 text-white',
                      fonts[fontIndex],
                      isUppercase ? 'uppercase' : 'normal-case'
                    ].join(' ')}
                    style={{
                      color: '#ffffff',
                      fontSize: `${fontSize}px`,
                      lineHeight: '1.2'
                    }}
                    rows={text.split('\n').length || 1}
                    placeholder="Текст"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {message && message.type === 'error' && (
        <div className="mx-4 mb-2 glass-panel rounded-[20px] text-black px-4 py-2 text-center text-sm font-medium">
          {message.text}
        </div>
      )}

      {/* Bottom Sheet - Style Text */}
      <div className="glass-panel-strong rounded-t-[var(--radius-sheet)] px-6 pt-5 pb-[max(var(--safe-bottom,20px),20px)] mt-auto">
        
        {/* Sheet Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="w-8 h-8"></div>
          <span className="font-bold text-[18px] text-black">Стилизуй текст</span>
          <button onClick={handleReset} className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center text-black/70 hover:brightness-110 transition cursor-pointer border border-white/40">
            <img src={xmarkIcon} alt="close" className="w-[14px] h-[14px] opacity-70" />
          </button>
        </div>

        {/* Font Grid */}
        <div className="grid grid-cols-4 gap-x-2 gap-y-3 mb-7">
          {fonts.map((fClass, idx) => {
            const isSelected = fontIndex === idx
            return (
              <button
                key={idx}
                onClick={() => setFontIndex(idx)}
                className={[
                  'flex items-center justify-center py-[10px] rounded-[18px] transition-all border',
                  isSelected 
                    ? 'border-transparent bg-[rgba(236,67,45,0.67)] opacity-100'
                    : 'border-white/30 bg-white/20 opacity-80'
                ].join(' ')}
              >
                <span className={`text-[26px] text-black ${fClass}`}>Aa</span>
              </button>
            )
          })}
        </div>

        {/* Text Options Row */}
        <div className="flex justify-between items-center mb-7 text-black">
          <button 
            onClick={() => setIsUppercase(!isUppercase)}
            className="flex items-center gap-1 text-[15px] font-medium"
          >
            Uppercase
            <svg className="w-[14px] h-[14px] text-black/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
          </button>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setColor('#FFFFFF')}
              className={`w-[30px] h-[30px] rounded-full bg-white border border-white/30 ${color === '#FFFFFF' ? 'ring-2 ring-offset-2 ring-white/70' : ''}`} 
            />
            <button 
              onClick={() => setColor('#000000')}
              className={`w-[30px] h-[30px] rounded-full bg-black ${color === '#000000' ? 'ring-2 ring-offset-2 ring-white/70' : ''}`} 
            />
            {/* Real color picker overlapping the rainbow wheel */}
            <div className={`relative w-[28px] h-[28px] rounded-full shadow-sm bg-[conic-gradient(from_90deg,red,orange,yellow,green,blue,indigo,violet,red)] ${color !== '#FFFFFF' && color !== '#000000' ? 'ring-2 ring-offset-2 ring-white/30' : ''}`}>
              <div className="w-full h-full rounded-full overflow-hidden absolute inset-0">
                <input
                  type="color"
                  value={color !== '#FFFFFF' && color !== '#000000' ? color : '#3B82F6'}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute -top-4 -left-4 w-[200%] h-[200%] opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Font Size Row */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 text-black">
            <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-black/60 border border-white/40">
              <span className="text-[12px] font-bold">Ai</span>
            </div>
            <span className="text-[18px] font-bold">Размер текста</span>
          </div>
          
          <div className="flex items-center bg-white/25 rounded-full overflow-hidden border border-white/40">
            <button 
              onClick={() => setFontSize(Math.max(16, fontSize - 4))}
              className="px-4 py-1.5 hover:bg-white/30 transition"
            >
              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"></path></svg>
            </button>
            <div className="w-[1px] h-4 bg-white/40"></div>
            <button 
              onClick={() => setFontSize(Math.min(72, fontSize + 4))}
              className="px-4 py-1.5 hover:bg-white/30 transition"
            >
              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
