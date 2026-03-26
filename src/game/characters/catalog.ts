import type { CharacterSpec } from './types'

export const CHARACTER_CATALOG: CharacterSpec[] = [
  {
    id: 'phoenix',
    name: 'Phoenix Runner',
    price: 0,
    isDefault: true,
    assetSourceType: 'local_glb',
    assetPath: '/assets/models/phoenix.glb',
    scale: 0.9,
    rotationY: Math.PI,
    groundOffset: 0.02,
    animations: { run: ['run', 'walk'], idle: ['idle'], jump: ['jump'], slide: ['slide'] },
    thumbnail: '/assets/characters/phoenix.png',
  },
  {
    id: 'granny',
    name: 'Granny Runner',
    price: 150,
    assetSourceType: 'local_glb',
    assetPath: '/assets/models/granny.glb',
    scale: 0.85,
    rotationY: Math.PI,
    groundOffset: 0.02,
    animations: { run: ['run', 'walk'], idle: ['idle'], jump: ['jump'], slide: ['slide'] },
    thumbnail: '/assets/characters/granny.png',
  },
  {
    id: 'runner-bot',
    name: 'Runner Bot',
    price: 220,
    assetSourceType: 'local_glb',
    assetPath: '/assets/models/runner-bot.glb',
    scale: 0.95,
    rotationY: Math.PI,
    groundOffset: 0.02,
    animations: { run: ['run', 'walk'], idle: ['idle'], jump: ['jump'], slide: ['slide'] },
    thumbnail: '/assets/characters/runner-bot.png',
  },
  {
    id: 'street-kid',
    name: 'Street Kid',
    price: 240,
    assetSourceType: 'local_glb',
    assetPath: '/assets/models/street-kid.glb',
    scale: 0.9,
    rotationY: Math.PI,
    groundOffset: 0.02,
    animations: { run: ['run', 'walk'], idle: ['idle'], jump: ['jump'], slide: ['slide'] },
    thumbnail: '/assets/characters/street-kid.png',
  },
  {
    id: 'mad-cock',
    name: 'Running Mad Cock',
    price: 300,
    assetSourceType: 'external_reference',
    assetPath: '/assets/models/running-mad-cock.glb',
    externalSource: {
      name: 'Sketchfab',
      url: 'https://sketchfab.com/models/2b3cdc1bf6e34df289b3aeda1a1fd288',
      notes: 'Требуется локальный файл (iframe нельзя использовать как ассет).',
    },
    scale: 0.9,
    rotationY: Math.PI,
    groundOffset: 0.02,
    animations: { run: ['run', 'walk'], idle: ['idle'], jump: ['jump'], slide: ['slide'] },
    requiresLocalAsset: true,
    thumbnail: '/assets/characters/mad-cock.png',
  },
  {
    id: 'skater',
    name: 'Sky Skater',
    price: 200,
    assetSourceType: 'local_glb',
    assetPath: '/assets/models/skater.glb',
    scale: 0.92,
    rotationY: Math.PI,
    groundOffset: 0.02,
    animations: { run: ['run', 'walk'], idle: ['idle'], jump: ['jump'], slide: ['slide'] },
    thumbnail: '/assets/characters/skater.png',
  },
]

export const DEFAULT_CHARACTER_ID =
  CHARACTER_CATALOG.find((c) => c.isDefault)?.id ?? CHARACTER_CATALOG[0]?.id ?? 'phoenix'

export function getCharacterById(id: string) {
  return CHARACTER_CATALOG.find((c) => c.id === id) ?? CHARACTER_CATALOG[0]
}
