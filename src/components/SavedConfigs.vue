<script setup lang="ts">
import { ref } from 'vue'
import type { SavedConfig } from '../composables/useSavedConfigs'
import { t } from '../i18n'
import Icon from './Icon.vue'

defineProps<{ configs: SavedConfig[] }>()
const emit = defineEmits<{
  load:   [state: string]
  remove: [id: string]
  rename: [id: string, name: string]
  export: []
  import: [file: File]
}>()

const editingId   = ref<string | null>(null)
const editingName = ref('')
const fileInput   = ref<HTMLInputElement | null>(null)


function startEdit(c: SavedConfig) { editingId.value = c.id; editingName.value = c.name }
function commitEdit(id: string) {
  if (editingName.value.trim()) {emit('rename', id, editingName.value.trim())}
  editingId.value = null
}
function triggerImport() { fileInput.value?.click() }
function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) { emit('import', file) }
  input.value = ''
}
</script>

<template>
  <div class="saved">
    <div class="saved-header">
      <div class="saved-title-wrap">
        <span class="saved-title">{{ t('saved.title') }}</span>
        <span v-if="configs.length" class="saved-count">{{ configs.length }}</span>
      </div>
      <div class="io-btns">
        <button class="io-btn" :disabled="!configs.length" @click="emit('export')">
          <Icon name="download" /> {{ t('saved.export') }}
        </button>
        <button class="io-btn io-import" @click="triggerImport">
          <Icon name="upload" /> {{ t('saved.import') }}
        </button>
        <input ref="fileInput" type="file" accept=".json" style="display:none" @change="onFileChange" />
      </div>
    </div>

    <div v-if="configs.length" class="saved-list">
      <div v-for="c in configs" :key="c.id" class="saved-item">
        <div class="saved-name-wrap">
          <input v-if="editingId === c.id" v-model="editingName" class="saved-input"
            autofocus @keyup.enter="commitEdit(c.id)" @blur="commitEdit(c.id)" />
          <span v-else class="saved-name" @dblclick="startEdit(c)">{{ c.name }}</span>
          <span class="saved-date">{{ c.savedAt }}</span>
        </div>
        <div class="saved-actions">
          <button v-tooltip="t('saved.load')" class="act-btn act-load" @click="emit('load', c.state)"><Icon name="undo" /></button>
          <button v-tooltip="t('saved.rename')" class="act-btn act-edit" @click="startEdit(c)"><Icon name="pencil" /></button>
          <button v-tooltip="t('saved.delete')" class="act-btn act-del" @click="emit('remove', c.id)"><Icon name="close" /></button>
        </div>
      </div>
    </div>

    <div v-else class="empty-hint">
      {{ t('saved.empty') }}<br />
      <strong>{{ t('saved.empty.hint') }}</strong>
    </div>
  </div>
</template>

<style scoped>
.saved { background:#161616; border:1px solid #2a2a2a; border-radius:12px; padding:16px 20px; }
.saved-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; gap:10px; }
.saved-title-wrap { display:flex; align-items:center; gap:8px; }
.saved-title { font-size:14px; font-weight:700; color:#ccc; }
.saved-count { font-size:11px; background:#2a2a2a; color:#888; padding:2px 7px; border-radius:20px; }
.io-btns { display:flex; gap:6px; }
.io-btn {
  display:inline-flex; align-items:center; gap:5px;
  background:#222; border:1px solid #333; border-radius:7px; color:#888;
  font-size:12px; font-weight:600; padding:5px 12px; cursor:pointer; transition:color .1s,border-color .1s;
}
.io-btn:hover:not(:disabled) { color:#ddd; border-color:#555; }
.io-btn:disabled { opacity:.3; cursor:not-allowed; }
.io-import:hover { color:#4895ef!important; border-color:#4895ef!important; }
.saved-list { display:flex; flex-direction:column; gap:6px; max-height:240px; overflow-y:auto; }
.saved-item {
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  padding:8px 12px; background:#1e1e1e; border-radius:8px; border:1px solid #2a2a2a; transition:border-color .15s;
}
.saved-item:hover { border-color:#444; }
.saved-name-wrap { display:flex; flex-direction:column; gap:2px; min-width:0; }
.saved-name { font-size:13px; color:#ddd; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.saved-name:hover { color:#fff; }
.saved-date { font-size:10px; color:#444; }
.saved-input { background:#111; border:1px solid #555; border-radius:4px; color:#fff; font-size:13px; padding:2px 6px; outline:none; width:160px; }
.saved-actions { display:flex; gap:4px; flex-shrink:0; }
.act-btn {
  background:#2a2a2a; border:1px solid #333; border-radius:6px; color:#aaa;
  width:28px; height:28px; cursor:pointer; font-size:12px;
  display:flex; align-items:center; justify-content:center; transition:background .1s,color .1s;
}
.act-btn:hover { background:#333; color:#fff; }
.act-load:hover { color:#2dc653; }
.act-del:hover  { color:#e63946; }
.empty-hint { font-size:12px; color:#444; text-align:center; padding:12px 0 4px; line-height:1.8; }
.empty-hint strong { color:#666; }
</style>
