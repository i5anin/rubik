<script setup lang="ts">
import { computed } from 'vue'
import type { SolveStep } from '../composables/useSolver'
import { FACE_BG, FACE_TEXT } from '../types/cube'
import type { FaceLetter } from '../types/cube'

const props = defineProps<{
  raw: string
  steps: SolveStep[]
  completedCount: number
}>()

const emit = defineEmits<{
  (e: 'step-complete', move: string): void
  (e: 'step-undo'): void
}>()

const isDone = computed(() => props.completedCount >= props.steps.length && props.steps.length > 0)
const progress = computed(() =>
  props.steps.length ? Math.round((props.completedCount / props.steps.length) * 100) : 0
)

function moveStyle(move: string, done: boolean) {
  const face = move[0] as FaceLetter
  return {
    backgroundColor: done ? '#2a2a2a' : (FACE_BG[face] ?? '#333'),
    color: done ? '#555' : (FACE_TEXT[face] ?? '#fff'),
    borderRadius: '4px',
    padding: '2px 7px',
    fontWeight: '700',
    fontFamily: 'monospace',
    fontSize: '14px',
    display: 'inline-block',
    minWidth: '32px',
    textAlign: 'center' as const,
    transition: 'all 0.2s',
  }
}

function stepState(idx: number): 'done' | 'current' | 'upcoming' {
  const n = idx + 1
  if (n <= props.completedCount) return 'done'
  if (n === props.completedCount + 1) return 'current'
  return 'upcoming'
}
</script>

<template>
  <div class="panel">

    <!-- Заголовок + прогресс -->
    <div class="panel-head">
      <span class="title">Решение</span>
      <div class="head-right">
        <span v-if="steps.length > 0" class="progress-text">
          {{ completedCount }} / {{ steps.length }}
        </span>
        <span class="badge">
          {{ steps.length }} ход{{ steps.length === 1 ? '' : steps.length < 5 ? 'а' : 'ов' }}
        </span>
      </div>
    </div>

    <!-- Прогресс-бар -->
    <div v-if="steps.length > 0" class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }" />
    </div>

    <!-- Куб уже собран -->
    <div v-if="steps.length === 0" class="solved-msg">
      Куб уже собран! 🎉
    </div>

    <!-- Выполнено всё -->
    <div v-else-if="isDone" class="done-msg">
      🎉 Готово! Куб собран!
    </div>

    <div v-else>
      <!-- Сырая строка ходов -->
      <div class="raw-line">{{ raw }}</div>

      <!-- Шаги -->
      <div class="steps">
        <div
          v-for="(step, idx) in steps"
          :key="step.n"
          class="step"
          :class="stepState(idx)"
        >
          <!-- Иконка статуса -->
          <span class="step-status">
            <span v-if="stepState(idx) === 'done'" class="icon-done">✓</span>
            <span v-else-if="stepState(idx) === 'current'" class="icon-cur">▶</span>
            <span v-else class="step-n">{{ step.n }}</span>
          </span>

          <!-- Ход -->
          <span :style="moveStyle(step.move, stepState(idx) === 'done')">{{ step.move }}</span>

          <!-- Описание -->
          <span class="step-desc">{{ step.desc }}</span>

          <!-- Кнопки -->
          <div class="step-actions">
            <!-- Undo на последнем выполненном -->
            <button
              v-if="stepState(idx) === 'done' && idx === completedCount - 1"
              class="btn-undo"
              title="Отменить шаг"
              @click="emit('step-undo')"
            >↩</button>

            <!-- Готово на текущем -->
            <button
              v-if="stepState(idx) === 'current'"
              class="btn-done"
              @click="emit('step-complete', step.move)"
            >
              Готово ✓
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.panel {
  background: #161616;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 20px 24px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.title { font-size: 15px; font-weight: 700; }

.head-right { display: flex; align-items: center; gap: 8px; }

.progress-text { font-size: 12px; color: #666; }

.badge {
  font-size: 12px;
  background: rgba(72,149,239,0.18);
  color: #4895ef;
  padding: 3px 10px;
  border-radius: 20px;
}

/* Прогресс-бар */
.progress-bar {
  height: 3px;
  background: #2a2a2a;
  border-radius: 2px;
  margin-bottom: 14px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2dc653;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.solved-msg, .done-msg {
  font-size: 16px;
  font-weight: 700;
  padding: 12px 0;
  color: #2dc653;
  text-align: center;
}

.raw-line {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 12px;
  color: #ffd60a;
  background: #0d0d0d;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  word-break: break-all;
  line-height: 1.6;
}

/* Шаги */
.steps {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 2px;
}

.step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: background 0.15s, opacity 0.15s;
}

/* Выполненный */
.step.done {
  background: #1a1a1a;
  opacity: 0.55;
}

/* Текущий */
.step.current {
  background: #1e2a1e;
  border-color: #2dc653;
}

/* Будущий */
.step.upcoming {
  background: #191919;
  opacity: 0.7;
}

.step-status {
  width: 22px;
  text-align: center;
  flex-shrink: 0;
  font-size: 12px;
}

.icon-done { color: #2dc653; font-weight: 700; font-size: 13px; }
.icon-cur  { color: #2dc653; font-size: 11px; }

.step-n {
  font-size: 11px;
  color: #444;
}

.step-desc {
  font-size: 13px;
  color: #aaa;
  flex: 1;
  min-width: 0;
}

.step.done .step-desc { color: #555; text-decoration: line-through; }
.step.current .step-desc { color: #ddd; }

/* Кнопки */
.step-actions {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
  margin-left: auto;
}

.btn-done {
  background: #2dc653;
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.1s, transform 0.1s;
  white-space: nowrap;
}
.btn-done:hover { opacity: 0.88; transform: scale(1.03); }

.btn-undo {
  background: #2a2a2a;
  color: #888;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.1s;
}
.btn-undo:hover { color: #ffd60a; }
</style>
