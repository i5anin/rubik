<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FaceLetter } from '../types/cube'
import { FACE_BG } from '../types/cube'
import { t } from '../i18n'

const props = defineProps<{
  face: FaceLetter
  stickers: FaceLetter[]
  activePaint: FaceLetter
  activeFace?: FaceLetter | null
  currentMove?: string | null
  animatingFace?: FaceLetter | null
  animatingMove?: string | null
}>()

const emit = defineEmits<(e: 'paint', idx: number) => void>()

const hovered = ref<number | null>(null)

const isActive    = computed(() => !!props.activeFace    && props.activeFace    === props.face)
const isAnimating = computed(() => !!props.animatingFace && props.animatingFace === props.face)

const faceLabel = computed(() => t(`face.${props.face}`))
const faceSub   = computed(() => t(`sub.${props.face}`))
const colorName = (sticker: FaceLetter) => t(`color.${sticker}`)

// Класс спиннера: cw / ccw / half
const spinClass = computed(() => {
  const move = props.animatingMove ?? props.currentMove ?? ''
  const mod  = move.slice(1)
  if (mod === '2')  {return 'half'}
  if (mod === "'") {return 'ccw'}
  return 'cw'
})

const animClass = computed(() => {
  if (!isAnimating.value || !props.animatingMove) {return null}
  const f   = props.face
  const mod = props.animatingMove.slice(1)
  const axis = (f === 'U' || f === 'D') ? 'x'
             : (f === 'R' || f === 'L') ? 'y' : 'z'
  const dir = mod === "'" ? 'ccw' : mod === '2' ? 'half' : 'cw'
  return `anim-${axis}-${dir}`
})

