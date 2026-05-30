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
  animatingFace?: FaceLetter | null
  animatingMove?: string | null
}>()

const emit = defineEmits<{
  (e: 'paint', idx: number): void
}>()

const COLOR_RU: Record<FaceLetter, string> = {
  U: 'Белый', R: 'Красный', F: 'Зелёный',
  D: 'Жёлтый', L: 'Оранжевый', B: 'Синий',
}

const hovered = ref<number | null>(null)

const isActive    = computed(() => !!props.activeFace    && props.activeFace    === props.face)
const isAnimating = computed(() => !!props.animatingFace && props.animatingFace === props.face)

// Иконка направления на оверлее
const rotationIcon = computed(() => {
  if (!isActive.value && !isAnimating.value) return ''
  const move = props.animatingMove ?? props.currentMove ?? ''
  const mod = move.slice(1)
  if (mod === '2')  return '↻↻'
  if (mod === "'") return '↺'
  return '↻'
})

// CSS класс анимации — зависит от оси и направления хода
const animClass = computed(() => {
  if (!isAnimating.value || !props.animatingMove) return null
  const f   = props.face
  const mod = props.animatingMove.slice(1)

  // Ось вращения: U/D — X, R/L — Y, F/B — Z
  const axis = (f === 'U' || f === 'D') ? 'x'
             : (f === 'R' || f === 'L') ? 'y'
             : 'z'

  // Направление
  const dir = mod === "'" ? 'ccw' : mod === '2' ? 'half' : 'cw'

  return `anim-${axis}-${dir}`
})

// Цветной glow на активной грани
const activeGlow = computed(() => {
  if (!isActive.value && !isAnimating.value) return {}
  const color = FACE_BG[props.face]
  return {
    borderColor: color,
    boxShadow: `0 0 0 2px ${color}, 0 0 18px ${color}66`,
  }
})

function cellStyle(sticker: FaceLetter, idx: number) {
  return {
    backgroundColor: FACE_BG[sticker],
    cursor: idx === 4 ? 'not-allowed' : 'pointer',
    outline: idx === 4 ? '2px inset rgba(0,0,0,0.25)' : 'none',
    outlineOffset: '-3px',
    opacity: idx === 4 ? 0.75 : 1,
  }
}
</script>

<template>
  <div class="face-wrap" :class="{ 'face-active': isActive || isAnimating }">
    <div class="face-label">{{ FACE_LABEL[face] }}</div>

    <div
      class="face-grid"
      :class="animClass"
      :style="activeGlow"
    >
      <!-- Оверлей с иконкой вращения -->
      <div v-if="isActive || isAnimating" class="rotation-overlay">
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
/* ── Обёртка ── */
.face-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  perspective: 400px;       /* нужно для 3D вращения дочернего face-grid */
  transition: transform 0.2s;
}

.face-active {
  transform: scale(1.07);
}

.face-label {
  font-size: 11px;
  font-weight: 700;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: color 0.2s;
}
.face-active .face-label { color: #fff; }

.face-sub { font-size: 10px; color: #444; }

/* ── Сетка ── */
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
  transform-style: preserve-3d;
  will-change: transform;
}

/* Пульс на активной (ещё не анимирующей) грани */
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.75; }
}
.face-active .face-grid:not([class*="anim-"]) {
  animation: pulse-glow 1.1s ease-in-out infinite;
}

/* ── 9 анимаций: X/Y/Z × CW/CCW/HALF ── */
/* X axis  (U, D) */
@keyframes flip-x-cw   { 0%{transform:rotateX(0)}   50%{transform:rotateX(90deg); filter:blur(3px); opacity:.45} 100%{transform:rotateX(0)} }
@keyframes flip-x-ccw  { 0%{transform:rotateX(0)}   50%{transform:rotateX(-90deg);filter:blur(3px); opacity:.45} 100%{transform:rotateX(0)} }
@keyframes flip-x-half { 0%{transform:rotateX(0)}   50%{transform:rotateX(90deg); filter:blur(3px); opacity:.45} 100%{transform:rotateX(0)} }

/* Y axis  (R, L) */
@keyframes flip-y-cw   { 0%{transform:rotateY(0)}   50%{transform:rotateY(90deg); filter:blur(3px); opacity:.45} 100%{transform:rotateY(0)} }
@keyframes flip-y-ccw  { 0%{transform:rotateY(0)}   50%{transform:rotateY(-90deg);filter:blur(3px); opacity:.45} 100%{transform:rotateY(0)} }
@keyframes flip-y-half { 0%{transform:rotateY(0)}   50%{transform:rotateY(90deg); filter:blur(3px); opacity:.45} 100%{transform:rotateY(0)} }

/* Z axis  (F, B) */
@keyframes flip-z-cw   { 0%{transform:rotateZ(0)}   50%{transform:rotateZ(90deg); filter:blur(3px); opacity:.45} 100%{transform:rotateZ(0)} }
@keyframes flip-z-ccw  { 0%{transform:rotateZ(0)}   50%{transform:rotateZ(-90deg);filter:blur(3px); opacity:.45} 100%{transform:rotateZ(0)} }
@keyframes flip-z-half { 0%{transform:rotateZ(0)}   50%{transform:rotateZ(180deg);filter:blur(3px); opacity:.45} 100%{transform:rotateZ(0)} }

.anim-x-cw   { animation: flip-x-cw   0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-x-ccw  { animation: flip-x-ccw  0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-x-half { animation: flip-x-half 0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-y-cw   { animation: flip-y-cw   0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-y-ccw  { animation: flip-y-ccw  0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-y-half { animation: flip-y-half 0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-z-cw   { animation: flip-z-cw   0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-z-ccw  { animation: flip-z-ccw  0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-z-half { animation: flip-z-half 0.42s cubic-bezier(0.4,0,0.2,1) !important; }

/* ── Оверлей с направлением ── */
.rotation-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
  border-radius: 6px;
  background: rgba(0,0,0,0.38);
}

.rotation-icon {
  font-size: 26px;
  color: #fff;
  text-shadow: 0 0 12px rgba(255,255,255,0.9);
  font-weight: 900;
  letter-spacing: -2px;
}

/* ── Ячейки ── */
.cell-wrap { position: relative; }

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

/* ── Тултип ── */
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
