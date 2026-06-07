<script setup lang="ts">
import { ref, computed } from 'vue'
import Cube from './lib/cubejs'
import type { FaceLetter } from './types/cube'
import { FACE_ORDER, FACE_BG, FACE_TEXT, FACE_SUBLABEL } from './types/cube'
import { t } from './i18n'
import { GITHUB_URL } from './config'
import FaceGrid from './components/FaceGrid.vue'
import SolutionPanel from './components/SolutionPanel.vue'
import SavedConfigs from './components/SavedConfigs.vue'
import HeaderLinks from './components/HeaderLinks.vue'
import ValidationChip from './components/ValidationChip.vue'
import Icon from './components/Icon.vue'
import Learn from './components/Learn.vue'
import { useCube } from './composables/useCube'
import { useSolver } from './composables/useSolver'
import { useSavedConfigs } from './composables/useSavedConfigs'
import { useDocumentMeta } from './composables/useDocumentMeta'

useDocumentMeta()

const { faces, setCell, resetAll, toKociemba, fromKociemba, validation, colorCounts } = useCube()
const { solve, solving, rawSolution, solveError, steps, clear } = useSolver()
const { configs, save, remove, rename, exportJson, importJson } = useSavedConfigs()

const mode = ref<'solver' | 'learn'>('solver')
const activePaint = ref<FaceLetter>('R')
const saveMsg = ref('')


// Пошаговое выполнение
const completedCount = ref(0)
const stateHistory = ref<string[]>([]) // для undo

// Текущий ход и грань которая двигается
const currentMove = computed(() =>
  steps.value[completedCount.value]?.move ?? null
)
const currentMoveFace = computed(() =>
  currentMove.value ? currentMove.value[0] as FaceLetter : null
)

// Анимация: какая грань сейчас анимируется и какой ход
const animatingFace = ref<FaceLetter | null>(null)
const animatingMoveStr = ref<string | null>(null)
const isAnimatingStep = ref(false)

function paint(face: FaceLetter, idx: number) {
  setCell(face, idx, activePaint.value)
  clear()
}

function handleReset() {
  resetAll()
  clear()
}

async function handleScramble() {
  Cube.initSolver()
  const scr = Cube.scramble()
  const c = new Cube()
  c.move(scr)
  fromKociemba(c.asString())
  clear()
}

async function handleSolve() {
  if (!validation.value.ok) {return}
  completedCount.value = 0
  stateHistory.value = []
  await solve(toKociemba())
}

async function handleStepComplete(move: string) {
  if (isAnimatingStep.value) {return}
  isAnimatingStep.value = true

  // 1. Запустить анимацию
  animatingFace.value = move[0] as FaceLetter
  animatingMoveStr.value = move

  // 2. Подождать первую половину (грань «уходит»)
  await new Promise(r => setTimeout(r, 210))

  // 3. В середине — обновить стикеры (грань невидима в 90°)
  stateHistory.value.push(toKociemba())
  const cube = Cube.fromString(toKociemba())
  cube.move(move)
  fromKociemba(cube.asString())

  // 4. Подождать вторую половину (грань «возвращается»)
  await new Promise(r => setTimeout(r, 210))

  // 5. Завершить
  animatingFace.value = null
  animatingMoveStr.value = null
  completedCount.value++
  isAnimatingStep.value = false
}

function handleStepUndo() {
  const prev = stateHistory.value.pop()
  if (prev !== undefined) {
    fromKociemba(prev)
    completedCount.value--
  }
}

function handleSave() {
  if (!validation.value.ok) {return}
  save(toKociemba())
  saveMsg.value = t('btn.saved')
  setTimeout(() => (saveMsg.value = ''), 1800)
}

function handleLoad(state: string) {
  fromKociemba(state)
  clear()
}

const importNotice = ref('')
async function handleImport(file: File) {
  try {
    const count = await importJson(file)
    importNotice.value = count > 0 ? `Импортировано: ${count}` : 'Всё уже есть'
  } catch {
    importNotice.value = 'Ошибка файла'
  }
  setTimeout(() => (importNotice.value = ''), 2500)
}
</script>

