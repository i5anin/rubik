<script setup lang="ts">
import { ref } from 'vue'
import type { SavedConfig } from '../composables/useSavedConfigs'

defineProps<{ configs: SavedConfig[] }>()
const emit = defineEmits<{
  (e: 'load', state: string): void
  (e: 'remove', id: string): void
  (e: 'rename', id: string, name: string): void
  (e: 'export'): void
  (e: 'import', file: File): void
}>()

const editingId = ref<string | null>(null)
const editingName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function startEdit(c: SavedConfig) {
  editingId.value = c.id
  editingName.value = c.name
}

function commitEdit(id: string) {
  if (editingName.value.trim()) emit('rename', id, editingName.value.trim())
  editingId.value = null
}

function triggerImport() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('import', file)
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="saved">
    <!-- Заголовок + кнопки экспорт/импорт -->
    <div class="saved-header">
      <div class="saved-title-wrap">
        <span class="saved-title">Сохранённые</span>
        <span v-if="configs.length" class="saved-count">{{ configs.length }}</span>
      </div>
      <div class="io-btns">
        <button
          class="io-btn"
          :disabled="!configs.length"
          title="Скачать все конфиги как .json"
          @click="emit('export')"
        >
          ⬇ Экспорт
        </button>
        <button class="io-btn io-import" title="Загрузить конфиги из .json" @click="triggerImport">
          ⬆ Импорт
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          style="display:none"
          @change="onFileChange"
        />
      </div>
    </div>

    <!-- Список -->
    <div v-if="configs.length" class="saved-list">
      <div v-for="c in configs" :key="c.id" class="saved-item">
        <div class="saved-name-wrap">
          <input
            v-if="editingId === c.id"
            v-model="editingName"
            class="saved-input"
            @keyup.enter="commitEdit(c.id)"
            @blur="commitEdit(c.id)"
            autofocus
          />
          <span v-else class="saved-name" @dblclick="startEdit(c)" title="Двойной клик — переименовать">
            {{ c.name }}
          </span>
          <span class="saved-date">{{ c.savedAt }}</span>
        </div>

        <div class="saved-actions">
          <button class="act-btn act-load" @click="emit('load', c.state)" title="Загрузить на куб">↩</button>
          <button class="act-btn act-edit" @click="startEdit(c)" title="Переименовать">✏</button>
          <button class="act-btn act-del" @click="emit('remove', c.id)" title="Удалить">✕</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-hint">
      Нет сохранённых конфигураций.<br/>
      Нажми <strong>💾 Сохранить</strong> после ввода куба.
    </div>
  </div>
</template>

<style scoped>
.saved {
  background: #161616;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 16px 20px;
}

.saved-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 10px;
}

.saved-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.saved-title {
  font-size: 14px;
  font-weight: 700;
  color: #ccc;
}

.saved-count {
  font-size: 11px;
  background: #2a2a2a;
  color: #888;
  padding: 2px 7px;
  border-radius: 20px;
}

/* Экспорт / Импорт */
.io-btns {
  display: flex;
  gap: 6px;
}

.io-btn {
  background: #222;
  border: 1px solid #333;
  border-radius: 7px;
  color: #888;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  cursor: pointer;
  transition: color 0.1s, border-color 0.1s;
}

.io-btn:hover:not(:disabled) { color: #ddd; border-color: #555; }
.io-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.io-import:hover { color: #4895ef !important; border-color: #4895ef !important; }

/* Список */
.saved-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
}

.saved-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  background: #1e1e1e;
  border-radius: 8px;
  border: 1px solid #2a2a2a;
  transition: border-color 0.15s;
}
.saved-item:hover { border-color: #444; }

.saved-name-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.saved-name {
  font-size: 13px;
  color: #ddd;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.saved-name:hover { color: #fff; }

.saved-date { font-size: 10px; color: #444; }

.saved-input {
  background: #111;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  padding: 2px 6px;
  outline: none;
  width: 160px;
}

.saved-actions { display: flex; gap: 4px; flex-shrink: 0; }

.act-btn {
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #aaa;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s, color 0.1s;
}
.act-btn:hover { background: #333; color: #fff; }
.act-load:hover { color: #2dc653; }
.act-del:hover  { color: #e63946; }

.empty-hint {
  font-size: 12px;
  color: #444;
  text-align: center;
  padding: 12px 0 4px;
  line-height: 1.8;
}
.empty-hint strong { color: #666; }
</style>
