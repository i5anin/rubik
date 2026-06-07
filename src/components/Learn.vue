<script setup lang="ts">
import { ref, computed } from 'vue'
import { LESSONS, type DiagramCell } from '../data/lessons'
import { lang, describeMove } from '../i18n'
import { FACE_BG, FACE_TEXT } from '../types/cube'
import type { FaceLetter } from '../types/cube'
import Icon from './Icon.vue'

const current = ref(0)
const lesson = computed(() => LESSONS[current.value])
const L = (b: { ru: string; en: string }): string => b[lang.value]

function go(i: number): void {
  if (i >= 0 && i < LESSONS.length) {
    current.value = i
    playing.value = null
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

// Sequence playback — highlight each move in turn
const playing = ref<{ algo: number; step: number } | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

function play(algoIdx: number, moves: string[]): void {
  if (timer) { clearTimeout(timer) }
  let step = 0
  const tick = (): void => {
    if (step >= moves.length) { playing.value = null; return }
    playing.value = { algo: algoIdx, step }
    step++
    timer = setTimeout(tick, 650)
  }
  tick()
}

function movesOf(s: string): string[] {
  return s.split(' ').filter(Boolean)
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

      <!-- Algorithms -->
      <div v-if="lesson.algorithms" class="algos">
        <div v-for="(algo, ai) in lesson.algorithms" :key="ai" class="algo">
          <div class="algo-top">
            <span v-if="algo.when" class="algo-when">{{ L(algo.when) }}</span>
            <button class="play-btn" @click="play(ai, movesOf(algo.moves))">
              <Icon name="chevron" /> {{ lang === 'ru' ? 'Показать' : 'Play' }}
            </button>
          </div>
          <div class="moves">
            <span
              v-for="(m, mi) in movesOf(algo.moves)"
              :key="mi"
              v-tooltip="describeMove(m)"
              class="move"
              :class="{ lit: playing?.algo === ai && playing.step === mi }"
              :style="moveStyle(m)"
            >{{ m }}</span>
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

/* Algorithms */
.algos { display: flex; flex-direction: column; gap: 12px; }
.algo {
  background: #1b1b1b; border: 1px solid #2a2a2a; border-radius: 10px; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 9px;
}
.algo-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.algo-when { font-size: 13px; font-weight: 600; color: #ffd60a; }
.play-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: #222; border: 1px solid #333; border-radius: 7px; color: #aaa;
  font-size: 12px; font-weight: 600; padding: 4px 10px; cursor: pointer; transition: color .15s, border-color .15s;
}
.play-btn:hover { color: #4895ef; border-color: #4895ef66; }

.moves { display: flex; flex-wrap: wrap; gap: 6px; }
.move {
  font-family: 'JetBrains Mono', Consolas, monospace; font-size: 15px; font-weight: 700;
  padding: 4px 9px; border-radius: 6px; min-width: 34px; text-align: center;
  cursor: help; transition: transform .15s, box-shadow .15s;
}
.move.lit { transform: scale(1.25); box-shadow: 0 0 0 2px #fff, 0 0 14px rgba(255,255,255,0.6); z-index: 1; }

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
