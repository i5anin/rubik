<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FaceLetter } from '../types/cube'
import { FACE_BG, FACE_LABEL, FACE_SUBLABEL } from '../types/cube'

const props = defineProps<{
  face: FaceLetter
  stickers: FaceLetter[]
  activePaint: FaceLetter
  activeFace?: FaceLetter | null
  currentMove?: string | null
}>()

const emit = defineEmits<{
  (e: 'paint', idx: number): void
}>()

const COLOR_RU: Record<FaceLetter, string> = {
  U: 'Белый', R: 'Красный', F: 'Зелёный',
  D: 'Жёлтый', L: 'Оранжевый', B: 'Синий',
}

const hovered = ref<number | null>(null)

// Эта грань — текущая в решении?
const isActive = computed(() => !!props.activeFace && props.activeFace === props.face)

// Иконка направления вращения
const rotationIcon = computed(() => {
  if (!isActive.value || !props.currentMove) return ''
  const mod = props.currentMove.slice(1)
  if (mod === '2') return '↻↻'
  if (mod === "'") return '↺'
  return '↻'
})

// Динамический glow по цвету грани
const activeGlow = computed(() => {
  if (!isActive.value) return {}
  const color = FACE_BG[props.face]
  return {
    borderColor: color,
    boxShadow: `0 0 0 2px ${color}, 0 0 18px ${color}66`,
  }
})

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
  <div class="face-wrap" :class="{ 'face-active': isActive }">
    <div class="face-label">{{ FACE_LABEL[face] }}</div>

    <div class="face-grid" :style="activeGlow">
      <!-- Оверлей с направлением вращения -->
      <div v-if="isActive" class="rotation-overlay">
        <span class="rotation-icon">{{ rotationIcon }}</span>
      </div>

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
  transition: transform 0.2s;
}

/* Активная грань — чуть увеличивается */
.face-active {
  transform: scale(1.06);
}

.face-label {
  font-size: 11px;
  font-weight: 700;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: color 0.2s;
}

.face-active .face-label {
  color: #fff;
}

.face-sub {
  font-size: 10px;
  color: #444;
}

.face-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 42px);
  grid-template-rows: repeat(3, 42px);
  gap: 3px;
  padding: 5px;
  background: #1c1c1c;
  border-radius: 8px;
  border: 1px solid #2a2a2a;
  transition: border-color 0.2s, box-shadow 0.2s;
}

/* Пульсирующая анимация на активной грани */
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.face-active .face-grid {
  animation: pulse-glow 1s ease-in-out infinite;
}

/* Оверлей с иконкой вращения */
.rotation-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
  border-radius: 6px;
  background: rgba(0,0,0,0.45);
}

.rotation-icon {
  font-size: 28px;
  color: #fff;
  text-shadow: 0 0 12px rgba(255,255,255,0.8);
  font-weight: 900;
  letter-spacing: -2px;
}

/* Ячейки */
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

/* Тултип */
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
