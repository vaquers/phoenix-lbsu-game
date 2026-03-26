import type { CharacterSpec } from './types'

const modelUrl = (file: string) =>
  new URL(`../../../assets/models/${file}`, import.meta.url).href

export const CHARACTER_CATALOG: CharacterSpec[] = [
  {
    id: 'robototechnic',
    name: 'Robototechnic',
    price: 0,
    isDefault: true,
    isUnlockedByDefault: true,
    modelPath: modelUrl('robototechnic.glb'),
    scale: 0.9,
    rotationY: Math.PI,
    groundOffset: 0.02,
    animations: { run: ['run', 'walk'], idle: ['idle'], jump: ['jump'], slide: ['slide'] },
  },
  {
    id: 'granny',
    name: 'Granny',
    price: 150,
    modelPath: modelUrl('granny.glb'),
    scale: 0.85,
    rotationY: Math.PI,
    groundOffset: 0.02,
    animations: { run: ['run', 'walk'], idle: ['idle'], jump: ['jump'], slide: ['slide'] },
  },
  {
    id: 'bigman',
    name: 'Big Man',
    price: 180,
    modelPath: modelUrl('bigman.glb'),
    scale: 0.9,
    rotationY: Math.PI,
    groundOffset: 0.02,
    animations: { run: ['run', 'walk'], idle: ['idle'], jump: ['jump'], slide: ['slide'] },
  },
  {
    id: 'greenwoman',
    name: 'Green Woman',
    price: 200,
    modelPath: modelUrl('greenwoman.glb'),
    scale: 0.88,
    rotationY: Math.PI,
    groundOffset: 0.02,
    animations: { run: ['run', 'walk'], idle: ['idle'], jump: ['jump'], slide: ['slide'] },
  },
  {
    id: 'mouse',
    name: 'Mouse',
    price: 160,
    modelPath: modelUrl('mouse.glb'),
    scale: 0.9,
    rotationY: Math.PI,
    groundOffset: 0.02,
    animations: { run: ['run', 'walk'], idle: ['idle'], jump: ['jump'], slide: ['slide'] },
  },
  {
    id: 'musculman',
    name: 'Musculman',
    price: 220,
    modelPath: modelUrl('musculman.glb'),
    scale: 0.9,
    rotationY: Math.PI,
    groundOffset: 0.02,
    animations: { run: ['run', 'walk'], idle: ['idle'], jump: ['jump'], slide: ['slide'] },
  },
]

export const DEFAULT_CHARACTER_ID =
  CHARACTER_CATALOG.find((c) => c.isDefault)?.id ?? 'robototechnic'

export function getCharacterById(id: string) {
  return CHARACTER_CATALOG.find((c) => c.id === id) ?? CHARACTER_CATALOG[0]
}
