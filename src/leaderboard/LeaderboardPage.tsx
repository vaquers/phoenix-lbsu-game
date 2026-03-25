import { useEffect, useState } from 'react'
import { api } from '../shared/api'
import { useUserStore } from '../shared/userStore'
import type { LeaderboardEntry } from '../shared/types'
import xmarkIcon from '../../assets/symbols/xmark.svg'

export function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const user = useUserStore((s) => s.user)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await api.getLeaderboard()
        if (!cancelled) setEntries(data)
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 10000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      className="w-full h-full flex flex-col items-center overflow-y-auto"
      style={{
        padding:
          'calc(var(--safe-top) + 24px) calc(var(--safe-right) + 20px) calc(var(--tabbar-height) + 24px) calc(var(--safe-left) + 20px)',
      }}
    >
      <div className="w-full flex items-center justify-between pb-4">
        <button className="top-capsule flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-semibold">
          <img src={xmarkIcon} alt="" className="w-4 h-4" />
          Close
        </button>
        <div className="top-capsule flex items-center gap-3 px-4 py-2 rounded-full">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 12l4 4 8-8" />
          </svg>
          <span className="text-white/80 text-lg">• • •</span>
        </div>
      </div>
      {loading && <p className="text-white/80 text-sm mt-10">Загрузка...</p>}

      {!loading && entries.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-white/80">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-lg font-medium text-white">Пока никто не играл</p>
          <p className="text-sm mt-1">Сыграй первым и займи 1 место!</p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="w-full max-w-md glass-panel-strong rounded-[var(--radius-card)] overflow-hidden">
          <div className="flex flex-col w-full divide-y divide-white/25">
            {entries.map((entry) => {
              const isMe = user?.id === entry.userId
              const avatar = entry.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.userName}`
              const handle = entry.userName.toLowerCase().replace(/\s/g, '')

              return (
                <div
                  key={entry.userId}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <span className="text-[22px] w-6 text-left font-medium text-black shrink-0">
                    {entry.rank}
                  </span>
                  
                  <img 
                    src={avatar} 
                    alt={entry.userName} 
                    className="w-[46px] h-[46px] rounded-full object-cover shrink-0 ring-1 ring-white/60" 
                  />
                  
                  <div className="flex-1 min-w-0 flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-medium text-[17px] text-black">
                      {entry.userName}
                    </span>
                    <span className="text-black/70 text-[16px]">
                      @{handle}
                    </span>
                    {isMe && (
                      <span className="text-[#EC432D] text-[16px] ml-0.5">(ты)</span>
                    )}
                  </div>
                  
                  <span className="text-[18px] font-medium text-black/60 shrink-0 ml-2">
                    {Math.floor(entry.score)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
