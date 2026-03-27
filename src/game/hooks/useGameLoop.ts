import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'
import {
  LANE_OFFSETS,
  BASE_SPEED,
  MAX_SPEED,
  SPEED_INCREASE_PER_SECOND,
  SPEED_INCREASE_DISTANCE,
  PLAYER_LANE_TRANSITION_DURATION,
  SLIDE_DURATION,
  POINTS_PER_METER,
  POINTS_PER_COIN,
  DESPAWN_Z,
  GRAVITY,
  JUMP_VELOCITY,
  COIN_Y,
} from '../utils/constants'
import {
  getPlayerBox,
  checkObstacleCollision,
  checkCoinCollision,
  findLandingHeight,
  isOnPlatform,
  checkPlatformFrontCollision,
} from '../systems/collisionSystem'
import { spawnObstacle, spawnObstacleAt, getNextObstacleSpawnTime, resetObstacleIds } from '../systems/obstacleManager'
import { spawnCoins, getNextCoinSpawnTime, resetCoinIds } from '../systems/coinManager'
import { spawnPlatformPattern, getNextPlatformSpawnTime, resetPlatformIds } from '../systems/platformManager'
import { subscribeInput } from '../systems/inputManager'
import { playSound } from '../utils/sounds'
import type { LaneIndex } from '../utils/types'

