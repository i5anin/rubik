<script setup lang="ts">
import type { SolveStep } from '../composables/useSolver'
import { FACE_BG, FACE_TEXT } from '../types/cube'
import type { FaceLetter } from '../types/cube'

defineProps<{
  raw: string
  steps: SolveStep[]
}>()

/** Покрасить токен хода */
function moveStyle(move: string) {
  const face = move[0] as FaceLetter
  return {
    backgroundColor: FACE_BG[face] ?? '#333',
    color: FACE_TEXT[face] ?? '#fff',
    borderRadius: '4px',
    padding: '2px 7px',
    fontWeight: '700',
    fontFamily: 'monospace',
    fontSize: '14px',
    display: 'inline-block',
    minWidth: '32px',
    textAlign: 'center' as const,
  }
}
</script>

<template>
  <div class="panel">
    <div class="panel-head">
      <span class="title">Решение</span>
      <span class="badge">{{ steps.length }} ход{{ steps.length === 1 ? '' : steps.length < 5 ? 'а' : 'ов' }}</span>
    </div>

    <div v-if="steps.length === 0" class="solved-msg">
      Куб уже собран!
    </div>

    <div v-else>
      <div class="raw-line">{{ raw }}</div>

      <div class="steps">
        <div v-for="step in steps" :key="step.n" class="step">
          <span class="step-n">{{ step.n }}</span>
          <span :style="moveStyle(step.move)">{{ step.move }}</span>
          <span class="step-desc">{{ step.desc }}</span>
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
  margin-bottom: 14px;
}

.title {
  font-size: 15px;
  font-weight: 700;
}

.badge {
  font-size: 12px;
  background: rgba(72, 149, 239, 0.18);
  color: #4895ef;
  padding: 3px 10px;
  border-radius: 20px;
}

.solved-msg {
  color: #2dc653;
  font-size: 15px;
  padding: 8px 0;
}

.raw-line {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 13px;
  color: #ffd60a;
  background: #0d0d0d;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 14px;
  word-break: break-all;
  line-height: 1.6;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 10px;
  border-radius: 7px;
  background: #1e1e1e;
  transition: background 0.1s;
}

.step:hover { background: #252525; }

.step-n {
  font-size: 11px;
  color: #444;
  width: 22px;
  text-align: right;
  flex-shrink: 0;
}

.step-desc {
  font-size: 13px;
  color: #aaa;
}
</style>
