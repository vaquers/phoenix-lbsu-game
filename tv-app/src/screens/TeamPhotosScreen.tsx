import { useState, useEffect, useRef } from 'react'
import { tvApi } from '../api'
import type { TeamPhoto } from '../types'
const SLIDE_INTERVAL = 8000

const PLACEHOLDER_PHOTOS: TeamPhoto[] = [
  { id: 'tp-1', image: '/team/hacaton.jpg', caption: 'Хакатон: заряжаем идеи', order: 1 },
  { id: 'tp-2', image: '/team/indev.jpg', caption: 'В разработке: кипит работа', order: 2 },
  { id: 'tp-3', image: '/team/minsk.jpg', caption: 'Минск: команда в деле', order: 3 },
  { id: 'tp-4', image: '/team/moscow.jpg', caption: 'Москва: большой город — большие планы', order: 4 },
  { id: 'tp-5', image: '/team/win1.jpg', caption: 'Победа №1: наш момент', order: 5 },
  { id: 'tp-6', image: '/team/win2.jpg', caption: 'Победа №2: закрепляем успех', order: 6 },
]

const GRADIENT_COLORS = [
  'from-slate-700 to-slate-900',
  'from-neutral-700 to-neutral-900',
  'from-zinc-700 to-zinc-900',
  'from-stone-700 to-stone-900',
  'from-gray-700 to-gray-900',
]

export function TeamPhotosScreen() {
  const [photos, setPhotos] = useState<TeamPhoto[]>(PLACEHOLDER_PHOTOS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    tvApi
      .getTeamPhotos()
      .then((data) => {
        if (data.length > 0) setPhotos(data)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (photos.length <= 1) return
    intervalRef.current = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length)
        setFade(true)
      }, 600)
    }, SLIDE_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [photos])

  const current = photos[currentIndex]
  const gradientClass = GRADIENT_COLORS[currentIndex % GRADIENT_COLORS.length]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative text-[color:var(--text-primary)]">
      <div className="absolute top-8 left-10">
        <h1 className="text-5xl font-bold tracking-tight opacity-90">Phoenix Team</h1>
        <p className="text-xl text-[color:var(--text-muted)] mt-2">Наша команда</p>
      </div>

      <div
        className="transition-opacity duration-600"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {current?.image ? (
          <img
            src={current.image}
            alt={current.caption}
            className="max-h-[60vh] max-w-[80vw] rounded-3xl shadow-2xl object-cover"
          />
        ) : (
          <div
            className={`w-[60vw] h-[50vh] rounded-3xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-2xl ring-1 ring-white/10`}
          >
            <span className="text-8xl">🔥</span>
          </div>
        )}
      </div>

      <div
        className="mt-8 text-center transition-opacity duration-600"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <p className="text-3xl font-semibold">{current?.caption}</p>
        <p className="text-lg text-[color:var(--text-muted)] mt-2">
          {currentIndex + 1} / {photos.length}
        </p>
      </div>
    </div>
  )
}
