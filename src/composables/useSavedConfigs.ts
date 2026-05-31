import { ref } from 'vue'

export interface SavedConfig {
  id: string
  name: string
  state: string   // 54-char kociemba string
  savedAt: string
}

const STORAGE_KEY = 'rubik_saved_configs'

function load(): SavedConfig[] {
  try {
     
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as SavedConfig[]
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
    const n = name?.trim() ?? `Конфиг ${configs.value.length + 1}`
    const entry: SavedConfig = { id, name: n, state, savedAt: new Date().toLocaleString('ru') }
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
    if (c !== undefined) { c.name = newName; persist(configs.value) }
  }

  function exportJson() {
    const data = JSON.stringify(configs.value, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rubik-configs-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importJson(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const raw: unknown = JSON.parse(e.target?.result as string)
          if (!Array.isArray(raw)) { throw new Error('Неверный формат') }
          const parsed = raw as SavedConfig[]
          const existingIds = new Set(configs.value.map(c => c.id))
          const fresh = parsed.filter(c => c.id !== '' && c.state !== '' && !existingIds.has(c.id))
          configs.value = [...fresh, ...configs.value]
          persist(configs.value)
          resolve(fresh.length)
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)))
        }
      }
      reader.onerror = () => { reject(new Error('Ошибка чтения файла')) }
      reader.readAsText(file)
    })
  }

  return { configs, save, remove, rename, exportJson, importJson }
}
