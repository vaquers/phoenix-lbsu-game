/**
 * Пути к ассетам окружения и текстур.
 * Все системы игры берут пути отсюда.
 */

export const ASSETS = {
  skybox: {
    front: '/assets/skybox/front.jpg',
    back: '/assets/skybox/back.jpg',
    left: '/assets/skybox/left.jpg',
    right: '/assets/skybox/right.jpg',
    top: '/assets/skybox/top.jpg',
    bottom: '/assets/skybox/bottom.jpg',
  },
  textures: {
    road: '/assets/textures/road.jpg',
    wall: '/assets/textures/wall.jpg',
    obstacle: '/assets/textures/obstacle.jpg',
    coin: '/assets/textures/coin.jpg',
  },
  models: {
    player: '/assets/models/player.glb',
  },
} as const
