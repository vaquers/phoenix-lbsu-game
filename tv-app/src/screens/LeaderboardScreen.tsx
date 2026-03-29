import { useState, useEffect } from 'react'
import { tvApi } from '../api'
import type { LeaderboardEntry } from '../types'

export function LeaderboardScreen({ compact = false }: { compact?: boolean }) {
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
    if (rank === 1) return 'bg-white/10 border-white/20'
    if (rank === 2) return 'bg-white/8 border-white/16'
    if (rank === 3) return 'bg-white/6 border-white/12'
    return 'bg-white/5 border-white/10'
  }

  const top10 = entries.slice(0, 10)

  return (
    <div
      className={[
        'w-full h-full flex flex-col text-[color:var(--text-primary)]',
        compact ? 'items-stretch justify-start px-6 py-6' : 'items-center justify-center px-20 py-12',
      ].join(' ')}
    >
      <h1 className={compact ? 'text-3xl font-bold tracking-tight mb-1' : 'text-6xl font-bold tracking-tight mb-2'}>
        🏆 Рейтинг
      </h1>
      <p className={compact ? 'text-sm text-[color:var(--text-muted)] mb-4' : 'text-2xl text-[color:var(--text-muted)] mb-10'}>
        Лучшие игроки
      </p>

      {top10.length === 0 && (
        <div className={compact ? 'text-left text-[color:var(--text-muted)]' : 'text-center text-[color:var(--text-muted)]'}>
          <p className={compact ? 'text-4xl mb-2' : 'text-6xl mb-4'}>🎮</p>
          <p className={compact ? 'text-lg' : 'text-3xl'}>Пока нет результатов</p>
          <p className={compact ? 'text-sm mt-1' : 'text-xl mt-2'}>Сыграй первым!</p>
        </div>
      )}

      {top10.length > 0 && (
        <div className={compact ? 'w-full space-y-2 overflow-y-auto pr-1' : 'w-full max-w-4xl space-y-3'}>
          {top10.map((entry) => {
            const medal = getMedal(entry.rank)
            const isTop3 = entry.rank <= 3
            return (
              <div
                key={entry.userId}
                className={[
                  'flex items-center gap-4 rounded-2xl border transition-all',
                  getRankBg(entry.rank),
                  compact ? 'px-4 py-3' : isTop3 ? 'px-8 py-5' : 'px-8 py-4',
                ].join(' ')}
              >
                <span
                  className={[
                    'font-bold shrink-0 w-16 text-center',
                    compact ? 'text-lg w-10' : isTop3 ? 'text-5xl' : 'text-2xl text-[color:var(--text-muted)]',
                  ].join(' ')}
                >
                  {medal ?? `#${entry.rank}`}
                </span>
                <span
                  className={[
                    'flex-1 truncate font-semibold',
                    compact ? 'text-base' : isTop3 ? 'text-4xl' : 'text-2xl',
                  ].join(' ')}
                >
                  {entry.userName}
                </span>
                <span
                  className={[
                    'font-bold text-[color:var(--text-secondary)] shrink-0',
                    compact ? 'text-base' : isTop3 ? 'text-4xl' : 'text-2xl',
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
