<script setup lang="ts">
import { ref } from 'vue'
import type { FaceLetter } from './types/cube'
import { FACE_ORDER, FACE_BG, FACE_TEXT, FACE_SUBLABEL } from './types/cube'
import FaceGrid from './components/FaceGrid.vue'
import SolutionPanel from './components/SolutionPanel.vue'
import SavedConfigs from './components/SavedConfigs.vue'
import { useCube } from './composables/useCube'
import { useSolver } from './composables/useSolver'
import { useSavedConfigs } from './composables/useSavedConfigs'

const { faces, setCell, resetAll, toKociemba, fromKociemba, validation } = useCube()
const { solve, solving, rawSolution, solveError, steps, clear } = useSolver()
const { configs, save, remove, rename, exportJson, importJson } = useSavedConfigs()

const activePaint = ref<FaceLetter>('R')
const saveMsg = ref('')

function paint(face: FaceLetter, idx: number) {
  setCell(face, idx, activePaint.value)
  clear()
}

function handleReset() {
  resetAll()
  clear()
}

async function handleScramble() {
  const { default: Cube } = await import('cubejs')
  Cube.initSolver()
  const scr = Cube.scramble()
  const c = new Cube()
  c.move(scr)
  fromKociemba(c.asString())
  clear()
}

async function handleSolve() {
  if (!validation.value.ok) return
  await solve(toKociemba())
}

function handleSave() {
  if (!validation.value.ok) return
  save(toKociemba())
  saveMsg.value = 'Сохранено!'
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
      <h1>Кубик Рубика</h1>
      <p class="hint">
        Держи куб: <strong>белый верх</strong>, <strong>зелёный к тебе</strong>.
        Кликай клетки, чтобы покрасить. Наводи — увидишь цвет.
      </p>
    </header>

    <!-- Палитра цветов -->
    <section class="palette-row">
      <span class="palette-label">Цвет кисти:</span>
      <div class="palette">
        <button
          v-for="face in FACE_ORDER"
          :key="face"
          class="paint-btn"
          :class="{ active: activePaint === face }"
          :style="{ background: FACE_BG[face], color: FACE_TEXT[face] }"
          :title="FACE_SUBLABEL[face]"
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
          @paint="paint('U', $event)" />
      </div>
      <div class="area-l">
        <FaceGrid face="L" :stickers="faces.L" :active-paint="activePaint"
          @paint="paint('L', $event)" />
      </div>
      <div class="area-f">
        <FaceGrid face="F" :stickers="faces.F" :active-paint="activePaint"
          @paint="paint('F', $event)" />
      </div>
      <div class="area-r">
        <FaceGrid face="R" :stickers="faces.R" :active-paint="activePaint"
          @paint="paint('R', $event)" />
      </div>
      <div class="area-b">
        <FaceGrid face="B" :stickers="faces.B" :active-paint="activePaint"
          @paint="paint('B', $event)" />
      </div>
      <div class="area-d">
        <FaceGrid face="D" :stickers="faces.D" :active-paint="activePaint"
          @paint="paint('D', $event)" />
      </div>
    </section>

    <!-- Кнопки -->
    <section class="actions">
      <button class="btn btn-ghost" @click="handleReset">↺ Сброс</button>
      <button class="btn btn-scramble" @click="handleScramble">🎲 Скрамбл</button>

      <div class="validation-chip" :class="validation.ok ? 'ok' : 'err'">
        {{ validation.msg }}
      </div>

      <button
        class="btn btn-save"
        :disabled="!validation.ok"
        @click="handleSave"
        :title="saveMsg || 'Сохранить текущее состояние'"
      >
        {{ saveMsg || '💾 Сохранить' }}
      </button>

      <button
        class="btn btn-primary"
        :disabled="!validation.ok || solving"
        @click="handleSolve"
      >
        {{ solving ? 'Считаю...' : 'Решить ↗' }}
      </button>
    </section>

    <!-- Уведомление импорта -->
    <div v-if="importNotice" class="notice-box">{{ importNotice }}</div>

    <!-- Ошибка солвера -->
    <div v-if="solveError" class="error-box">
      ⚠ {{ solveError }}
    </div>

    <!-- Решение -->
    <SolutionPanel v-if="rawSolution !== null" :raw="rawSolution" :steps="steps" />

    <!-- Сохранённые конфиги -->
    <SavedConfigs
      :configs="configs"
      @load="handleLoad"
      @remove="remove"
      @rename="rename"
      @export="exportJson"
      @import="handleImport"
    />

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

header { text-align: center; }

h1 {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #f0f0f0, #aaa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hint { color: #555; font-size: 13px; margin-top: 6px; }
.hint strong { color: #888; }

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

.validation-chip {
  font-size: 13px;
  padding: 7px 14px;
  border-radius: 20px;
  font-weight: 500;
}
.validation-chip.ok  { background: rgba(45,198,83,0.12);  color: #2dc653; }
.validation-chip.err { background: rgba(230,57,70,0.12);  color: #e63946; }

.error-box {
  background: rgba(230,57,70,0.1);
  border: 1px solid #e63946;
  border-radius: 9px;
  padding: 12px 18px;
  font-size: 13px;
  color: #e63946;
  text-align: center;
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
</style>