const activeGlow = computed(() => {
  if (!isActive.value && !isAnimating.value) {return {}}
  const color = FACE_BG[props.face]
  return { borderColor: color, boxShadow: `0 0 0 2px ${color}, 0 0 20px ${color}55` }
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
    <div class="face-label">{{ faceLabel }}</div>

    <div class="face-grid" :class="animClass" :style="activeGlow">

      <!-- Красивый спиннер — всегда крутится пока шаг активен -->
      <div v-if="isActive || isAnimating" class="rotation-overlay">
        <div class="spin-ring" :class="spinClass">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Тихий трек -->
            <circle cx="32" cy="32" r="23"
              stroke="rgba(255,255,255,0.15)" stroke-width="3" />
            <!-- Дуга ~300° через stroke-dasharray -->
            <circle cx="32" cy="32" r="23"
              stroke="white" stroke-width="4.5"
              stroke-linecap="round"
              stroke-dasharray="120 24"
              transform="rotate(-90 32 32)"
              style="filter: drop-shadow(0 0 6px rgba(255,255,255,0.7))" />
            <!-- Наконечник стрелки в конце дуги (≈ 8 часов) -->
            <path d="M 11.5 43 L 9 33 L 19 35"
              stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"
              style="filter: drop-shadow(0 0 5px rgba(255,255,255,0.8))" />
          </svg>
        </div>
      </div>

      <div v-for="(sticker, idx) in stickers" :key="idx" class="cell-wrap">
        <div
          class="cell"
          :class="{ center: idx === 4 }"
          :style="cellStyle(sticker, idx)"
          @mouseenter="hovered = idx"
          @mouseleave="hovered = null"
          @click="idx !== 4 && emit('paint', idx)"
        />
        <div v-if="hovered === idx" class="tooltip">{{ colorName(sticker) }}</div>
      </div>
    </div>

    <div class="face-sub">{{ faceSub }}</div>
  </div>
</template>

<style scoped>
/* ── Обёртка ── */
.face-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  perspective: 400px; transition: transform 0.2s;
}
.face-active { transform: scale(1.07); }

.face-label {
  font-size: 11px; font-weight: 700; color: #777;
  text-transform: uppercase; letter-spacing: 0.06em; transition: color 0.2s;
}
.face-active .face-label { color: #fff; }
.face-sub { font-size: 10px; color: #444; }

/* ── Сетка ── */
.face-grid {
  position: relative; display: grid;
  grid-template-columns: repeat(3, 42px); grid-template-rows: repeat(3, 42px);
  gap: 3px; padding: 5px; background: #1c1c1c; border-radius: 8px;
  border: 1px solid #2a2a2a; transition: border-color 0.2s, box-shadow 0.2s;
  transform-style: preserve-3d; will-change: transform;
}

/* ── Оверлей ── */
.rotation-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none; z-index: 10; border-radius: 6px;
  background: rgba(0, 0, 0, 0.42);
}

/* ── Спиннер SVG ── */
.spin-ring {
  width: 82%;
  height: 82%;
  display: flex; align-items: center; justify-content: center;
}

.spin-ring svg {
  width: 100%; height: 100%;
}

/* По часовой ↻ — непрерывное вращение */
.spin-ring.cw {
  animation: arrow-spin-cw 1.5s linear infinite;
}
/* Против часовой ↺ — непрерывное вращение в обратную сторону */
.spin-ring.ccw {
  animation: arrow-spin-cw 1.5s linear infinite reverse;
}
/* 180° — плавное туда-обратно с паузой */
.spin-ring.half {
  animation: arrow-spin-half 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes arrow-spin-cw {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes arrow-spin-half {
  0%   { transform: rotate(0deg); }
  35%  { transform: rotate(185deg); }
  50%  { transform: rotate(180deg); }
  85%  { transform: rotate(365deg); }
  100% { transform: rotate(360deg); }
}

/* ── 3D-анимации flip ── */
@keyframes flip-x-cw   { 0%{transform:rotateX(0)}   50%{transform:rotateX(90deg);filter:blur(3px);opacity:.45}  100%{transform:rotateX(0)} }
@keyframes flip-x-ccw  { 0%{transform:rotateX(0)}   50%{transform:rotateX(-90deg);filter:blur(3px);opacity:.45} 100%{transform:rotateX(0)} }
@keyframes flip-x-half { 0%{transform:rotateX(0)}   50%{transform:rotateX(90deg);filter:blur(3px);opacity:.45}  100%{transform:rotateX(0)} }
@keyframes flip-y-cw   { 0%{transform:rotateY(0)}   50%{transform:rotateY(90deg);filter:blur(3px);opacity:.45}  100%{transform:rotateY(0)} }
@keyframes flip-y-ccw  { 0%{transform:rotateY(0)}   50%{transform:rotateY(-90deg);filter:blur(3px);opacity:.45} 100%{transform:rotateY(0)} }
@keyframes flip-y-half { 0%{transform:rotateY(0)}   50%{transform:rotateY(90deg);filter:blur(3px);opacity:.45}  100%{transform:rotateY(0)} }
@keyframes flip-z-cw   { 0%{transform:rotateZ(0)}   50%{transform:rotateZ(90deg);filter:blur(3px);opacity:.45}  100%{transform:rotateZ(0)} }
@keyframes flip-z-ccw  { 0%{transform:rotateZ(0)}   50%{transform:rotateZ(-90deg);filter:blur(3px);opacity:.45} 100%{transform:rotateZ(0)} }
@keyframes flip-z-half { 0%{transform:rotateZ(0)}   50%{transform:rotateZ(180deg);filter:blur(3px);opacity:.45} 100%{transform:rotateZ(0)} }

.anim-x-cw  { animation: flip-x-cw   0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-x-ccw { animation: flip-x-ccw  0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-x-half{ animation: flip-x-half 0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-y-cw  { animation: flip-y-cw   0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-y-ccw { animation: flip-y-ccw  0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-y-half{ animation: flip-y-half 0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-z-cw  { animation: flip-z-cw   0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-z-ccw { animation: flip-z-ccw  0.42s cubic-bezier(0.4,0,0.2,1) !important; }
.anim-z-half{ animation: flip-z-half 0.42s cubic-bezier(0.4,0,0.2,1) !important; }

/* ── Ячейки ── */
.cell-wrap { position: relative; }
.cell {
  width: 100%; height: 100%; border-radius: 5px;
  transition: filter 0.08s, transform 0.08s;
}
.cell:not(.center):hover { filter: brightness(1.25); transform: scale(1.06); }

/* ── Тултип ── */
.tooltip {
  position: absolute; bottom: calc(100% + 5px); left: 50%;
  transform: translateX(-50%); background: #111; color: #fff;
  font-size: 11px; font-weight: 600; white-space: nowrap;
  padding: 3px 8px; border-radius: 5px; border: 1px solid #333;
  pointer-events: none; z-index: 100;
}
.tooltip::after {
  content: ''; position: absolute; top: 100%; left: 50%;
  transform: translateX(-50%); border: 4px solid transparent; border-top-color: #333;
}
</style>
