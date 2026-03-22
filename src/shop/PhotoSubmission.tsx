import { useState, useRef, useCallback } from 'react'
import { api } from '../shared/api'
import { useUserStore } from '../shared/userStore'
import { DISPLAY_SUBMISSION_COST } from '../shared/config'

export function PhotoSubmission() {
  const [image, setImage] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const user = useUserStore((s) => s.user)
  const spendCoins = useUserStore((s) => s.spendCoins)

  const canAfford = (user?.coins ?? 0) >= DISPLAY_SUBMISSION_COST

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
      setMessage(null)
    }
    reader.onerror = () => {
      setMessage({ text: 'Ошибка чтения файла', type: 'error' })
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
      setText('')
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
    setText('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="mt-3 space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-semibold text-lg mb-1">Разместить фото на TV</h3>
        <p className="text-white/40 text-sm mb-3">
          Загрузите фото и добавьте текст — оно появится на большом экране!
        </p>
        <p className="text-amber-400 text-sm font-medium">
          Стоимость: {DISPLAY_SUBMISSION_COST} 🪙
        </p>
      </div>

      {message && (
        <div
          className={[
            'px-4 py-2 rounded-lg text-sm font-medium text-center',
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30',
          ].join(' ')}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">Фото</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">
            Текст поверх фото
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ваш текст..."
            maxLength={100}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30"
          />
        </div>

        {image && (
          <div className="relative">
            <label className="block text-sm font-medium text-white/60 mb-1.5">Предпросмотр</label>
            <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black flex items-center justify-center">
              <img
                src={image}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
              {text && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-4 py-3">
                  <p className="text-white font-semibold text-lg text-center">{text}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleReset}
              className="mt-2 text-xs text-white/40 hover:text-white/60 transition"
            >
              Убрать фото
            </button>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!image || submitting || !canAfford}
          className={[
            'w-full py-3 rounded-xl text-sm font-semibold transition',
            image && canAfford
              ? 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-[0.98]'
              : 'bg-white/10 text-white/30 cursor-not-allowed',
          ].join(' ')}
        >
          {submitting
            ? 'Отправка...'
            : !canAfford
              ? `Не хватает коинов (нужно ${DISPLAY_SUBMISSION_COST})`
              : `Отправить за ${DISPLAY_SUBMISSION_COST} 🪙`}
        </button>
      </div>
    </div>
  )
}
