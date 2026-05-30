<script setup lang="ts">
import { ref } from 'vue'
import type { FaceLetter } from '../types/cube'
import { FACE_BG, FACE_LABEL, FACE_SUBLABEL } from '../types/cube'

defineProps<{
  face: FaceLetter
  stickers: FaceLetter[]
  activePaint: FaceLetter
}>()

const emit = defineEmits<{
  (e: 'paint', idx: number): void
}>()

const COLOR_RU: Record<FaceLetter, string> = {
  U: 'Белый',
  R: 'Красный',
  F: 'Зелёный',
  D: 'Жёлтый',
  L: 'Оранжевый',
  B: 'Синий',
}

// hover tooltip state
const hovered = ref<number | null>(null)

function cellStyle(sticker: FaceLetter, idx: number) {
  const isCenter = idx === 4
  return {
    backgroundColor: FACE_BG[sticker],
    cursor: isCenter ? 'not-allowed' : 'pointer',
    outline: isCenter ? '2px inset rgba(0,0,0,0.25)' : 'none',
    outlineOffset: '-3px',
    opacity: isCenter ? 0.75 : 1,
  }
}
</script>

<template>
  <div class="face-wrap">
    <div class="face-label">{{ FACE_LABEL[face] }}</div>
    <div class="face-grid">
      <div
        v-for="(sticker, idx) in stickers"
        :key="idx"
        class="cell-wrap"
      >
        <div
          class="cell"
          :class="{ center: idx === 4 }"
          :style="cellStyle(sticker, idx)"
          @mouseenter="hovered = idx"
          @mouseleave="hovered = null"
          @click="idx !== 4 && emit('paint', idx)"
        />
        <!-- Тултип -->
        <div v-if="hovered === idx" class="tooltip">
          {{ COLOR_RU[sticker] }}
        </div>
      </div>
    </div>
    <div class="face-sub">{{ FACE_SUBLABEL[face] }}</div>
  </div>
</template>

<style scoped>
.face-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.face-label {
  font-size: 11px;
  font-weight: 700;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.face-sub {
  font-size: 10px;
  color: #444;
}

.face-grid {
  display: grid;
  grid-template-columns: repeat(3, 42px);
  grid-template-rows: repeat(3, 42px);
  gap: 3px;
  padding: 5px;
  background: #1c1c1c;
  border-radius: 8px;
  border: 1px solid #2a2a2a;
}

.cell-wrap {
  position: relative;
}

.cell {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  transition: filter 0.08s, transform 0.08s;
}

.cell:not(.center):hover {
  filter: brightness(1.25);
  transform: scale(1.06);
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  background: #111;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid #333;
  pointer-events: none;
  z-index: 100;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #333;
}
</style>
