import { useUserStore } from '../shared/userStore'
import bitcoinSign from '../../assets/symbols/bitcoinsign.svg'

export function BalanceCard() {
  const userCoins = useUserStore((s) => s.user?.coins ?? 0)

  return (
    <div className="glass-panel-strong rounded-[24px] px-5 py-4 flex items-center justify-between">
      <span className="text-black font-semibold">Баланс</span>
      <span className="flex items-center gap-1 font-bold text-black">
        {Math.floor(userCoins)}
        <img src={bitcoinSign} className="w-4 h-4" />
      </span>
    </div>
  )
}
