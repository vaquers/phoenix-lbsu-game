const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)() : null

export type SoundName = 'coin' | 'hit' | 'menu'

export function playSound(name: SoundName) {
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)

  if (name === 'coin') {
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
    osc.start(now)
    osc.stop(now + 0.12)
  } else if (name === 'hit') {
    osc.frequency.setValueAtTime(150, now)
    osc.type = 'sawtooth'
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
    osc.start(now)
    osc.stop(now + 0.3)
  } else if (name === 'menu') {
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.setValueAtTime(500, now + 0.05)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
    osc.start(now)
    osc.stop(now + 0.15)
  }
}
