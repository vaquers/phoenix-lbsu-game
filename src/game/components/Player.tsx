import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { AnimationMixer, Box3, Vector3, type Group, type AnimationAction, type AnimationClip } from 'three'
import { useGameStore } from '../store/gameStore'
import { SLIDE_HEIGHT, PLAYER_ROTATION_Y } from '../utils/constants'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const MODEL_URL = new URL('../../../assets/models/granny.glb', import.meta.url).href
const MODEL_SCALE = 0.85
const MODEL_Y_PADDING = 0.02

type ActionName = 'run' | 'jump' | 'idle' | 'slide'

export function Player() {
  const meshRef = useRef<Group>(null)
  const runPhase = useRef(0)
  const [model, setModel] = useState<Group | null>(null)
  const [modelYOffset, setModelYOffset] = useState(0)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const actionsRef = useRef<Record<ActionName, AnimationAction | null>>({
    run: null,
    jump: null,
    idle: null,
    slide: null,
  })
  const currentAction = useRef<ActionName>('run')
  const clipsRef = useRef<AnimationClip[]>([])

  useEffect(() => {
    let mounted = true
    const loader = new GLTFLoader()
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (!mounted) return
        gltf.scene.traverse((obj: any) => {
          if (obj && obj.isMesh) {
            obj.castShadow = true
            obj.receiveShadow = true
          }
        })
        const box = new Box3().setFromObject(gltf.scene)
        const min = new Vector3()
        box.getMin(min)
        setModelYOffset(-min.y + MODEL_Y_PADDING)
        clipsRef.current = gltf.animations ?? []
        setModel(gltf.scene as Group)
      },
      undefined,
      () => {
        if (mounted) setModel(null)
      },
    )
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!model) return
    const mixer = new AnimationMixer(model)
    mixerRef.current = mixer

    const clips = clipsRef.current
    const findClip = (name: string) =>
      clips.find((c) => c.name.toLowerCase().includes(name))

    const runClip = findClip('run') ?? findClip('walk') ?? clips[0]
    const jumpClip = findClip('jump')
    const idleClip = findClip('idle')
    const slideClip = findClip('slide')

    actionsRef.current.run = runClip ? mixer.clipAction(runClip) : null
    actionsRef.current.jump = jumpClip ? mixer.clipAction(jumpClip) : null
    actionsRef.current.idle = idleClip ? mixer.clipAction(idleClip) : null
    actionsRef.current.slide = slideClip ? mixer.clipAction(slideClip) : null

    const start = actionsRef.current.run
    if (start) {
      start.reset().fadeIn(0.1).play()
      currentAction.current = 'run'
    }

    return () => {
      mixer.stopAllAction()
      mixerRef.current = null
    }
  }, [model])

  useFrame((_, delta) => {
    const { playerX, playerY, playerState } = useGameStore.getState()
    if (!meshRef.current) return

    meshRef.current.position.x = playerX
    meshRef.current.position.z = 0

    if (playerState === 'slide') {
      meshRef.current.scale.y = 0.5
      meshRef.current.position.y = playerY + SLIDE_HEIGHT * 0.5
    } else {
      meshRef.current.scale.y = 1
      if (playerState === 'run') {
        runPhase.current += delta * 12
        const bounce = Math.abs(Math.sin(runPhase.current)) * 0.08
        meshRef.current.position.y = playerY + bounce
      } else {
        meshRef.current.position.y = playerY
      }
    }

    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }

    const nextAction: ActionName =
      playerState === 'jump'
        ? 'jump'
        : playerState === 'slide'
          ? 'slide'
          : 'run'

    if (nextAction !== currentAction.current) {
      const prev = actionsRef.current[currentAction.current]
      const next = actionsRef.current[nextAction] ?? actionsRef.current.run
      if (next && next !== prev) {
        prev?.fadeOut(0.12)
        next.reset().fadeIn(0.12).play()
      }
      currentAction.current = nextAction
    }
  })

  return (
    <group ref={meshRef}>
      {model && (
        <primitive
          object={model}
          scale={MODEL_SCALE}
          position={[0, modelYOffset, 0]}
          rotation={[0, PLAYER_ROTATION_Y + Math.PI, 0]}
        />
      )}
    </group>
  )
}