export function useGameLoop() {
  const lastObstacleTime = useRef(0)
  const nextObstacleInterval = useRef(getNextObstacleSpawnTime(BASE_SPEED))
  const lastCoinTime = useRef(0)
  const nextCoinInterval = useRef(getNextCoinSpawnTime())
  const lastPlatformTime = useRef(0)
  const nextPlatformInterval = useRef(getNextPlatformSpawnTime())
  const slideStartTime = useRef(0)

  // ── Input handling ──────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = subscribeInput((action) => {
      const s = useGameStore.getState()
      if (s.phase !== 'playing' && s.phase !== 'paused') {
        if (action === 'restart' && s.phase === 'gameOver') {
          resetObstacleIds()
          resetCoinIds()
          resetPlatformIds()
          s.reset()
          s.saveHighScore()
        }
        return
      }
      if (action === 'pause') {
        s.setPhase(s.phase === 'paused' ? 'playing' : 'paused')
        return
      }
      if (s.phase === 'paused') return
      if (s.playerState === 'hit' || s.playerState === 'gameOver') return

      if (action === 'left') {
        const next: LaneIndex = Math.min(2, s.laneIndex + 1) as LaneIndex
        if (next !== s.targetLaneIndex) s.setTargetLaneIndex(next)
      } else if (action === 'right') {
        const next: LaneIndex = Math.max(0, s.laneIndex - 1) as LaneIndex
        if (next !== s.targetLaneIndex) s.setTargetLaneIndex(next)
      } else if (action === 'jump' && s.isGrounded) {
        s.setPlayerState('jump')
        useGameStore.setState({ velocityY: JUMP_VELOCITY, isGrounded: false })
      } else if (action === 'slide') {
        if (s.isGrounded && s.playerState === 'run') {
          s.setPlayerState('slide')
          slideStartTime.current = performance.now() / 1000
        } else if (!s.isGrounded) {
          useGameStore.setState({ velocityY: Math.min(s.velocityY, -12) })
        }
      }
    })
    return unsub
  }, [])

  // ── Frame update ────────────────────────────────────────────────────────

  useFrame((_, delta) => {
    const s = useGameStore.getState()
    if (s.phase !== 'playing') return

    const time = performance.now() / 1000
    const dt = Math.min(delta, 0.05)

    let state = s.playerState
    let y = s.playerY
    let velocityY = s.velocityY
    let isGrounded = s.isGrounded
    let groundLevel = s.groundLevel
    let laneIndex = s.laneIndex
    let currentX = s.playerX
    const targetLaneX = LANE_OFFSETS[s.targetLaneIndex]

    // ── 1. Slide timer ────────────────────────────────────────────────────

    if (state === 'slide') {
      if (time - slideStartTime.current >= SLIDE_DURATION) {
        state = 'run'
      }
    }

    // ── 2. Lane transition ────────────────────────────────────────────────

    if (state !== 'hit' && state !== 'gameOver') {
      if (Math.abs(currentX - targetLaneX) < 0.01) {
        currentX = targetLaneX
        laneIndex = s.targetLaneIndex
      } else {
        currentX += (targetLaneX - currentX) * Math.min(1, (dt / PLAYER_LANE_TRANSITION_DURATION) * 6)
        if (Math.abs(currentX - LANE_OFFSETS[0]) < 0.01) laneIndex = 0
        else if (Math.abs(currentX - LANE_OFFSETS[2]) < 0.01) laneIndex = 2
        else laneIndex = 1
      }
    }

    // ── 3. Move world ─────────────────────────────────────────────────────

    const speed = s.speed
    const dz = speed * dt
    useGameStore.getState().addWorldOffsetZ(dz)
    useGameStore.getState().addDistance(dz)
    useGameStore.getState().addScore(POINTS_PER_METER * dz)
    const worldZ = useGameStore.getState().worldOffsetZ
    const platforms = useGameStore.getState().platforms

    // ── 4. Gravity ────────────────────────────────────────────────────────

    const prevY = y
    if (!isGrounded) {
      velocityY -= GRAVITY * dt
      y += velocityY * dt
    }

    // ── 5. Landing on platform ────────────────────────────────────────────

    if (!isGrounded && velocityY <= 0) {
      const landH = findLandingHeight(platforms, currentX, prevY, y, worldZ)
      if (landH > 0 && y <= landH) {
        y = landH
        velocityY = 0
        isGrounded = true
        groundLevel = landH
        if (state === 'jump') state = 'run'
      }
    }

    // ── 6. Ground landing ─────────────────────────────────────────────────

    if (!isGrounded && y <= 0) {
      y = 0
      velocityY = 0
      isGrounded = true
      groundLevel = 0
      if (state === 'jump') state = 'run'
    }

    // ── 7. Edge detection ─────────────────────────────────────────────────

    if (isGrounded && groundLevel > 0) {
      if (!isOnPlatform(platforms, currentX, groundLevel, worldZ)) {
        isGrounded = false
        velocityY = 0
        if (state === 'slide') state = 'run'
      }
    }

    // ── 8. Update player state ────────────────────────────────────────────

    useGameStore.setState({
      playerX: currentX,
      playerY: y,
      laneIndex,
      playerState: state,
      velocityY,
      isGrounded,
      groundLevel,
    })

    // ── 9. Spawn obstacles ────────────────────────────────────────────────

    lastObstacleTime.current += dt
    if (lastObstacleTime.current >= nextObstacleInterval.current) {
      lastObstacleTime.current = 0
      nextObstacleInterval.current = getNextObstacleSpawnTime(speed)
      const obs = spawnObstacle(worldZ, useGameStore.getState().obstacles)
      if (obs) {
        const overlaps = platforms.some(
          (p) => obs.lane === p.lane && obs.z >= p.z - 3 && obs.z <= p.z + p.length + 3,
        )
        if (!overlaps) {
          useGameStore.getState().addObstacle(obs)
          // Дополнительные препятствия для плотного потока
          if (Math.random() < 0.45) {
            const extraLane = ([0, 1, 2] as LaneIndex[]).filter((l) => l !== obs.lane)[
              Math.floor(Math.random() * 2)
            ]
            const extra = spawnObstacleAt(extraLane, obs.z + (Math.random() * 2 - 1))
            const extraOverlaps = platforms.some(
              (p) =>
                extra.lane === p.lane && extra.z >= p.z - 3 && extra.z <= p.z + p.length + 3,
            )
            if (!extraOverlaps) {
              useGameStore.getState().addObstacle(extra)
            }
          }
        }
      }
    }

    // ── 10. Spawn coins ───────────────────────────────────────────────────

    lastCoinTime.current += dt
    if (lastCoinTime.current >= nextCoinInterval.current) {
      lastCoinTime.current = 0
      nextCoinInterval.current = getNextCoinSpawnTime()
      const newCoins = spawnCoins(
        worldZ,
        useGameStore.getState().coins,
        useGameStore.getState().obstacles.map((o) => o.z),
      )
      if (newCoins.length) useGameStore.getState().addCoins(newCoins)
    }

    // ── 11. Spawn platforms ───────────────────────────────────────────────

    lastPlatformTime.current += dt
    if (lastPlatformTime.current >= nextPlatformInterval.current) {
      lastPlatformTime.current = 0
      nextPlatformInterval.current = getNextPlatformSpawnTime()
      const result = spawnPlatformPattern(
        worldZ,
        useGameStore.getState().platforms,
        useGameStore.getState().obstacles.map((o) => o.z),
      )
      if (result.platforms.length) {
        useGameStore.getState().addPlatforms(result.platforms)
        if (result.coins.length) useGameStore.getState().addCoins(result.coins)
      }
    }

    // ── 12. Despawn ───────────────────────────────────────────────────────

    const cWZ = useGameStore.getState().worldOffsetZ
    useGameStore.setState({
      obstacles: useGameStore.getState().obstacles.filter((o) => o.z >= cWZ + DESPAWN_Z),
      coins: useGameStore.getState().coins.filter((c) => c.z >= cWZ + DESPAWN_Z || c.collected),
      platforms: useGameStore.getState().platforms.filter((p) => p.z + p.length >= cWZ + DESPAWN_Z),
    })

    // ── 13. Collision detection ───────────────────────────────────────────

    const ps = useGameStore.getState()
    const playerBox = getPlayerBox(
      ps.laneIndex,
      ps.playerY,
      ps.playerState as 'run' | 'jump' | 'slide',
    )
    playerBox.z = 0

    for (const ob of ps.obstacles) {
      const obSceneZ = ob.z - cWZ
      if (Math.abs(obSceneZ) > 3) continue
      if (checkObstacleCollision(playerBox, { ...ob, z: obSceneZ })) {
        playSound('hit')
        useGameStore.getState().setPlayerState('hit')
        useGameStore.getState().setPhase('gameOver')
        useGameStore.getState().saveHighScore()
        return
      }
    }

    for (const plat of ps.platforms) {
      const platSceneZ = plat.z - cWZ
      if (platSceneZ > 5 || platSceneZ + plat.length < -2) continue
      if (checkPlatformFrontCollision(playerBox, plat, platSceneZ)) {
        playSound('hit')
        useGameStore.getState().setPlayerState('hit')
        useGameStore.getState().setPhase('gameOver')
        useGameStore.getState().saveHighScore()
        return
      }
    }

    for (const coin of ps.coins) {
      if (coin.collected) continue
      const coinSceneZ = coin.z - cWZ
      if (Math.abs(coinSceneZ) > 2) continue
      const effectiveCoinY = coin.y ?? COIN_Y
      if (checkCoinCollision(playerBox, { ...coin, z: coinSceneZ }, effectiveCoinY)) {
        playSound('coin')
        useGameStore.getState().collectCoin(coin.id)
        useGameStore.getState().addCoinsCollected(1)
        useGameStore.getState().addScore(POINTS_PER_COIN)
      }
    }

    // ── 14. Speed progression ─────────────────────────────────────────────

    const dist = useGameStore.getState().distance
    const targetSpeed = Math.min(
      MAX_SPEED,
      BASE_SPEED + Math.floor(dist / SPEED_INCREASE_DISTANCE) * SPEED_INCREASE_PER_SECOND,
    )
    const smoothed = speed + (targetSpeed - speed) * 0.04
    useGameStore.getState().setSpeed(smoothed)
  })
}
