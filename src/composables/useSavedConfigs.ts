import { ref } from 'vue'

export interface SavedConfig {
  id: string
  name: string
  state: string   // 54-char kociemba string
  savedAt: string // ISO date string
}

const STORAGE_KEY = 'rubik_saved_configs'

function load(): SavedConfig[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function persist(list: SavedConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function useSavedConfigs() {
  const configs = ref<SavedConfig[]>(load())

  function save(state: string, name?: string) {
    const id = crypto.randomUUID()
    const n = name?.trim() || `Конфиг ${configs.value.length + 1}`
    const entry: SavedConfig = {
      id,
      name: n,
      state,
      savedAt: new Date().toLocaleString('ru'),
    }
    configs.value.unshift(entry)
    persist(configs.value)
    return entry
  }

  function remove(id: string) {
    configs.value = configs.value.filter(c => c.id !== id)
    persist(configs.value)
  }

  function rename(id: string, newName: string) {
    const c = configs.value.find(x => x.id === id)
    if (c) { c.name = newName; persist(configs.value) }
  }

  return { configs, save, remove, rename }
}
