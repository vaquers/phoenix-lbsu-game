import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AnimationMixer, Box3, type Group, type AnimationAction } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import type { CharacterSpec, CharacterAnimations } from '../characters/types'
import { DEFAULT_CHARACTER_ID, getCharacterById } from '../characters/catalog'

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

type Variant = 'game' | 'shop'

export function CharacterVisual({ character, variant = 'game' }: { character: CharacterSpec; variant?: Variant }) {
  const rootRef = useRef<Group>(null)
  const modelRef = useRef<Group | null>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const actionRef = useRef<AnimationAction | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const fallback = getCharacterById(DEFAULT_CHARACTER_ID)
  const { gl } = useThree()

  const animMap = useMemo(() => {
    const overrides = variant === 'shop' ? character.shopAnimations : character.gameAnimations
    return { ...DEFAULT_ANIM_MAP, ...(overrides ?? {}) }
  }, [character.gameAnimations, character.shopAnimations, variant])

  useEffect(() => {
    let mounted = true
    let ktx2Loader: KTX2Loader | null = null
    const modelPath = variant === 'shop' ? character.shopModelPath : character.gameModelPath
    if (!modelPath) {
      setLoadState('error')
      return
    }

    const loader = new GLTFLoader()
    ktx2Loader = new KTX2Loader()
      .setTranscoderPath('/basis/')
      .detectSupport(gl)
    loader.setKTX2Loader(ktx2Loader)
    loader.setMeshoptDecoder(MeshoptDecoder)
    setLoadState('loading')
    console.info('[CharacterVisual] Loading', character.id, modelPath)
    loader.load(
      modelPath,
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

        const baseOffset = variant === 'shop' ? character.shopGroundOffset : character.gameGroundOffset
        let yOffset = baseOffset
        try {
          scene.updateMatrixWorld(true)
          const box = new Box3().setFromObject(scene)
          const minY = box.min?.y
          if (Number.isFinite(minY)) {
            yOffset = -minY + baseOffset
          } else {
            console.warn('[CharacterVisual] BBox minY invalid, using base offset', box.min)
          }
        } catch (e) {
          console.warn('[CharacterVisual] BBox failed, using base offset', e)
        }

        scene.position.set(0, yOffset, 0)
        scene.rotation.y = variant === 'shop' ? character.shopRotationY : character.gameRotationY
        scene.scale.setScalar(variant === 'shop' ? character.shopScale : character.gameScale)

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
      (evt) => {
        if (evt.total) {
          const pct = ((evt.loaded / evt.total) * 100).toFixed(1)
          console.info('[CharacterVisual] Progress', character.id, `${pct}%`)
        } else if (evt.loaded) {
          console.info('[CharacterVisual] Progress', character.id, `${evt.loaded} bytes`)
        }
      },
      (err) => {
        if (!mounted) return
        setLoadState('error')
        console.error('[CharacterVisual] Failed', character.id, modelPath, err)
        if (character.id !== fallback.id) {
          console.warn('[CharacterVisual] Fallback to default:', fallback.id)
          const fallbackPath = variant === 'shop' ? fallback.shopModelPath : fallback.gameModelPath
          if (!fallbackPath) return
          loader.load(
            fallbackPath,
            (gltf) => {
              if (!mounted) return
              const scene = gltf.scene as Group
              const baseOffset =
                variant === 'shop' ? fallback.shopGroundOffset : fallback.gameGroundOffset
              let yOffset = baseOffset
              try {
                scene.updateMatrixWorld(true)
                const box = new Box3().setFromObject(scene)
                const minY = box.min?.y
                if (Number.isFinite(minY)) {
                  yOffset = -minY + baseOffset
                } else {
                  console.warn('[CharacterVisual] Fallback BBox minY invalid, using base offset', box.min)
                }
              } catch (e) {
                console.warn('[CharacterVisual] Fallback BBox failed, using base offset', e)
              }
              scene.position.set(0, yOffset, 0)
              scene.rotation.y = variant === 'shop' ? fallback.shopRotationY : fallback.gameRotationY
              scene.scale.setScalar(variant === 'shop' ? fallback.shopScale : fallback.gameScale)
              rootRef.current?.add(scene)
              modelRef.current = scene
              setLoadState('loaded')
            },
            undefined,
            (fallbackErr) => {
              console.error('[CharacterVisual] Default fallback failed', fallbackErr)
            },
          )
        }
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
      if (ktx2Loader) {
        ktx2Loader.dispose()
      }
      modelRef.current = null
      mixerRef.current = null
      actionRef.current = null
    }
  }, [character, animMap, gl, variant])

  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta)
  })

  return <group ref={rootRef} />
}
