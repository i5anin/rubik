<script setup lang="ts">
import { ref, computed } from 'vue'
import { LESSONS, type DiagramCell } from '../data/lessons'
import { lang, describeMove } from '../i18n'
import { FACE_BG, FACE_TEXT } from '../types/cube'
import type { FaceLetter } from '../types/cube'
import Icon from './Icon.vue'
import Cube3D from './Cube3D.vue'

// Exposed API of Cube3D (InstanceType can't see defineExpose cleanly).
interface Cube3DApi { playSequence: (moves: string[]) => Promise<void>; resetCube: () => void }
const cube3d = ref<Cube3DApi | null>(null)

const current = ref(0)
const lesson = computed(() => LESSONS[current.value])
const L = (b: { ru: string; en: string }): string => b[lang.value]

function go(i: number): void {
  if (i >= 0 && i < LESSONS.length) {
    current.value = i
    resetSteps()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Diagram cell colour
function cellColor(c: DiagramCell): string {
  return c === 'x' ? '#2a2a2a' : FACE_BG[c]
}

// Move badge style (coloured by face, like the solution panel)
function moveStyle(move: string) {
  const face = move[0] as FaceLetter
  return { background: FACE_BG[face] as string | undefined ?? '#333', color: FACE_TEXT[face] as string | undefined ?? '#fff' }
}

function movesOf(s: string): string[] {
  return s.split(' ').filter(Boolean)
}

// ── Step-by-step playback ──────────────────────────────────────────────
// Which algorithm is being walked, and how many of its moves are applied.
const activeAlgo = ref<number | null>(null)
const stepPos = ref(0)          // moves applied so far (0 = solved)
const busy = ref(false)

/** Apply the next move of an algorithm one at a time. */
async function nextStep(algoIdx: number, moves: string[]): Promise<void> {
  if (busy.value) { return }

  // switching to a different algorithm → start from a solved cube
  if (activeAlgo.value !== algoIdx) {
    cube3d.value?.resetCube()
    activeAlgo.value = algoIdx
    stepPos.value = 0
    await new Promise((r) => setTimeout(r, 120))
  }
  // finished → one more press loops back to solved
  if (stepPos.value >= moves.length) {
    resetSteps()
    return
  }

  busy.value = true
  const move = moves[stepPos.value]
  await cube3d.value?.playSequence([move])
  stepPos.value += 1
  busy.value = false
}

/** Reset the cube and clear step state. */
function resetSteps(): void {
  cube3d.value?.resetCube()
  activeAlgo.value = null
  stepPos.value = 0
  busy.value = false
}

/** The move currently shown (just applied), for the description line. */
function currentMove(moves: string[]): string | null {
  return stepPos.value > 0 ? moves[stepPos.value - 1] ?? null : null
}
</script>

<template>
  <div class="learn">
    <!-- Stepper -->
    <div class="stepper">
      <button
        v-for="(l, i) in LESSONS"
        :key="l.id"
        v-tooltip="L(l.title)"
        class="step-dot"
        :class="{ active: i === current, done: i < current }"
        @click="go(i)"
      >{{ i === 0 ? '★' : i }}</button>
    </div>

    <!-- Lesson card -->
    <article class="card">
      <header class="card-head">
        <span class="lesson-no">{{ current === 0 ? '' : `${current} / ${LESSONS.length - 1}` }}</span>
        <h2>{{ L(lesson.title) }}</h2>
      </header>

      <div class="goal">
        <Icon name="check-circle" />
        <span><b>{{ lang === 'ru' ? 'Цель: ' : 'Goal: ' }}</b>{{ L(lesson.goal) }}</span>
      </div>

      <!-- Diagram -->
      <div v-if="lesson.diagram" class="diagram-wrap">
        <div class="diagram">
          <div
            v-for="(c, i) in lesson.diagram.cells"
            :key="i"
            class="dcell"
            :style="{ background: cellColor(c) }"
          />
        </div>
        <span class="diagram-label">{{ L(lesson.diagram.face) }}</span>
      </div>

      <!-- Body -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-for="(p, i) in lesson.body" :key="i" class="body" v-html="L(p)" />

      <!-- 3D cube — algorithms play out on it, step by step -->
      <div v-if="lesson.algorithms" class="cube-stage">
        <Cube3D ref="cube3d" />
      </div>

      <!-- Algorithms (step-by-step walk-through) -->
      <div v-if="lesson.algorithms" class="algos">
        <div v-for="(algo, ai) in lesson.algorithms" :key="ai" class="algo">
          <div class="algo-top">
            <span v-if="algo.when" class="algo-when">{{ L(algo.when) }}</span>
            <span v-if="activeAlgo === ai" class="algo-progress">
              {{ stepPos }} / {{ movesOf(algo.moves).length }}
            </span>
          </div>

          <!-- move badges; the one just applied is highlighted -->
          <div class="moves">
            <span
              v-for="(m, mi) in movesOf(algo.moves)"
              :key="mi"
              v-tooltip="describeMove(m)"
              class="move"
              :class="{
                lit: activeAlgo === ai && mi === stepPos - 1,
                done: activeAlgo === ai && mi < stepPos - 1,
              }"
              :style="moveStyle(m)"
            >{{ m }}</span>
          </div>

          <!-- what the current move does -->
          <p v-if="activeAlgo === ai && currentMove(movesOf(algo.moves))" class="step-desc">
            {{ describeMove(currentMove(movesOf(algo.moves)) ?? '') }}
          </p>

          <!-- step controls -->
          <div class="step-ctrls">
            <button class="ctrl ctrl-reset" @click="resetSteps">
              <Icon name="reset" /> {{ lang === 'ru' ? 'Сброс' : 'Reset' }}
            </button>
            <button class="ctrl ctrl-next" :disabled="busy" @click="nextStep(ai, movesOf(algo.moves))">
              <template v-if="activeAlgo === ai && stepPos >= movesOf(algo.moves).length">
                {{ lang === 'ru' ? '✓ Готово — ещё раз' : '✓ Done — again' }}
              </template>
              <template v-else>
                {{ lang === 'ru' ? 'Следующий ход' : 'Next move' }} <Icon name="chevron" />
              </template>
            </button>
          </div>
        </div>
      </div>

      <!-- Tip -->
      <div v-if="lesson.tip" class="tip">
        <Icon name="info" />
        <span>{{ L(lesson.tip) }}</span>
      </div>

      <!-- Nav -->
      <div class="nav">
        <button class="nav-btn" :disabled="current === 0" @click="go(current - 1)">
          {{ lang === 'ru' ? '← Назад' : '← Back' }}
        </button>
        <button
          v-if="current < LESSONS.length - 1"
          class="nav-btn nav-next"
          @click="go(current + 1)"
        >{{ lang === 'ru' ? 'Далее →' : 'Next →' }}</button>
      </div>
    </article>
  </div>
</template>

<style scoped>
.learn { display: flex; flex-direction: column; gap: 20px; }

/* Stepper */
.stepper {
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
}
.step-dot {
  width: 34px; height: 34px; border-radius: 50%;
  background: #1e1e1e; border: 1px solid #2a2a2a; color: #888;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: background .15s, color .15s, border-color .15s, transform .1s;
}
.step-dot:hover { transform: scale(1.1); color: #ddd; }
.step-dot.done   { color: #2dc653; border-color: #2dc65355; }
.step-dot.active { background: #4895ef; color: #fff; border-color: #4895ef; transform: scale(1.12); }

/* Card */
.card {
  background: #161616; border: 1px solid #2a2a2a; border-radius: 14px;
  padding: 24px 26px; display: flex; flex-direction: column; gap: 16px;
}
.card-head { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.lesson-no { font-size: 12px; color: #555; font-weight: 700; }
h2 { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }

.goal {
  display: flex; gap: 9px; align-items: flex-start;
  background: rgba(45,198,83,0.08); border: 1px solid #2dc65333;
  border-radius: 10px; padding: 11px 14px; font-size: 14px; color: #cfeede;
}
.goal :deep(svg) { color: #2dc653; flex-shrink: 0; margin-top: 1px; }

/* Diagram */
.diagram-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.diagram {
  display: grid; grid-template-columns: repeat(3, 34px); grid-template-rows: repeat(3, 34px);
  gap: 4px; padding: 6px; background: #0d0d0d; border-radius: 10px; border: 1px solid #2a2a2a;
}
.dcell { border-radius: 6px; }
.diagram-label { font-size: 11px; color: #666; }

.body { font-size: 14px; line-height: 1.65; color: #c8c8c8; }
.body :deep(b) { color: #fff; font-weight: 700; }

/* 3D cube stage */
.cube-stage {
  display: flex; flex-direction: column; align-items: center;
  padding: 14px 0 4px;
}

/* Algorithms */
.algos { display: flex; flex-direction: column; gap: 12px; }
.algo {
  background: #1b1b1b; border: 1px solid #2a2a2a; border-radius: 10px; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 10px;
}
.algo-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.algo-when { font-size: 13px; font-weight: 600; color: #ffd60a; }
.algo-progress { font-size: 12px; font-weight: 700; color: #4895ef; }

.moves { display: flex; flex-wrap: wrap; gap: 6px; }
.move {
  font-family: 'JetBrains Mono', Consolas, monospace; font-size: 15px; font-weight: 700;
  padding: 4px 9px; border-radius: 6px; min-width: 34px; text-align: center;
  cursor: help; transition: transform .2s, box-shadow .2s, opacity .2s;
}
.move.done { opacity: 0.45; }
.move.lit { transform: scale(1.28); box-shadow: 0 0 0 2px #fff, 0 0 16px rgba(255,255,255,0.7); z-index: 1; }

/* current-move description */
.step-desc {
  font-size: 13px; color: #ddd; margin: 0;
  padding: 7px 11px; background: #141414; border-radius: 8px;
  border-left: 3px solid #4895ef;
}

/* step controls */
.step-ctrls { display: flex; gap: 8px; }
.ctrl {
  display: inline-flex; align-items: center; gap: 5px;
  border: 1px solid #333; border-radius: 8px;
  font-size: 13px; font-weight: 600; padding: 8px 14px; cursor: pointer;
  transition: opacity .15s, transform .1s, border-color .15s, color .15s;
}
.ctrl:disabled { opacity: 0.4; cursor: not-allowed; }
.ctrl-reset { background: #222; color: #aaa; }
.ctrl-reset:hover { color: #ddd; border-color: #555; }
.ctrl-next { background: #4895ef; color: #fff; border-color: #4895ef; margin-left: auto; }
.ctrl-next:hover:not(:disabled) { transform: scale(1.03); }

/* Tip */
.tip {
  display: flex; gap: 9px; align-items: flex-start;
  background: rgba(72,149,239,0.08); border: 1px solid #4895ef33;
  border-radius: 10px; padding: 11px 14px; font-size: 13px; color: #bcd4f0;
}
.tip :deep(svg) { color: #4895ef; flex-shrink: 0; margin-top: 1px; }

/* Nav */
.nav { display: flex; justify-content: space-between; gap: 12px; margin-top: 4px; }
.nav-btn {
  background: #222; border: 1px solid #333; border-radius: 9px; color: #bbb;
  font-size: 14px; font-weight: 600; padding: 10px 20px; cursor: pointer; transition: opacity .15s, transform .1s;
}
.nav-btn:hover:not(:disabled) { transform: scale(1.03); color: #fff; }
.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.nav-next { background: #4895ef; color: #fff; border-color: #4895ef; margin-left: auto; }

@media (max-width: 480px) {
  .card { padding: 18px 16px; }
  h2 { font-size: 17px; }
}
</style>
