<script setup lang="ts">
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
        class="cell"
        :class="{ center: idx === 4 }"
        :style="cellStyle(sticker, idx)"
        @click="idx !== 4 && emit('paint', idx)"
      />
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

.cell {
  border-radius: 5px;
  transition: filter 0.08s, transform 0.08s;
}

.cell:not(.center):hover {
  filter: brightness(1.25);
  transform: scale(1.06);
}
</style>