<template>
  <div class="app">

    <!-- Header -->
    <header>
      <div class="header-top">
        <a class="brand" :href="GITHUB_URL" target="_blank" rel="noopener">
          <img src="/favicon.svg" width="34" height="34" alt="cube" />
          <h1>{{ t('app.title') }}</h1>
        </a>
        <HeaderLinks />
      </div>
      <!-- app.hint is a static i18n string with <b> tags, never user input -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-if="mode === 'solver'" class="hint" v-html="t('app.hint')" />
    </header>

    <!-- Mode tabs -->
    <nav class="tabs">
      <button class="tab" :class="{ active: mode === 'solver' }" @click="mode = 'solver'">
        <Icon name="solve" /> {{ t('tab.solver') }}
      </button>
      <button class="tab" :class="{ active: mode === 'learn' }" @click="mode = 'learn'">
        <Icon name="info" /> {{ t('tab.learn') }}
      </button>
    </nav>

    <!-- ══ LEARN MODE ══ -->
    <Learn v-if="mode === 'learn'" />

    <!-- ══ SOLVER MODE ══ -->
    <template v-else>
    <!-- Палитра цветов -->
    <section class="palette-row">
      <span class="palette-label">{{ t('palette.label') }}</span>
      <div class="palette">
        <button
          v-for="face in FACE_ORDER"
          :key="face"
          v-tooltip="FACE_SUBLABEL[face]"
          class="paint-btn"
          :class="{ active: activePaint === face }"
          :style="{ background: FACE_BG[face], color: FACE_TEXT[face] }"
          @click="activePaint = face"
        >
          {{ FACE_SUBLABEL[face][0] }}
        </button>
      </div>
    </section>

    <!-- Карта куба — развёртка крестом -->
    <section class="cube-map">
      <div class="area-u">
        <FaceGrid face="U" :stickers="faces.U" :active-paint="activePaint"
          :active-face="currentMoveFace" :current-move="currentMove"
          :animating-face="animatingFace" :animating-move="animatingMoveStr"
          @paint="paint('U', $event)" />
      </div>
      <div class="area-l">
        <FaceGrid face="L" :stickers="faces.L" :active-paint="activePaint"
          :active-face="currentMoveFace" :current-move="currentMove"
          :animating-face="animatingFace" :animating-move="animatingMoveStr"
          @paint="paint('L', $event)" />
      </div>
      <div class="area-f">
        <FaceGrid face="F" :stickers="faces.F" :active-paint="activePaint"
          :active-face="currentMoveFace" :current-move="currentMove"
          :animating-face="animatingFace" :animating-move="animatingMoveStr"
          @paint="paint('F', $event)" />
      </div>
      <div class="area-r">
        <FaceGrid face="R" :stickers="faces.R" :active-paint="activePaint"
          :active-face="currentMoveFace" :current-move="currentMove"
          :animating-face="animatingFace" :animating-move="animatingMoveStr"
          @paint="paint('R', $event)" />
      </div>
      <div class="area-b">
        <FaceGrid face="B" :stickers="faces.B" :active-paint="activePaint"
          :active-face="currentMoveFace" :current-move="currentMove"
          :animating-face="animatingFace" :animating-move="animatingMoveStr"
          @paint="paint('B', $event)" />
      </div>
      <div class="area-d">
        <FaceGrid face="D" :stickers="faces.D" :active-paint="activePaint"
          :active-face="currentMoveFace" :current-move="currentMove"
          :animating-face="animatingFace" :animating-move="animatingMoveStr"
          @paint="paint('D', $event)" />
      </div>
    </section>

    <!-- Кнопки -->
    <section class="actions">
      <button class="btn btn-ghost" @click="handleReset">
        <Icon name="reset" /> {{ t('btn.reset') }}
      </button>
      <button class="btn btn-scramble" @click="handleScramble">
        <Icon name="shuffle" /> {{ t('btn.scramble') }}
      </button>

      <ValidationChip
        :ok="validation.ok"
        :error-face="validation.ok ? undefined : validation.errorFace"
        :error-count="validation.ok ? undefined : validation.errorCount"
        :color-counts="colorCounts"
      />

      <button class="btn btn-save" :disabled="!validation.ok" @click="handleSave">
        <Icon name="save" /> {{ saveMsg || t('btn.save') }}
      </button>

      <button class="btn btn-primary" :disabled="!validation.ok || solving" @click="handleSolve">
        {{ solving ? t('btn.solving') : t('btn.solve') }} <Icon v-if="!solving" name="solve" />
      </button>
    </section>

    <!-- Уведомление импорта -->
    <div v-if="importNotice" class="notice-box">{{ importNotice }}</div>

    <!-- Ошибка солвера -->
    <div v-if="solveError" class="error-box">
      <Icon name="alert" /> {{ solveError }}
    </div>

    <!-- Решение -->
    <SolutionPanel
      v-if="rawSolution !== null"
      :raw="rawSolution"
      :steps="steps"
      :completed-count="completedCount"
      :is-animating="isAnimatingStep"
      @step-complete="handleStepComplete"
      @step-undo="handleStepUndo"
    />

    <!-- Сохранённые конфиги -->
    <SavedConfigs
      :configs="configs"
      @load="handleLoad"
      @remove="remove"
      @rename="rename"
      @export="exportJson"
      @import="handleImport"
    />
    </template>

  </div>
