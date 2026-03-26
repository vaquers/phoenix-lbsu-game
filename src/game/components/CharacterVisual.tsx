import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { AnimationMixer, Box3, Vector3, type Group, type AnimationAction } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import type { CharacterSpec, CharacterAnimations } from '../characters/types'

type LoadState = 'idle' | 'loading' | 'loaded' | 'error'

const DEFAULT_ANIM_MAP: CharacterAnimations = {
  run: ['run', 'walk'],
  idle: ['idle'],
  jump: ['jump'],
  slide: ['slide'],
}

function findClipName(names: string[] | undefined, clips: any[]) {
  if (!names?.length) return null
  const lower = names.map((n) => n.toLowerCase())
  return clips.find((c) => lower.some((n) => c.name.toLowerCase().includes(n))) ?? null
}

export function CharacterVisual({ character }: { character: CharacterSpec }) {
  const rootRef = useRef<Group>(null)
  const modelRef = useRef<Group | null>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const actionRef = useRef<AnimationAction | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('idle')

  const animMap = useMemo(
    () => ({ ...DEFAULT_ANIM_MAP, ...(character.animations ?? {}) }),
    [character.animations],
  )

  useEffect(() => {
    let mounted = true
    if (character.assetSourceType === 'primitive') {
      setLoadState('error')
      return
    }
    if (!character.assetPath) {
      setLoadState('error')
      return
    }

    const loader = new GLTFLoader()
    setLoadState('loading')
    console.info('[CharacterVisual] Loading', character.id, character.assetPath)
    loader.load(
      character.assetPath,
      (gltf) => {
        if (!mounted) return
        const scene = gltf.scene as Group
        scene.traverse((obj: any) => {
          if (obj && obj.isMesh) {
            obj.castShadow = true
            obj.receiveShadow = true
            obj.frustumCulled = false
          }
        })

        const box = new Box3().setFromObject(scene)
        const min = new Vector3()
        box.getMin(min)
        const yOffset = -min.y + (character.groundOffset ?? 0)

        scene.position.set(0, yOffset, 0)
        scene.rotation.y = character.rotationY
        scene.scale.setScalar(character.scale)

        if (rootRef.current) {
          rootRef.current.add(scene)
        }
        modelRef.current = scene

        if (gltf.animations?.length) {
          const mixer = new AnimationMixer(scene)
          mixerRef.current = mixer
          const clips = gltf.animations
          const runClip =
            findClipName(animMap.run, clips) ||
            findClipName(animMap.idle, clips) ||
            clips[0]
          if (runClip) {
            const action = mixer.clipAction(runClip)
            action.reset().fadeIn(0.1).play()
            actionRef.current = action
          }
        }

        setLoadState('loaded')
        console.info('[CharacterVisual] Loaded', character.id)
      },
      undefined,
      (err) => {
        if (!mounted) return
        setLoadState('error')
        console.error('[CharacterVisual] Failed', character.id, character.assetPath, err)
      },
    )

    return () => {
      mounted = false
      if (modelRef.current && rootRef.current) {
        rootRef.current.remove(modelRef.current)
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
        mixerRef.current.uncacheRoot(modelRef.current || rootRef.current || undefined)
      }
      modelRef.current = null
      mixerRef.current = null
      actionRef.current = null
    }
  }, [character, animMap])

  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta)
  })

  if (character.assetSourceType === 'primitive' || loadState !== 'loaded') {
    return (
      <group ref={rootRef}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 1.1, 0.4]} />
          <meshStandardMaterial color="#ff7b54" />
        </mesh>
      </group>
    )
  }

  return <group ref={rootRef} />
}
