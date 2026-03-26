# Lane Runner 3D

Браузерная 3D-игра в жанре endless runner: три полосы, прыжки, подкат, препятствия, платформы и монеты.

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

## Игровые ассеты и модели

### Модель игрока (.glb)

Игра поддерживает загрузку пользовательской модели игрока:

- положи файл сюда: `public/assets/models/player.glb`
- при наличии файла будет автоматически использована 3D‑модель
- если файла нет — будет применён процедурный fallback

Рекомендуемый пайплайн экспорта из Blender в glTF:

1. Открой `.blend`.
2. Настрой масштаб (обычно удобно, чтобы высота персонажа была ~1–1.4 единиц).
3. Выдели модель → `File` → `Export` → `glTF 2.0 (.glb)`.
4. Экспортируй в `public/assets/models/player.glb`.

### Skybox (опционально)

Папка: `public/assets/skybox/`  
Файлы: `front.jpg, back.jpg, left.jpg, right.jpg, top.jpg, bottom.jpg`  
Если файлов нет — используется дефолтный цвет и fog.

### Текстуры (опционально)

Папка: `public/assets/textures/`  
Файлы: `road.jpg, wall.jpg, obstacle.jpg, coin.jpg`

## Подсказки по ассетам (ручное добавление)

- Небо / HDRI: Poly Haven (CC0)
- Город / здания: Kenney City Kit (CC0)
- Доп. пропсы: Quaternius (CC0)

Все ссылки и лицензии смотри в отчёте ассетов.

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
