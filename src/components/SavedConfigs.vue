<script setup lang="ts">
import { ref } from 'vue'
import type { SavedConfig } from '../composables/useSavedConfigs'

defineProps<{ configs: SavedConfig[] }>()
const emit = defineEmits<{
  (e: 'load', state: string): void
  (e: 'remove', id: string): void
  (e: 'rename', id: string, name: string): void
}>()

const editingId = ref<string | null>(null)
const editingName = ref('')

function startEdit(c: SavedConfig) {
  editingId.value = c.id
  editingName.value = c.name
}

function commitEdit(id: string) {
  if (editingName.value.trim()) {
    emit('rename', id, editingName.value.trim())
  }
  editingId.value = null
}
</script>

<template>
  <div class="saved" v-if="configs.length">
    <div class="saved-header">
      <span class="saved-title">Сохранённые</span>
      <span class="saved-count">{{ configs.length }}</span>
    </div>

    <div class="saved-list">
      <div v-for="c in configs" :key="c.id" class="saved-item">

        <!-- Имя / редактирование -->
        <div class="saved-name-wrap">
          <input
            v-if="editingId === c.id"
            v-model="editingName"
            class="saved-input"
            @keyup.enter="commitEdit(c.id)"
            @blur="commitEdit(c.id)"
            autofocus
          />
          <span v-else class="saved-name" @dblclick="startEdit(c)">
            {{ c.name }}
          </span>
          <span class="saved-date">{{ c.savedAt }}</span>
        </div>

        <!-- Кнопки -->
        <div class="saved-actions">
          <button class="act-btn act-load" @click="emit('load', c.state)" title="Загрузить">
            ↩
          </button>
          <button class="act-btn act-edit" @click="startEdit(c)" title="Переименовать">
            ✏
          </button>
          <button class="act-btn act-del" @click="emit('remove', c.id)" title="Удалить">
            ✕
          </button>
        </div>

      </div>
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
  gap: 8px;
  margin-bottom: 12px;
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

.saved-item:hover {
  border-color: #444;
}

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

.saved-date {
  font-size: 10px;
  color: #444;
}

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

.saved-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

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
</style>
