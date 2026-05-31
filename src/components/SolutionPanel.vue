<script setup lang="ts">
import { computed } from 'vue'
import type { SolveStep } from '../composables/useSolver'
import { FACE_BG, FACE_TEXT } from '../types/cube'
import type { FaceLetter } from '../types/cube'
import { t, describeMove, pluralMoves } from '../i18n'
import Icon from './Icon.vue'

const props = defineProps<{
  raw: string
  steps: SolveStep[]
  completedCount: number
  isAnimating?: boolean
}>()

const emit = defineEmits<{
  (e: 'step-complete', move: string): void
  (e: 'step-undo'): void
}>()

const isDone   = computed(() => props.completedCount >= props.steps.length && props.steps.length > 0)
const progress = computed(() => props.steps.length ? Math.round((props.completedCount / props.steps.length) * 100) : 0)

function moveStyle(move: string, done: boolean) {
  const face = move[0] as FaceLetter
  return {
    backgroundColor: done ? '#2a2a2a' : (FACE_BG[face] as string | undefined ?? '#333'),
    color: done ? '#555' : (FACE_TEXT[face] as string | undefined ?? '#fff'),
    borderRadius: '4px', padding: '2px 7px', fontWeight: '700',
    fontFamily: 'monospace', fontSize: '14px', display: 'inline-block',
    minWidth: '32px', textAlign: 'center' as const, transition: 'all 0.2s',
  }
}

function stepState(idx: number): 'done' | 'current' | 'upcoming' {
  const n = idx + 1
  if (n <= props.completedCount) {return 'done'}
  if (n === props.completedCount + 1) {return 'current'}
  return 'upcoming'
}

// Реактивное описание хода (меняется при смене языка)
const stepDesc = (move: string) => describeMove(move)


</script>

<template>
  <div class="panel">
    <div class="panel-head">
      <span class="title">{{ t('solution.title') }}</span>
      <div class="head-right">
        <span v-if="steps.length > 0" class="progress-text">{{ completedCount }} / {{ steps.length }}</span>
        <span class="badge">{{ pluralMoves(steps.length) }}</span>
      </div>
    </div>

    <div v-if="steps.length > 0" class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }" />
    </div>

    <div v-if="steps.length === 0" class="solved-msg">
      <Icon name="check-circle" /> {{ t('solution.already') }}
    </div>
    <div v-else-if="isDone" class="done-msg">
      <Icon name="sparkles" /> {{ t('solution.done') }}
    </div>

    <div v-else>
      <div class="raw-line">{{ raw }}</div>
      <div class="steps">
        <div v-for="(step, idx) in steps" :key="step.n" class="step" :class="stepState(idx)">
          <span class="step-status">
            <Icon v-if="stepState(idx) === 'done'" name="check" class="icon-done" />
            <Icon v-else-if="stepState(idx) === 'current'" name="chevron" class="icon-cur" />
            <span v-else class="step-n">{{ step.n }}</span>
          </span>

          <span :style="moveStyle(step.move, stepState(idx) === 'done')">{{ step.move }}</span>
          <span class="step-desc">{{ stepDesc(step.move) }}</span>

          <div class="step-actions">
            <button
              v-if="stepState(idx) === 'done' && idx === completedCount - 1"
              v-tooltip="t('saved.undo')"
              class="btn-undo"
              @click="emit('step-undo')"
            ><Icon name="undo" /></button>
            <button
              v-if="stepState(idx) === 'current'"
              class="btn-done"
              :disabled="isAnimating"
              @click="emit('step-complete', step.move)"
            ><Icon name="check" /> {{ t('step.done') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel { background:#161616; border:1px solid #2a2a2a; border-radius:12px; padding:20px 24px; }
.panel-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.title { font-size:15px; font-weight:700; }
.head-right { display:flex; align-items:center; gap:8px; }
.progress-text { font-size:12px; color:#666; }
.badge { font-size:12px; background:rgba(72,149,239,.18); color:#4895ef; padding:3px 10px; border-radius:20px; }

.progress-bar { height:3px; background:#2a2a2a; border-radius:2px; margin-bottom:14px; overflow:hidden; }
.progress-fill { height:100%; background:#2dc653; border-radius:2px; transition:width .3s ease; }

.solved-msg,.done-msg {
  display:flex; align-items:center; justify-content:center; gap:8px;
  font-size:16px; font-weight:700; padding:12px 0; color:#2dc653;
}

.raw-line {
  font-family:'JetBrains Mono','Fira Code',Consolas,monospace; font-size:12px;
  color:#ffd60a; background:#0d0d0d; padding:8px 12px; border-radius:8px;
  margin-bottom:12px; word-break:break-all; line-height:1.6;
}

.steps { display:flex; flex-direction:column; gap:3px; max-height:360px; overflow-y:auto; padding-right:2px; }

.step {
  display:flex; align-items:center; gap:10px; padding:8px 10px;
  border-radius:8px; border:1px solid transparent; transition:background .15s, opacity .15s;
}
.step.done    { background:#1a1a1a; opacity:.55; }
.step.current { background:#1e2a1e; border-color:#2dc653; }
.step.upcoming{ background:#191919; opacity:.7; }

.step-status { width:22px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.icon-done { color:#2dc653; width:14px; height:14px; }
.icon-cur  { color:#2dc653; width:13px; height:13px; }
.step-n    { font-size:11px; color:#444; }

.step-desc { font-size:13px; color:#aaa; flex:1; min-width:0; }
.step.done .step-desc    { color:#555; text-decoration:line-through; }
.step.current .step-desc { color:#ddd; }

.step-actions { display:flex; gap:5px; flex-shrink:0; margin-left:auto; }

.btn-done {
  display:inline-flex; align-items:center; gap:5px;
  background:#2dc653; color:#000; border:none; border-radius:6px;
  padding:5px 12px; font-size:12px; font-weight:700; cursor:pointer;
  transition:opacity .1s,transform .1s; white-space:nowrap;
}
.btn-done:hover:not(:disabled) { opacity:.88; transform:scale(1.03); }
.btn-done:disabled { opacity:.4; cursor:not-allowed; }

.btn-undo {
  display:inline-flex; align-items:center; justify-content:center;
  background:#2a2a2a; color:#888; border:1px solid #333;
  border-radius:6px; padding:5px 9px; cursor:pointer;
}
.btn-undo:hover { color:#ffd60a; }
</style>
