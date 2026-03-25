import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export interface User {
  id: string
  name: string
  avatarUrl?: string
  coins: number
  bestScore: number
  totalGamesPlayed: number
}

export interface MerchItem {
  id: string
  title: string
  description: string
  image: string
  price: number
  available: boolean
}

export interface Purchase {
  id: string
  userId: string
  itemId: string
  type: 'merch' | 'display'
  cost: number
  createdAt: string
}

export interface DisplaySubmission {
  id: string
  userId: string
  userName: string
  image: string
  text: string
  composition?: {
    photos: Array<{
      id: string
      imageUri: string
      croppedImageUri?: string
      crop: { x: number; y: number; width: number; height: number }
      displayMode: 'square'
    }>
    textOverlay: {
      text: string
      fontStyle?: 'normal' | 'italic'
      fontWeight?: number
      fontSize: number
      fontSizePercent?: number
      color: string
      xPercent: number
      yPercent: number
      align?: 'center' | 'left' | 'right'
      rotation?: number
      opacity?: number
    }
  }
  cost: number
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface TeamPhoto {
  id: string
  image: string
  caption: string
  order: number
}

interface DataState {
  users: Record<string, User>
  purchases: Purchase[]
  displaySubmissions: DisplaySubmission[]
}

const DATA_DIR = path.resolve(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'appdata.json')

const DISPLAY_SUBMISSION_COST = 50

const MERCH_CATALOG: MerchItem[] = [
  {
    id: 'merch-1',
    title: 'Phoenix Sticker Pack',
    description: 'Набор из 5 фирменных стикеров Phoenix',
    image: '/merch/stickers.png',
    price: 30,
    available: true,
  },
  {
    id: 'merch-2',
    title: 'Phoenix Значок',
    description: 'Металлический значок с логотипом',
    image: '/merch/pin.png',
    price: 50,
    available: true,
  },
  {
    id: 'merch-3',
    title: 'Phoenix Браслет',
    description: 'Силиконовый браслет Phoenix LBSU',
    image: '/merch/bracelet.png',
    price: 40,
    available: true,
  },
  {
    id: 'merch-4',
    title: 'Phoenix Кепка',
    description: 'Бейсболка с вышитым логотипом',
    image: '/merch/cap.png',
    price: 120,
    available: true,
  },
  {
    id: 'merch-5',
    title: 'Phoenix Шоппер',
    description: 'Тканевая сумка-шоппер',
    image: '/merch/bag.png',
    price: 80,
    available: true,
  },
  {
    id: 'merch-6',
    title: 'Phoenix Футболка',
    description: 'Чёрная футболка с принтом Phoenix',
    image: '/merch/tshirt.png',
    price: 200,
    available: true,
  },
]

const TEAM_PHOTOS: TeamPhoto[] = [
  { id: 'tp-1', image: '/team/team1.jpg', caption: 'Phoenix Team — Together we rise!', order: 1 },
  { id: 'tp-2', image: '/team/team2.jpg', caption: 'Рабочий процесс', order: 2 },
  { id: 'tp-3', image: '/team/team3.jpg', caption: 'Наша команда на мероприятии', order: 3 },
  { id: 'tp-4', image: '/team/team4.jpg', caption: 'Мозговой штурм', order: 4 },
  { id: 'tp-5', image: '/team/team5.jpg', caption: 'Победа!', order: 5 },
]

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function createEmptyState(): DataState {
  return { users: {}, purchases: [], displaySubmissions: [] }
}

export class DataStore {
  private state: DataState

  constructor() {
    ensureDataDir()
    this.state = this.load()
  }

  private load(): DataState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8')
        const parsed = JSON.parse(raw) as DataState
        if (parsed.users && parsed.purchases && parsed.displaySubmissions) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Failed to load data, starting fresh', e)
    }
    const empty = createEmptyState()
    this.save(empty)
    return empty
  }

  private save(state?: DataState) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(state || this.state, null, 2), 'utf8')
    } catch (e) {
      console.error('Failed to save data', e)
    }
  }

  private persist() {
    this.save(this.state)
  }

  createUser(name: string, avatarUrl?: string): User {
    const id = crypto.randomUUID()
    const user: User = {
      id,
      name,
      avatarUrl,
      coins: 0,
      bestScore: 0,
      totalGamesPlayed: 0,
    }
    this.state.users[id] = user
    this.persist()
    return user
  }

  getUser(id: string): User | undefined {
    return this.state.users[id]
  }

  updateUserName(id: string, name: string): User | undefined {
    const user = this.state.users[id]
    if (!user) return undefined
    user.name = name
    this.persist()
    return user
  }

  updateUserAvatar(id: string, avatarUrl: string): User | undefined {
    const user = this.state.users[id]
    if (!user) return undefined
    user.avatarUrl = avatarUrl
    this.persist()
    return user
  }

  recordGameResult(id: string, score: number, coinsEarned: number): User | undefined {
    const user = this.state.users[id]
    if (!user) return undefined
    user.totalGamesPlayed++
    user.bestScore = Math.max(user.bestScore, Math.floor(score))
    user.coins += Math.floor(coinsEarned)
    this.persist()
    return user
  }

  getLeaderboard(): Array<{ userId: string; userName: string; avatarUrl?: string; score: number; rank: number }> {
    const entries = Object.values(this.state.users)
      .filter((u) => u.bestScore > 0)
      .sort((a, b) => b.bestScore - a.bestScore)
      .map((u, i) => ({
        userId: u.id,
        userName: u.name,
        avatarUrl: u.avatarUrl,
        score: Math.floor(u.bestScore),
        rank: i + 1,
      }))
    return entries
  }

  getMerch(): MerchItem[] {
    return MERCH_CATALOG
  }

  purchaseMerch(userId: string, itemId: string): Purchase | { error: string } {
    const user = this.state.users[userId]
    if (!user) return { error: 'User not found' }

    const item = MERCH_CATALOG.find((m) => m.id === itemId)
    if (!item) return { error: 'Item not found' }
    if (!item.available) return { error: 'Item not available' }
    if (user.coins < item.price) return { error: 'Not enough coins' }

    user.coins -= item.price
    const purchase: Purchase = {
      id: crypto.randomUUID(),
      userId,
      itemId,
      type: 'merch',
      cost: item.price,
      createdAt: new Date().toISOString(),
    }
    this.state.purchases.push(purchase)
    this.persist()
    return purchase
  }

  createDisplaySubmission(
    userId: string,
    image: string,
    text: string,
    composition?: DisplaySubmission['composition'],
  ): DisplaySubmission | { error: string } {
    const user = this.state.users[userId]
    if (!user) return { error: 'User not found' }
    if (user.coins < DISPLAY_SUBMISSION_COST) return { error: 'Not enough coins' }

    user.coins -= DISPLAY_SUBMISSION_COST
    const submission: DisplaySubmission = {
      id: crypto.randomUUID(),
      userId,
      userName: user.name,
      image,
      text,
      composition,
      cost: DISPLAY_SUBMISSION_COST,
      createdAt: new Date().toISOString(),
      status: 'approved',
    }
    this.state.displaySubmissions.push(submission)
    this.persist()
    return submission
  }

  getDisplaySubmissions(): DisplaySubmission[] {
    return this.state.displaySubmissions.filter((s) => s.status === 'approved')
  }

  getTeamPhotos(): TeamPhoto[] {
    return TEAM_PHOTOS
  }
}