</template>

<style scoped>
.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 16px 80px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Header: brand left, links right — no empty balancer column. */
.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: opacity 0.15s;
}
.brand:hover { opacity: 0.8; }
.brand img { display: block; }

h1 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.04em;
  white-space: nowrap;
  background: linear-gradient(135deg, #f0f0f0, #aaa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hint { color: #555; font-size: 13px; margin-top: 8px; }
.hint strong { color: #888; }

/* Mode tabs */
.tabs {
  display: flex;
  gap: 6px;
  justify-content: center;
  background: #161616;
  border: 1px solid #2a2a2a;
  border-radius: 11px;
  padding: 5px;
  width: fit-content;
  margin: 0 auto;
}
.tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #888;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.tab:hover { color: #ccc; }
.tab.active { background: #4895ef; color: #fff; }

/* ── Палитра ── */
.palette-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.palette-label { font-size: 13px; color: #666; }
.palette { display: flex; gap: 6px; }

.paint-btn {
  width: 42px;
  height: 42px;
  border: 3px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  transition: transform 0.1s, border-color 0.1s, box-shadow 0.1s;
}
.paint-btn:hover { transform: scale(1.1); }
.paint-btn.active {
  border-color: #fff;
  box-shadow: 0 0 14px rgba(255,255,255,0.25);
  transform: scale(1.18);
}

/* ── Карта куба ── */
.cube-map {
  --cell: 42px;            /* sticker size — shrinks on phones (see media queries) */
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-template-rows: repeat(3, auto);
  grid-template-areas:
    ".  u  .  ."
    "l  f  r  b"
    ".  d  .  .";
  gap: 5px;
  justify-content: center;
}
.area-u { grid-area: u; }
.area-l { grid-area: l; }
.area-f { grid-area: f; }
.area-r { grid-area: r; }
.area-b { grid-area: b; }
.area-d { grid-area: d; }

/* ── Кнопки ── */
.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  border: none;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}
.btn:hover:not(:disabled) { opacity: 0.88; transform: scale(1.03); }
.btn:disabled { opacity: 0.35; cursor: not-allowed; }

.btn-ghost    { background: #222; color: #bbb; }
.btn-scramble { background: #2a2a2a; color: #ffd60a; border: 1px solid #444; }
.btn-save     { background: #2a2a2a; color: #4895ef; border: 1px solid #444; }
.btn-primary  { background: #e63946; color: #fff; }


.error-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(230,57,70,0.1);
  border: 1px solid #e63946;
  border-radius: 9px;
  padding: 12px 18px;
  font-size: 13px;
  color: #e63946;
}

.notice-box {
  background: rgba(72,149,239,0.1);
  border: 1px solid #4895ef;
  border-radius: 9px;
  padding: 10px 18px;
  font-size: 13px;
  color: #4895ef;
  text-align: center;
}

/* ── Адаптив для телефонов ── */
@media (max-width: 620px) {
  .app { padding: 20px 12px 64px; gap: 22px; }
  .cube-map { --cell: 30px; gap: 4px; }
  h1 { font-size: 22px; }
  .paint-btn { width: 38px; height: 38px; }
  .palette-row { justify-content: center; }
  .palette { flex-wrap: wrap; justify-content: center; }
}

@media (max-width: 420px) {
  .app { padding: 16px 8px 56px; }
  .cube-map { --cell: 25px; gap: 3px; }
  .paint-btn { width: 34px; height: 34px; border-radius: 8px; }
  .palette { gap: 5px; }
  .actions { gap: 8px; }
  .btn { padding: 9px 14px; }
}

@media (max-width: 340px) {
  .cube-map { --cell: 21px; }
}
</style>
