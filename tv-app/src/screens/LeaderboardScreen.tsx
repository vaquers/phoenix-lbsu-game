import { useState, useEffect } from 'react'
import { tvApi } from '../api'
import type { LeaderboardEntry } from '../types'

export function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    const load = () => {
      tvApi.getLeaderboard().then(setEntries).catch(console.error)
    }
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-[rgba(255,138,61,0.12)] border-[rgba(255,138,61,0.35)]'
    if (rank === 2) return 'bg-[rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.3)]'
    if (rank === 3) return 'bg-[rgba(244,221,74,0.12)] border-[rgba(244,221,74,0.3)]'
    return 'bg-white/5 border-white/10'
  }

  const top10 = entries.slice(0, 10)

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-20 py-12 text-[color:var(--text-primary)]">
      <h1 className="text-6xl font-bold tracking-tight mb-2">🏆 Рейтинг</h1>
      <p className="text-2xl text-[color:var(--text-muted)] mb-10">Лучшие игроки</p>

      {top10.length === 0 && (
        <div className="text-center text-[color:var(--text-muted)]">
          <p className="text-6xl mb-4">🎮</p>
          <p className="text-3xl">Пока нет результатов</p>
          <p className="text-xl mt-2">Сыграй первым!</p>
        </div>
      )}

      {top10.length > 0 && (
        <div className="w-full max-w-4xl space-y-3">
          {top10.map((entry) => {
            const medal = getMedal(entry.rank)
            const isTop3 = entry.rank <= 3
            return (
              <div
                key={entry.userId}
                className={[
                  'flex items-center gap-6 px-8 rounded-2xl border transition-all',
                  getRankBg(entry.rank),
                  isTop3 ? 'py-5' : 'py-4',
                ].join(' ')}
              >
                <span
                  className={[
                    'font-bold shrink-0 w-16 text-center',
                    isTop3 ? 'text-5xl' : 'text-2xl text-[color:var(--text-muted)]',
                  ].join(' ')}
                >
                  {medal ?? `#${entry.rank}`}
                </span>
                <span
                  className={[
                    'flex-1 truncate font-semibold',
                    isTop3 ? 'text-4xl' : 'text-2xl',
                  ].join(' ')}
                >
                  {entry.userName}
                </span>
                <span
                  className={[
                    'font-bold text-amber-400 shrink-0',
                    isTop3 ? 'text-4xl text-[color:var(--accent-yellow)]' : 'text-2xl text-[color:var(--accent-yellow)]',
                  ].join(' ')}
                >
                  {Math.floor(entry.score)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
