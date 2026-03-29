import { useState, useEffect, useRef } from 'react'
import { tvApi } from '../api'
import type { DisplaySubmission } from '../types'

const SLIDE_INTERVAL = 6000

export function UserPhotosScreen() {
  const [submissions, setSubmissions] = useState<DisplaySubmission[]>([])
  const [pageIndex, setPageIndex] = useState(0)
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
    const pages = Math.max(1, Math.ceil(submissions.length / 4))
    if (pages <= 1) return
    intervalRef.current = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setPageIndex((prev) => (prev + 1) % pages)
        setFade(true)
      }, 500)
    }, SLIDE_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [submissions])

  if (submissions.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-[color:var(--text-primary)]">
        <h1 className="text-6xl font-bold mb-6">📸 Фото от участников</h1>
        <div className="text-center text-[color:var(--text-muted)]">
          <p className="text-5xl mb-4">🖼️</p>
          <p className="text-3xl">Пока нет фотографий</p>
          <p className="text-xl mt-2">Купи размещение фото в приложении!</p>
        </div>
      </div>
    )
  }

  const resolveImage = (submission: DisplaySubmission) => {
    const photo = submission.composition?.photos?.[0]
    return photo?.croppedImageUri || photo?.imageUri || submission.image
  }

  const pageSize = 4
  const pages = Math.max(1, Math.ceil(submissions.length / pageSize))
  const start = pageIndex * pageSize
  const visible = submissions.slice(start, start + pageSize)

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative text-[color:var(--text-primary)]">
      <div className="absolute top-8 left-10 z-10">
        <h1 className="text-4xl font-bold tracking-tight opacity-80">📸 Фото участников</h1>
      </div>

      <div
        className="relative w-full flex items-center justify-center transition-opacity duration-500"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <div className="grid grid-cols-2 gap-8 w-[80vw] max-w-[1100px]">
          {visible.map((submission) => (
            <div
              key={submission.id}
              className="relative aspect-square rounded-[40px] overflow-hidden shadow-2xl bg-black/15 border border-white/10"
            >
              <img
                src={resolveImage(submission)}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 flex gap-2">
        {Array.from({ length: pages }).map((_, i) => (
          <div
            key={i}
            className={[
              'w-2.5 h-2.5 rounded-full transition-all duration-300',
              i === pageIndex % pages
                ? 'bg-white/70 scale-125'
                : 'bg-white/15',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}
