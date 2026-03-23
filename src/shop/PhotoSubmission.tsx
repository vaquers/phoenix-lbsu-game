import { useState, useRef, useCallback } from 'react'
import { api } from '../shared/api'
import { useUserStore } from '../shared/userStore'
import { DISPLAY_SUBMISSION_COST } from '../shared/config'

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
        <div className="bg-white/60 border border-gray-200 rounded-2xl p-4 shadow-sm mt-2">
          <h3 className="font-bold text-[17px] text-black mb-1">Разместить фото на TV</h3>
          <p className="text-[#8E8E93] text-[14px] mb-3 leading-snug">
            Загрузите фото и добавьте текст — оно появится на большом экране на 60 секунд!
          </p>
          <div className="flex items-center justify-between">
            <span className="font-medium text-black flex items-center gap-1">
              Стоимость:
            </span>
            <span className="font-bold text-[16px] text-black">
              {DISPLAY_SUBMISSION_COST} <span className="text-[14px]">🪙</span>
            </span>
          </div>
        </div>

        {message && (
          <div
            className={[
              'px-4 py-2.5 rounded-xl text-sm font-medium text-center',
              message.type === 'success'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700',
            ].join(' ')}
          >
            {message.text}
          </div>
        )}

        <div className="flex-1 min-h-0 bg-white rounded-[28px] border-2 border-dashed border-gray-300 flex items-center justify-center p-6 relative overflow-hidden transition-colors hover:bg-gray-50/50">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center pointer-events-none">
            <div className="w-16 h-16 bg-[#F0F0F2] rounded-full flex items-center justify-center mb-4 text-[#8E8E93]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <span className="text-[17px] font-bold text-black mb-1">Добавить фото</span>
            <span className="text-[#8E8E93] text-[13px] text-center max-w-[200px]">
              Поддерживаются JPG, PNG (до 5 МБ)
            </span>
          </div>
        </div>
      </div>
    )
  }

  // CUSTOMIZE STEP
  return (
    <div className="fixed inset-0 z-50 bg-[#F0F0F2] flex flex-col font-sans overflow-hidden" style={{ paddingTop: 'max(var(--safe-top), 16px)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pb-2 pt-2">
        <button 
          onClick={handleReset}
          className="bg-[#E5E5EA] text-[#1E1E1E] px-4 py-[7px] rounded-full text-[14px] font-bold active:scale-95 transition"
        >
          Cancel
        </button>
        {/* Dynamic Island placeholder area */}
        <div className="w-20 h-6 bg-black/5 rounded-full blur-[2px]" /> 
        <button 
          onClick={handleSubmit}
          disabled={submitting || !canAfford}
          className="bg-[#FFCC00] text-black px-[18px] py-[7px] rounded-full text-[14px] font-bold active:scale-95 transition"
        >
          {submitting ? '...' : 'Done'}
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex items-center px-5 py-2">
        <div className="flex items-center gap-4 text-black/40">
          <svg className="w-5 h-5 cursor-not-allowed" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <svg className="w-5 h-5 cursor-not-allowed" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </div>
        <div className="flex-1 text-center font-bold text-[15px] text-black tracking-wide">
          Customize
        </div>
        <div className="flex items-center gap-4 text-black">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 min-h-0 mx-4 mt-2 mb-4 relative overflow-hidden flex flex-col justify-center max-h-[50vh]">
        <div className="w-full aspect-square rounded-[32px] overflow-hidden bg-black relative shadow-lg mx-auto max-w-[400px]">
          {image && (
            <img
              src={image}
              alt="Photo preview"
              className="w-full h-full object-cover"
            />
          )}
          {text && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              {/* Note: The preview text is editable directly! */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={40}
                className={[
                  'w-full bg-transparent border-none outline-none text-center resize-none overflow-hidden drop-shadow-md placeholder-white/50',
                  fonts[fontIndex],
                  isUppercase ? 'uppercase' : 'normal-case'
                ].join(' ')}
                style={{
                  color: color,
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.1'
                }}
                rows={3}
                placeholder="Текст"
              />
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {message && message.type === 'error' && (
        <div className="mx-4 mb-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl text-center text-sm font-medium">
          {message.text}
        </div>
      )}

      {/* Bottom Sheet - Style Text */}
      <div className="bg-white rounded-t-[32px] px-6 pt-5 pb-[max(var(--safe-bottom,20px),20px)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] mt-auto border border-gray-100/50">
        
        {/* Sheet Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="w-8 h-8"></div>
          <span className="font-bold text-[16px] text-black">Style Text</span>
          <button className="w-8 h-8 rounded-full bg-[#F0F0F2] flex items-center justify-center text-[#8E8E93] hover:bg-[#E5E5EA]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
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
                  'flex items-center justify-center py-[10px] rounded-[14px] transition-all border-[2.5px]',
                  isSelected 
                    ? 'border-[#007AFF] bg-[#007AFF] bg-opacity-[0.08] opacity-100 shadow-sm'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:bg-[#F0F0F2]'
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
            <svg className="w-[14px] h-[14px] text-[#007AFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
          </button>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setColor('#FFFFFF')}
              className={`w-[28px] h-[28px] rounded-full bg-white border border-gray-200 shadow-sm ${color === '#FFFFFF' ? 'ring-2 ring-offset-2 ring-[#007AFF]' : ''}`} 
            />
            <button 
              onClick={() => setColor('#000000')}
              className={`w-[28px] h-[28px] rounded-full bg-black shadow-sm ${color === '#000000' ? 'ring-2 ring-offset-2 ring-[#007AFF]' : ''}`} 
            />
            {/* Real color picker overlapping the rainbow wheel */}
            <div className={`relative w-[28px] h-[28px] rounded-full shadow-sm bg-[conic-gradient(from_90deg,red,orange,yellow,green,blue,indigo,violet,red)] ${color !== '#FFFFFF' && color !== '#000000' ? 'ring-2 ring-offset-2 ring-[#007AFF]' : ''}`}>
              <div className="w-full h-full rounded-full overflow-hidden absolute inset-0">
                <input
                  type="color"
                  value={color !== '#FFFFFF' && color !== '#000000' ? color : '#007AFF'}
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
            <div className="w-7 h-7 rounded-full bg-[#E5E5EA] flex items-center justify-center text-[#8E8E93]">
              <span className="text-[12px] font-bold">Ai</span>
            </div>
            <span className="text-[15px] font-medium">Font Size</span>
          </div>
          
          <div className="flex items-center bg-[#F0F0F2] rounded-full overflow-hidden border border-[#E5E5EA]">
            <button 
              onClick={() => setFontSize(Math.max(16, fontSize - 4))}
              className="px-4 py-1.5 hover:bg-[#E5E5EA] transition"
            >
              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"></path></svg>
            </button>
            <div className="w-[1px] h-4 bg-[#D1D1D6]"></div>
            <button 
              onClick={() => setFontSize(Math.min(72, fontSize + 4))}
              className="px-4 py-1.5 hover:bg-[#E5E5EA] transition"
            >
              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
