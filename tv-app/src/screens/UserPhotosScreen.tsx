import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { tvApi } from '../api'
import type { DisplaySubmission } from '../types'

const SLIDE_INTERVAL = 6000
type PhotoSlot = NonNullable<DisplaySubmission['composition']>['photos'][number]

export function UserPhotosScreen() {
  const [submissions, setSubmissions] = useState<DisplaySubmission[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const squareRef = useRef<HTMLDivElement>(null)
  const [squareSize, setSquareSize] = useState(0)

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

  useLayoutEffect(() => {
    const el = squareRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0) setSquareSize(rect.width)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [submissions, currentIndex])

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

  const primary = submissions[currentIndex % submissions.length]
  const secondary =
    submissions.length > 1
      ? submissions[(currentIndex + 1) % submissions.length]
      : null

  const resolveImage = (submission: DisplaySubmission, photoOverride?: PhotoSlot) => {
    const photo = photoOverride ?? submission.composition?.photos?.[0]
    return photo?.croppedImageUri || photo?.imageUri || submission.image
  }

  const resolveOverlay = (submission: DisplaySubmission) => {
    return submission.composition?.textOverlay
  }

  const renderTile = (
    submission: DisplaySubmission,
    isPrimary: boolean,
    photoOverride?: PhotoSlot,
    keyId?: string,
  ) => {
    const overlay = resolveOverlay(submission)
    const imageSrc = resolveImage(submission, photoOverride)
    const align = overlay?.align ?? 'center'
    const translateX = align === 'left' ? '0%' : align === 'right' ? '-100%' : '-50%'
    const fontSize =
      overlay?.fontSizePercent && squareSize
        ? Math.max(14, overlay.fontSizePercent * squareSize)
        : overlay?.fontSize ?? 48

    return (
      <div
        key={keyId}
        ref={isPrimary ? squareRef : undefined}
        className={[
          'relative aspect-square rounded-[40px] overflow-hidden shadow-2xl bg-black/15 border border-white/10',
          submissions.length > 1 ? 'w-[38vw] max-w-[520px]' : 'w-[56vw] max-w-[640px]',
        ].join(' ')}
      >
        <img
          src={imageSrc}
          alt={submission.text}
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />

        {(overlay?.text || submission.text) && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              style={{
                position: 'absolute',
                left: `${(overlay?.xPercent ?? 0.5) * 100}%`,
                top: `${(overlay?.yPercent ?? 0.5) * 100}%`,
                transform: `translate(${translateX}, -50%)`,
                color: overlay?.color || '#ffffff',
                fontWeight: overlay?.fontWeight ?? 800,
                fontStyle: overlay?.fontStyle ?? 'normal',
                fontSize: `${fontSize}px`,
                lineHeight: 1.15,
                textAlign: align,
                whiteSpace: 'pre-wrap',
                opacity: overlay?.opacity ?? 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.35)',
              }}
            >
              {overlay?.text ?? submission.text}
            </div>
          </div>
        )}
      </div>
    )
  }

  const primaryPhotos = primary.composition?.photos ?? []
  const hasTwoFromPrimary = primaryPhotos.length >= 2
  const tiles = hasTwoFromPrimary
    ? [
        { submission: primary, photo: primaryPhotos[0], key: 'p1' },
        { submission: primary, photo: primaryPhotos[1], key: 'p2' },
      ]
    : [
        { submission: primary, photo: primaryPhotos[0], key: 'p1' },
        ...(secondary
          ? [
              {
                submission: secondary,
                photo: secondary.composition?.photos?.[0],
                key: 'p2',
              },
            ]
          : []),
      ]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative text-[color:var(--text-primary)]">
      <div className="absolute top-8 left-10 z-10">
        <h1 className="text-4xl font-bold tracking-tight opacity-80">📸 Фото участников</h1>
      </div>

      <div
        className="relative w-full flex items-center justify-center transition-opacity duration-500 gap-[6vw]"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {tiles.map((tile, idx) =>
          renderTile(tile.submission, idx === 0, tile.photo, tile.key),
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
