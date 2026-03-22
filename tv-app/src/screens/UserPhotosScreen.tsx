import { useState, useEffect, useRef } from 'react'
import { tvApi } from '../api'
import type { DisplaySubmission } from '../types'

const SLIDE_INTERVAL = 6000

export function UserPhotosScreen() {
  const [submissions, setSubmissions] = useState<DisplaySubmission[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    const load = () => {
      tvApi.getDisplaySubmissions().then(setSubmissions).catch(console.error)
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (submissions.length <= 1) return
    intervalRef.current = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % submissions.length)
        setFade(true)
      }, 500)
    }, SLIDE_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [submissions])

  if (submissions.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold mb-6">📸 Фото от участников</h1>
        <div className="text-center text-white/30">
          <p className="text-5xl mb-4">🖼️</p>
          <p className="text-3xl">Пока нет фотографий</p>
          <p className="text-xl mt-2">Купи размещение фото в приложении!</p>
        </div>
      </div>
    )
  }

  const current = submissions[currentIndex % submissions.length]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <div className="absolute top-8 left-10 z-10">
        <h1 className="text-4xl font-bold tracking-tight opacity-80">📸 Фото участников</h1>
      </div>

      <div
        className="relative max-w-[80vw] max-h-[75vh] transition-opacity duration-500"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <img
          src={current.image}
          alt={current.text}
          className="max-w-[80vw] max-h-[70vh] rounded-3xl shadow-2xl object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />

        {current.text && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-3xl px-10 py-8">
            <p className="text-4xl font-bold text-white text-center drop-shadow-lg">
              {current.text}
            </p>
            <p className="text-lg text-white/40 text-center mt-2">
              — {current.userName}
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 flex gap-2">
        {submissions.map((_, i) => (
          <div
            key={i}
            className={[
              'w-2.5 h-2.5 rounded-full transition-all duration-300',
              i === currentIndex % submissions.length
                ? 'bg-white/70 scale-125'
                : 'bg-white/15',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}
