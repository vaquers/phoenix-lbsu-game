import { useEffect, useRef } from 'react'
import type { Group, AnimationMixer, AnimationAction } from 'three'
import { AnimationMixer as ThreeAnimationMixer, Box3, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useFrame } from '@react-three/fiber'

const MODEL_URL = '/assets/models/phoenix.glb'
const MODEL_SCALE = 0.9
const MODEL_Y_PADDING = 0.02

type Props = {
  onLoaded?: () => void
}

export function PlayerModel({ onLoaded }: Props) {
  const rootRef = useRef<Group>(null)
  const modelRef = useRef<Group | null>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const actionRef = useRef<AnimationAction | null>(null)

  useEffect(() => {
    let mounted = true
    const loader = new GLTFLoader()
    console.info('[PlayerModel] Loading:', MODEL_URL)
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (!mounted) return
        console.info('[PlayerModel] Loaded:', MODEL_URL, gltf)

        const scene = gltf.scene as Group
        scene.traverse((obj: any) => {
          if (obj && obj.isMesh) {
            obj.castShadow = true
            obj.receiveShadow = true
            obj.frustumCulled = false
          }
        })

        // Normalize height to stand on the ground
        const box = new Box3().setFromObject(scene)
        const min = new Vector3()
        box.getMin(min)
        scene.position.set(0, -min.y + MODEL_Y_PADDING, 0)

        // Rotate to face forward (away from camera)
        scene.rotation.y = Math.PI
        scene.scale.setScalar(MODEL_SCALE)

        // Attach to root
        if (rootRef.current) {
          rootRef.current.add(scene)
        }
        modelRef.current = scene

        // Animation
        if (gltf.animations && gltf.animations.length) {
          const mixer = new ThreeAnimationMixer(scene)
          mixerRef.current = mixer
          const clip = gltf.animations.find((c) => c.name.toLowerCase().includes('run'))
            ?? gltf.animations.find((c) => c.name.toLowerCase().includes('walk'))
            ?? gltf.animations[0]
          if (clip) {
            const action = mixer.clipAction(clip)
            action.reset().fadeIn(0.1).play()
            actionRef.current = action
          }
        }

        onLoaded?.()
      },
      undefined,
      (err) => {
        console.error('[PlayerModel] Failed to load:', MODEL_URL, err)
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
  }, [onLoaded])

  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta)
  })

  return <group ref={rootRef} />
}
