import { useState, useRef, useCallback } from 'react'
import { api } from '../shared/api'
import { useUserStore } from '../shared/userStore'
import { DISPLAY_SUBMISSION_COST } from '../shared/config'

import xmarkIcon from '../../assets/symbols/xmark.svg'
import undoIcon from '../../assets/symbols/arrow.uturn.backward.svg'
import redoIcon from '../../assets/symbols/arrow.uturn.forward.svg'
import eyeIcon from '../../assets/symbols/eye.fill.svg'
import plusIcon from '../../assets/symbols/plus.app.svg'

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
        <div className="bg-[color:var(--surface-2)] border border-[color:var(--border)] rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] mt-2">
          <h3 className="font-bold text-[17px] text-[color:var(--text-primary)] mb-1">Разместить фото на TV</h3>
          <p className="text-[color:var(--text-muted)] text-[14px] mb-3 leading-snug">
            Загрузите фото и добавьте текст — оно появится на большом экране на 60 секунд!
          </p>
          <div className="flex items-center justify-between">
            <span className="font-medium text-[color:var(--text-secondary)] flex items-center gap-1">
              Стоимость:
            </span>
            <span className="font-bold text-[16px] text-[color:var(--text-primary)]">
              {DISPLAY_SUBMISSION_COST} <span className="text-[14px]">🪙</span>
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

        <div className="flex-1 min-h-0 bg-[color:var(--surface-1)] rounded-[28px] border border-dashed border-[color:var(--border)] flex items-center justify-center p-6 relative overflow-hidden transition-colors hover:bg-[color:var(--surface-2)]">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center pointer-events-none">
            <div className="w-16 h-16 bg-[color:var(--surface-2)] rounded-full flex items-center justify-center mb-4 text-[color:var(--text-muted)] border border-[color:var(--border)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <span className="text-[17px] font-bold text-[color:var(--text-primary)] mb-1">Добавить фото</span>
            <span className="text-[color:var(--text-muted)] text-[13px] text-center max-w-[200px]">
              Поддерживаются JPG, PNG (до 5 МБ)
            </span>
          </div>
        </div>
      </div>
    )
  }

  // CUSTOMIZE STEP
  return (
    <div className="fixed inset-0 z-[1001] bg-[color:var(--bg)] flex flex-col font-sans overflow-hidden" style={{ paddingTop: 'max(var(--safe-top), 16px)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pb-2 pt-2">
        <button 
          onClick={handleReset}
          className="bg-[color:var(--surface-2)] text-[color:var(--text-secondary)] px-4 py-[7px] rounded-full text-[14px] font-bold active:scale-95 transition border border-[color:var(--border)]"
        >
          Cancel
        </button>
        <div className="w-20" /> 
        <button 
          onClick={handleSubmit}
          disabled={submitting || !canAfford}
          className="bg-[color:var(--surface-3)] text-[color:var(--text-primary)] px-[18px] py-[7px] rounded-full text-[14px] font-bold active:scale-95 transition border border-[color:var(--border)]"
        >
          {submitting ? '...' : 'Done'}
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex items-center px-5 py-2">
        <div className="flex items-center gap-4 text-[color:var(--text-muted)]">
          <button onClick={() => setMessage({ text: 'Отмена недоступна', type: 'error' })} className="hover:opacity-70 transition"><img src={undoIcon} alt="undo" className="w-[18px] h-[18px] cursor-not-allowed opacity-40" /></button>
          <button onClick={() => setMessage({ text: 'Повтор недоступен', type: 'error' })} className="hover:opacity-70 transition"><img src={redoIcon} alt="redo" className="w-[18px] h-[18px] cursor-not-allowed opacity-40" /></button>
        </div>
        <div className="flex-1 text-center font-bold text-[15px] text-[color:var(--text-primary)] tracking-wide">
          Customize
        </div>
        <div className="flex items-center gap-4 text-[color:var(--text-primary)]">
          <button onClick={() => setMessage({ text: 'Предпросмотр', type: 'success' })} className="hover:opacity-70 transition"><img src={eyeIcon} alt="preview" className="w-[22px] h-[22px]" /></button>
          <button onClick={() => setMessage({ text: 'Добавление слоя', type: 'success' })} className="hover:opacity-70 transition"><img src={plusIcon} alt="add layer" className="w-[22px] h-[22px]" /></button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 min-h-0 w-full relative flex items-center justify-center p-4">
        {/* Force max dimensions and exact square to prevent overflow */}
        <div className="relative w-full h-full max-w-[340px] max-h-[340px] flex items-center justify-center">
          <div className="w-full h-full aspect-square rounded-[32px] overflow-hidden bg-black shadow-lg relative"
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
                <div className="max-w-[85%] w-full bg-[#F5F5F7] rounded-[20px] px-5 py-3 shadow-sm">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={40}
                    className={[
                      'w-full bg-transparent border-none outline-none text-center resize-none overflow-visible placeholder-black/40 text-black',
                      fonts[fontIndex],
                      isUppercase ? 'uppercase' : 'normal-case'
                    ].join(' ')}
                    style={{
                      color: '#000000',
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
        <div className="mx-4 mb-2 bg-[rgba(217,106,106,0.12)] text-[color:var(--error)] px-4 py-2 rounded-xl text-center text-sm font-medium border border-[rgba(217,106,106,0.25)]">
          {message.text}
        </div>
      )}

      {/* Bottom Sheet - Style Text */}
      <div className="bg-[color:var(--surface-2)] rounded-t-[32px] px-6 pt-5 pb-[max(var(--safe-bottom,20px),20px)] shadow-[0_-8px_32px_rgba(0,0,0,0.45)] mt-auto border border-[color:var(--border)]">
        
        {/* Sheet Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="w-8 h-8"></div>
          <span className="font-bold text-[16px] text-[color:var(--text-primary)]">Style Text</span>
          <button onClick={handleReset} className="w-8 h-8 rounded-full bg-[color:var(--surface-3)] flex items-center justify-center text-[color:var(--text-muted)] hover:brightness-110 transition cursor-pointer border border-[color:var(--border)]">
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
                  'flex items-center justify-center py-[10px] rounded-[14px] transition-all border-[2.5px]',
                  isSelected 
                    ? 'border-[color:var(--border)] bg-[color:var(--surface-3)] opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:bg-[color:var(--surface-3)]'
                ].join(' ')}
              >
                <span className={`text-[26px] text-[color:var(--text-primary)] ${fClass}`}>Aa</span>
              </button>
            )
          })}
        </div>

        {/* Text Options Row */}
        <div className="flex justify-between items-center mb-7 text-[color:var(--text-primary)]">
          <button 
            onClick={() => setIsUppercase(!isUppercase)}
            className="flex items-center gap-1 text-[15px] font-medium"
          >
            Uppercase
            <svg className="w-[14px] h-[14px] text-[color:var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
          </button>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setColor('#FFFFFF')}
              className={`w-[28px] h-[28px] rounded-full bg-white border border-white/20 shadow-sm ${color === '#FFFFFF' ? 'ring-2 ring-offset-2 ring-white/30' : ''}`} 
            />
            <button 
              onClick={() => setColor('#000000')}
              className={`w-[28px] h-[28px] rounded-full bg-black shadow-sm ${color === '#000000' ? 'ring-2 ring-offset-2 ring-white/30' : ''}`} 
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
          <div className="flex items-center gap-2 text-[color:var(--text-primary)]">
            <div className="w-7 h-7 rounded-full bg-[color:var(--surface-3)] flex items-center justify-center text-[color:var(--text-muted)] border border-[color:var(--border)]">
              <span className="text-[12px] font-bold">Ai</span>
            </div>
            <span className="text-[15px] font-medium">Font Size</span>
          </div>
          
          <div className="flex items-center bg-[color:var(--surface-3)] rounded-full overflow-hidden border border-[color:var(--border)]">
            <button 
              onClick={() => setFontSize(Math.max(16, fontSize - 4))}
              className="px-4 py-1.5 hover:bg-[color:var(--surface-2)] transition"
            >
              <svg className="w-3 h-3 text-[color:var(--text-primary)]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"></path></svg>
            </button>
            <div className="w-[1px] h-4 bg-[color:var(--border)]"></div>
            <button 
              onClick={() => setFontSize(Math.min(72, fontSize + 4))}
              className="px-4 py-1.5 hover:bg-[color:var(--surface-2)] transition"
            >
              <svg className="w-3 h-3 text-[color:var(--text-primary)]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
