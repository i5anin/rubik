<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FaceLetter } from '../types/cube'
import { FACE_ORDER, FACE_BG, FACE_TEXT } from '../types/cube'

const props = defineProps<{
  ok: boolean
  msg: string
  colorCounts: Record<FaceLetter, number>
}>()

const show = ref(false)

const COLOR_NAME: Record<FaceLetter, string> = {
  U: 'Белый',  R: 'Красный', F: 'Зелёный',
  D: 'Жёлтый', L: 'Оранжевый', B: 'Синий',
}

const rows = computed(() =>
  FACE_ORDER.map(f => ({
    face: f,
    name: COLOR_NAME[f],
    count: props.colorCounts[f] ?? 0,
    ok: (props.colorCounts[f] ?? 0) === 9,
    bg: FACE_BG[f],
    fg: FACE_TEXT[f],
  }))
)
</script>

<template>
  <div
    class="chip-wrap"
    @mouseenter="show = true"
    @mouseleave="show = false"
  >
    <div class="chip" :class="ok ? 'ok' : 'err'">{{ msg }}</div>

    <Transition name="pop">
      <div v-if="show" class="tooltip-box">
        <div class="tt-title">Что проверяется:</div>

        <div class="tt-rows">
          <div v-for="r in rows" :key="r.face" class="tt-row">
            <span class="tt-dot" :style="{ background: r.bg }" />
            <span class="tt-name">{{ r.name }}</span>
            <div class="tt-bar-wrap">
              <div
                class="tt-bar-fill"
                :class="{ err: !r.ok }"
                :style="{ width: (r.count / 9 * 100) + '%', background: r.bg }"
              />
            </div>
            <span class="tt-count" :class="{ err: !r.ok }">{{ r.count }}/9</span>
            <span class="tt-icon">{{ r.ok ? '✓' : '✗' }}</span>
          </div>
        </div>

        <div class="tt-divider" />
        <div class="tt-footer">
          <span>Центры граней:</span>
          <span class="tt-ok">✓ зафиксированы</span>
        </div>
        <div class="tt-footer" style="margin-top:3px">
          <span>Чётность перестановок:</span>
          <span class="tt-note">проверяет солвер</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.chip-wrap { position: relative; display: inline-block; }

.chip {
  font-size: 13px;
  padding: 7px 14px;
  border-radius: 20px;
  font-weight: 500;
  cursor: default;
  user-select: none;
  transition: opacity 0.15s;
}
.chip:hover { opacity: 0.85; }
.chip.ok  { background: rgba(45,198,83,0.12);  color: #2dc653; }
.chip.err { background: rgba(230,57,70,0.12);  color: #e63946; }

/* Тултип */
.tooltip-box {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 14px 16px;
  width: 260px;
  z-index: 200;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.tt-title {
  font-size: 11px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.tt-rows { display: flex; flex-direction: column; gap: 6px; }

.tt-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
}

.tt-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.tt-name { color: #aaa; width: 70px; flex-shrink: 0; }

.tt-bar-wrap {
  flex: 1;
  height: 6px;
  background: #2a2a2a;
  border-radius: 3px;
  overflow: hidden;
}

.tt-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
  opacity: 0.8;
}
.tt-bar-fill.err { background: #e63946 !important; }

.tt-count { font-size: 11px; color: #666; width: 26px; text-align: right; flex-shrink: 0; }
.tt-count.err { color: #e63946; font-weight: 700; }

.tt-icon { font-size: 12px; width: 14px; color: #2dc653; flex-shrink: 0; }
.tt-icon.err { color: #e63946; }

.tt-divider { border: none; border-top: 1px solid #2a2a2a; margin: 10px 0 8px; }

.tt-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #555;
}
.tt-ok   { color: #2dc653; }
.tt-note { color: #4895ef; }

/* Анимация */
.pop-enter-active { transition: opacity 0.15s, transform 0.15s; }
.pop-leave-active { transition: opacity 0.1s,  transform 0.1s; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateX(-50%) translateY(-4px); }
</style>
