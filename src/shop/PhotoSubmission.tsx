import { useState, useRef, useCallback } from 'react'
import { api } from '../shared/api'
import { useUserStore } from '../shared/userStore'
import { DISPLAY_SUBMISSION_COST } from '../shared/config'
import { BalanceCard } from './BalanceCard'

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
  const [textPos, setTextPos] = useState({ x: 0.5, y: 0.5 })
  
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const user = useUserStore((s) => s.user)
  const spendCoins = useUserStore((s) => s.spendCoins)

  const canAfford = (user?.coins ?? 0) >= DISPLAY_SUBMISSION_COST

  const fontVariants = [
    { weight: 900, style: 'normal' as const },
    { weight: 800, style: 'normal' as const },
    { weight: 700, style: 'normal' as const },
    { weight: 600, style: 'normal' as const },
    { weight: 500, style: 'normal' as const },
    { weight: 400, style: 'normal' as const },
    { weight: 700, style: 'italic' as const },
    { weight: 500, style: 'italic' as const },
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
      const dataUrl = reader.result as string
      setImage(dataUrl)
      setMessage(null)
      void submitImage(dataUrl)
    }
    reader.onerror = () => {
      setMessage({ text: 'Ошибка чтения', type: 'error' })
    }
    reader.readAsDataURL(file)
  }, [])

  const submitImage = async (dataUrl: string) => {
    if (!user || !dataUrl) return
    if (!canAfford) {
      setMessage({
        text: `Не хватает коинов! Нужно ${DISPLAY_SUBMISSION_COST}, у вас ${Math.floor(user.coins)}`,
        type: 'error',
      })
      return
    }

    setSubmitting(true)
    try {
      const square = await createSquareCrop(dataUrl)
      const composition = {
        photos: [
          {
            id: `photo-${Date.now()}`,
            imageUri: dataUrl,
            croppedImageUri: square.dataUrl,
            crop: square.crop,
            displayMode: 'square' as const,
          },
        ],
      }
      await api.submitDisplayPhoto(user.id, square.dataUrl, '', composition)
      spendCoins(DISPLAY_SUBMISSION_COST)
      setImage(null)
      setStep('upload')
      if (fileRef.current) fileRef.current.value = ''
      setMessage({ text: 'Фото отправлено на TV!', type: 'success' })
      window.alert('Фото загружено и отправлено на TV!')
    } catch (e: any) {
      setMessage({ text: e.message || 'Ошибка отправки', type: 'error' })
    } finally {
      setSubmitting(false)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  const handleSubmit = async () => {
    if (!image) return
    await submitImage(image)
  }

  const handleReset = () => {
    setImage(null)
    setText('YOUR TEXT')
    setStep('upload')
    if (fileRef.current) fileRef.current.value = ''
  }

  const textBoxRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)

  const onTextPointerDown = (e: React.PointerEvent) => {
    const box = textBoxRef.current
    if (!box) return
    box.setPointerCapture(e.pointerId)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: textPos.x,
      origY: textPos.y,
    }
  }

  const onTextPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !textBoxRef.current) return
    const rect = textBoxRef.current.parentElement?.getBoundingClientRect()
    if (!rect) return
    const dx = (e.clientX - dragRef.current.startX) / rect.width
    const dy = (e.clientY - dragRef.current.startY) / rect.height
    const nx = Math.min(0.95, Math.max(0.05, dragRef.current.origX + dx))
    const ny = Math.min(0.95, Math.max(0.05, dragRef.current.origY + dy))
    setTextPos({ x: nx, y: ny })
  }

  const onTextPointerUp = (e: React.PointerEvent) => {
    if (!textBoxRef.current) return
    try {
      textBoxRef.current.releasePointerCapture(e.pointerId)
    } catch {}
    dragRef.current = null
  }

  const createSquareCrop = (src: string): Promise<{ dataUrl: string; crop: { x: number; y: number; width: number; height: number } }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const size = Math.min(img.width, img.height)
        const cropX = Math.floor((img.width - size) / 2)
        const cropY = Math.floor((img.height - size) / 2)
        const canvas = document.createElement('canvas')
        const out = 1024
        canvas.width = out
        canvas.height = out
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('No canvas context'))
        ctx.drawImage(img, cropX, cropY, size, size, 0, 0, out, out)
        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.92),
          crop: { x: cropX, y: cropY, width: size, height: size },
        })
      }
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = src
    })
  }

  if (step === 'upload') {
    return (
      <div className="flex flex-col h-full space-y-4">
        <BalanceCard />
        <div className="glass-panel-strong rounded-[var(--radius-card)] p-5 mt-2">
          <h3 className="font-bold text-[20px] text-black mb-2">Разместить фото на ТВ</h3>
          <p className="text-[rgba(0,0,0,0.6)] text-[16px] mb-4 leading-snug">
            Загрузите фото — оно появится на большом экране на 60 секунд!
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

        <div className="h-[42vh] max-h-[420px] glass-panel-strong rounded-[var(--radius-card)] flex items-center justify-center p-6 relative overflow-hidden mb-4">
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
    <div
      className="fixed inset-0 z-[1001] flex flex-col overflow-hidden"
      style={{ paddingTop: 'max(var(--safe-top), 16px)', background: 'var(--app-bg)', fontFamily: 'Unbounded, system-ui, -apple-system, sans-serif' }}
    >
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

      <div className="px-5 pb-3">
        <BalanceCard />
      </div>

      {/* Preview Area */}
      <div className="flex-1 min-h-0 w-full relative flex items-center justify-center p-4">
        {/* Force max dimensions and exact square to prevent overflow */}
        <div
          ref={previewRef}
          className="relative w-full h-full max-w-[340px] max-h-[340px] flex items-center justify-center"
        >
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
              <div className="absolute inset-0">
                <div
                  ref={textBoxRef}
                  onPointerDown={onTextPointerDown}
                  onPointerMove={onTextPointerMove}
                  onPointerUp={onTextPointerUp}
                  className="absolute p-2"
                  style={{
                    left: `${textPos.x * 100}%`,
                    top: `${textPos.y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="max-w-[85%] w-full rounded-[12px] px-4 py-2 border-2 border-dashed border-[rgba(236,67,45,0.7)]">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={40}
                      className={[
                        'w-full bg-transparent border-none outline-none text-center resize-none overflow-visible placeholder-white/60',
                        isUppercase ? 'uppercase' : 'normal-case'
                      ].join(' ')}
                      style={{
                        color: color,
                        fontSize: `${fontSize}px`,
                        lineHeight: '1.2',
                        fontWeight: fontVariants[fontIndex]?.weight ?? 700,
                        fontStyle: fontVariants[fontIndex]?.style ?? 'normal'
                      }}
                      rows={text.split('\n').length || 1}
                      placeholder="Текст"
                    />
                  </div>
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
      <div className="px-4 pb-[max(var(--safe-bottom,16px),16px)]">
        <div className="glass-panel-strong rounded-[34px] px-6 pt-5 pb-5" style={{ background: 'linear-gradient(180deg, rgba(255,214,214,0.85) 0%, rgba(215,200,216,0.75) 60%, rgba(182,196,220,0.7) 100%)' }}>
        
        {/* Sheet Header */}
          <div className="flex items-center justify-center mb-6">
            <span className="font-extrabold text-[20px] text-black text-center">Стилизуй текст</span>
          </div>

        {/* Font Grid */}
        <div className="grid grid-cols-4 gap-x-3 gap-y-3 mb-7">
          {fontVariants.map((variant, idx) => {
            const isSelected = fontIndex === idx
            return (
              <button
                key={idx}
                onClick={() => setFontIndex(idx)}
                className={[
                  'flex items-center justify-center h-[48px] rounded-[999px] transition-all border',
                  isSelected 
                    ? 'border-transparent bg-[#EC432D] opacity-100'
                    : 'border-white/40 bg-white/30 opacity-80'
                ].join(' ')}
              >
                <span
                  className={`text-[22px] ${isSelected ? 'text-white' : 'text-black'}`}
                  style={{ fontWeight: variant.weight, fontStyle: variant.style }}
                >
                  Aa
                </span>
              </button>
            )
          })}
        </div>

        {/* Color Grid */}
        <div className="grid grid-cols-6 gap-x-4 gap-y-4 mb-7">
          {[
            '#000000', '#FFFFFF', '#0A74FF', '#32C857', '#FFD400', '#FF3B30',
            '#6EC7FF', '#9B4DFF', '#3D3D8F', '#FF2D55', '#B07A4B', '#00C2B2'
          ].map((c) => {
            const isSelected = color.toLowerCase() === c.toLowerCase()
            return (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={[
                  'w-[34px] h-[34px] rounded-full transition-transform',
                  isSelected ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[rgba(255,255,255,0.35)]' : '',
                ].join(' ')}
                style={{ backgroundColor: c }}
              />
            )
          })}
        </div>

        {/* Font Size Row */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-black">
            <span className="text-[20px] font-extrabold">Размер текста</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setFontSize(Math.max(16, fontSize - 4))}
              className="w-[46px] h-[46px] rounded-full bg-white/35 border border-white/50 flex items-center justify-center"
            >
              <span className="text-[20px] font-extrabold text-black">–</span>
            </button>
            <button 
              onClick={() => setFontSize(Math.min(72, fontSize + 4))}
              className="w-[46px] h-[46px] rounded-full bg-white/35 border border-white/50 flex items-center justify-center"
            >
              <span className="text-[20px] font-extrabold text-black">+</span>
            </button>
          </div>
        </div>

        </div>
      </div>
    </div>
  )
}
