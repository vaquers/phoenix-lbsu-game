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

const ROTATION_FIX: Record<string, number> = {
  granny: Math.PI,
  robototechnic: Math.PI,
  greenwoman: Math.PI,
  musculman: Math.PI,
  bigman: Math.PI,
  mouse: Math.PI,
}

export function CharacterVisual({ character, variant = 'game' }: { character: CharacterSpec; variant?: Variant }) {
  const rootRef = useRef<Group>(null)
  const modelRef = useRef<Group | null>(null)
  const visualRef = useRef<Group | null>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const actionRef = useRef<AnimationAction | null>(null)
  const appliedRotationY = useRef<number | null>(null)
  const lastRotationCheck = useRef(0)
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

        const rotationY = ROTATION_FIX[character.id] ?? Math.PI
        const visualNode =
          scene.children.length === 1 ? (scene.children[0] as Group) : scene
        visualRef.current = visualNode
        // Reset orientation, then apply final upright + facing rotation
        visualNode.rotation.set(-Math.PI / 2, Math.PI, Math.PI)
        appliedRotationY.current = Math.PI

        const baseOffset = variant === 'shop' ? character.shopGroundOffset : character.gameGroundOffset
        let yOffset = baseOffset
        let minY: number | undefined
        try {
          visualNode.updateMatrixWorld(true)
          const box = new Box3().setFromObject(visualNode)
          minY = box.min?.y
          if (Number.isFinite(minY)) {
            yOffset = -minY + baseOffset
          } else {
            console.warn('[CharacterVisual] BBox minY invalid, using base offset', box.min)
          }
        } catch (e) {
          console.warn('[CharacterVisual] BBox failed, using base offset', e)
        }

        scene.position.set(0, yOffset, 0)
        scene.scale.setScalar(variant === 'shop' ? character.shopScale : character.gameScale)
        console.log('[CharacterVisual] final rotation:', visualNode.rotation.x, visualNode.rotation.y, visualNode.rotation.z, character.id)
        console.log('[CharacterVisual] final minY:', minY, 'yOffset:', yOffset)

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
              const rotationY = ROTATION_FIX[fallback.id] ?? Math.PI
              const visualNode =
                scene.children.length === 1 ? (scene.children[0] as Group) : scene
              visualRef.current = visualNode
              visualNode.rotation.set(-Math.PI / 2, Math.PI, Math.PI)
              appliedRotationY.current = Math.PI

              const baseOffset =
                variant === 'shop' ? fallback.shopGroundOffset : fallback.gameGroundOffset
              let yOffset = baseOffset
              let minY: number | undefined
              try {
                visualNode.updateMatrixWorld(true)
                const box = new Box3().setFromObject(visualNode)
                minY = box.min?.y
                if (Number.isFinite(minY)) {
                  yOffset = -minY + baseOffset
                } else {
                  console.warn('[CharacterVisual] Fallback BBox minY invalid, using base offset', box.min)
                }
              } catch (e) {
                console.warn('[CharacterVisual] Fallback BBox failed, using base offset', e)
              }
              scene.position.set(0, yOffset, 0)
              scene.scale.setScalar(variant === 'shop' ? fallback.shopScale : fallback.gameScale)
              console.log('[CharacterVisual] final rotation:', visualNode.rotation.x, visualNode.rotation.y, visualNode.rotation.z, fallback.id)
              console.log('[CharacterVisual] final minY:', minY, 'yOffset:', yOffset)
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
      visualRef.current = null
      appliedRotationY.current = null
      mixerRef.current = null
      actionRef.current = null
    }
  }, [character, animMap, gl, variant])

  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta)
    if (visualRef.current && appliedRotationY.current !== null) {
      const now = performance.now()
      if (now - lastRotationCheck.current > 1000) {
        lastRotationCheck.current = now
        if (visualRef.current.rotation.y !== appliedRotationY.current) {
          console.warn(
            '[CharacterVisual] rotation overwritten:',
            visualRef.current.rotation.y,
            'expected',
            appliedRotationY.current,
            character.id,
          )
        }
      }
    }
  })

  return <group ref={rootRef} />
}
