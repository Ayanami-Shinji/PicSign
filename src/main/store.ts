import type Store from 'electron-store'

interface StoreSchema {
  photographer: string
  barHeight: number | 'auto'
  fontFamily: string
  fontSize: number | 'auto'
  fontColor: string
  lastDirectory: string
  windowBounds: { width: number; height: number; x?: number; y?: number }
}

const defaults: StoreSchema = {
  photographer: '',
  barHeight: 'auto',
  fontFamily: 'LXGW WenKai, PingFang SC, Microsoft YaHei, sans-serif',
  fontSize: 'auto',
  fontColor: '#2c2c2c',
  lastDirectory: '',
  windowBounds: { width: 1100, height: 750 },
}

let store: Store<StoreSchema> | null = null

export async function initStore(): Promise<void> {
  const { default: Store } = await import('electron-store')
  store = new Store<StoreSchema>({ name: 'config', defaults })
}

export function getSettings(): StoreSchema {
  if (!store) return { ...defaults }
  return {
    photographer: store.get('photographer'),
    barHeight: store.get('barHeight'),
    fontFamily: store.get('fontFamily'),
    fontSize: store.get('fontSize'),
    fontColor: store.get('fontColor'),
    lastDirectory: store.get('lastDirectory'),
    windowBounds: store.get('windowBounds'),
  }
}

export function updateSettings(partial: Partial<StoreSchema>): void {
  if (!store) return
  for (const [key, value] of Object.entries(partial)) {
    store.set(key as keyof StoreSchema, value)
  }
}

export { store }
