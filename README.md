# Lane Runner 3D

Браузерная 3D-игра в жанре endless runner: три полосы, прыжки, подкат, препятствия и монеты.

## Запуск

```bash
npm install
npm run dev
```

Открой в браузере адрес, который выведет Vite (обычно http://localhost:5173).

## Управление

- **A / D** или **← / →** — смена полосы
- **W / ↑ / Пробел** — прыжок
- **S / ↓** — подкат
- **Esc** — пауза
- **Enter** — начать заново после Game Over
- На мобильном: свайпы влево/вправо/вверх/вниз

## Где менять настройки

Все основные константы вынесены в **`src/game/utils/constants.ts`**:

| Что менять | Константы |
|------------|-----------|
| Скорость | `BASE_SPEED`, `MAX_SPEED`, `SPEED_INCREASE_PER_SECOND`, `SPEED_INCREASE_DISTANCE` |
| Частота препятствий | `OBSTACLE_SPAWN_INTERVAL_MIN`, `OBSTACLE_SPAWN_INTERVAL_MAX`, `OBSTACLE_SPAWN_DISTANCE` |
| Частота монет | `COIN_SPAWN_INTERVAL_MIN`, `COIN_SPAWN_INTERVAL_MAX`, `COIN_GROUP_SIZE_MIN`, `COIN_GROUP_SIZE_MAX` |
| Длина прыжка | `JUMP_DURATION`, `JUMP_HEIGHT` |
| Длительность подката | `SLIDE_DURATION`, `SLIDE_HEIGHT` |
| Система очков | `POINTS_PER_METER`, `POINTS_PER_COIN` |

## Архитектура

- **`src/app/`** — точка входа приложения (через `App.tsx` в `src/`)
- **`src/game/`**
  - **`components/`** — 3D-объекты: Road, Player, Obstacles, Coins, CityBackground, GameScene
  - **`systems/`** — collisionSystem, obstacleManager, coinManager, inputManager, mobileGestureHandler
  - **`hooks/`** — useGameLoop (движение, спавн, коллизии, ввод)
  - **`store/`** — Zustand (gameStore)
  - **`utils/`** — constants, types, sounds
- **`src/ui/`** — MainMenu, HUD, GameOverScreen, PauseOverlay

Состояние игры в Zustand; ввод с клавиатуры и свайпов идёт в один обработчик; игровой цикл в `useGameLoop` через `useFrame` R3F.

## Сборка

```bash
npm run build
npm run preview
```
