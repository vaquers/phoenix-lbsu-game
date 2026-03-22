import { useEffect, useState } from 'react'
import { api } from '../shared/api'
import { useUserStore } from '../shared/userStore'
import type { LeaderboardEntry } from '../shared/types'

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
      className="w-full h-full flex flex-col items-center bg-[#E5E5EA] text-[#1E1E1E] overflow-y-auto"
      style={{
        padding:
          'calc(var(--safe-top) + 24px) calc(var(--safe-right) + 16px) calc(var(--tabbar-height) + 24px) calc(var(--safe-left) + 16px)',
      }}
    >
      {loading && <p className="text-gray-400 text-sm mt-10">Загрузка...</p>}

      {!loading && entries.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-lg font-medium">Пока никто не играл</p>
          <p className="text-sm mt-1">Сыграй первым и займи 1 место!</p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="w-full max-w-md bg-[#EAEAEA] border-[6px] border-white rounded-[32px] overflow-hidden shadow-sm">
          <div className="flex flex-col w-full divide-y divide-[#D5D5D5]">
            {entries.map((entry) => {
              const isMe = user?.id === entry.userId
              const avatar = entry.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.userName}`
              const handle = entry.userName.toLowerCase().replace(/\s/g, '')

              return (
                <div
                  key={entry.userId}
                  className="flex items-center gap-4 px-5 py-3.5 transition"
                >
                  <span className="text-[22px] w-6 text-left font-medium text-black shrink-0">
                    {entry.rank}
                  </span>
                  
                  <img 
                    src={avatar} 
                    alt={entry.userName} 
                    className="w-[46px] h-[46px] rounded-full object-cover shrink-0" 
                  />
                  
                  <div className="flex-1 min-w-0 flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-medium text-[17px] text-black">
                      {entry.userName}
                    </span>
                    <span className="text-[#8E8E93] text-[16px]">
                      @{handle}
                    </span>
                    {isMe && (
                      <span className="text-[#8E8E93] text-[16px] ml-0.5">(ты)</span>
                    )}
                  </div>
                  
                  <span className="text-[18px] font-medium text-[#6C6C70] shrink-0 ml-2">
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
