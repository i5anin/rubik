<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import type { FaceLetter } from '../types/cube'
import { useCube3D, inLayer, turnTransform, type Cubelet, type Dir } from '../composables/useCube3D'

const STEP = 46 // distance between cubelet centres (px)
const FACES: { dir: Dir; t: string }[] = [
  { dir: 'U', t: 'rotateX(90deg)' },
  { dir: 'D', t: 'rotateX(-90deg)' },
  { dir: 'F', t: '' },
  { dir: 'B', t: 'rotateY(180deg)' },
  { dir: 'R', t: 'rotateY(90deg)' },
  { dir: 'L', t: 'rotateY(-90deg)' },
]

const { cubelets, reset, applyMove, net } = useCube3D()
const NET_FACES: FaceLetter[] = ['U', 'L', 'F', 'R', 'B', 'D']

// ── Orbit (drag to rotate the whole cube) ──────────────────────────────
const rx = ref(-28)
const ry = ref(-36)
let dragging = false
let lastX = 0
let lastY = 0

function onDown(e: PointerEvent): void {
  dragging = true; lastX = e.clientX; lastY = e.clientY
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}
function onMove(e: PointerEvent): void {
  if (!dragging) { return }
  ry.value += (e.clientX - lastX) * 0.5
  rx.value -= (e.clientY - lastY) * 0.5
  rx.value = Math.max(-85, Math.min(85, rx.value))
  lastX = e.clientX; lastY = e.clientY
}
function onUp(): void { dragging = false }

// ── Move playback ──────────────────────────────────────────────────────
const animFace = ref<FaceLetter | null>(null)
const animAngle = ref(0)
const animating = ref(false)
const noTransition = ref(false) // freeze transition during the atomic commit
let timer: ReturnType<typeof setTimeout> | undefined

const SPEED = 420 // ms per quarter turn

function playMove(move: string): Promise<void> {
  return new Promise((resolve) => {
    const face = move[0] as FaceLetter
    const mod = move.slice(1)
    const quarters = mod === '2' ? 2 : 1
    const sign = mod === "'" ? -1 : 1

    animating.value = true
    noTransition.value = false
    animFace.value = face
    animAngle.value = 0

    // next frame → animate the layer to the target angle
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { animAngle.value = 90 * quarters * sign })
    })

    // Commit exactly when the rotation finishes. With transition off, the new
    // base transform equals the just-rotated visual, so there is NO visible
    // colour/position jump — the turn flows straight into the next state.
    timer = setTimeout(() => {
      noTransition.value = true
      const m = mod === '2' ? `${face}2` : mod === "'" ? `${face}'` : face
      applyMove(m)
      animFace.value = null
      animAngle.value = 0
      // restore transition on a later frame, once the new state has painted
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          noTransition.value = false
          animating.value = false
          resolve()
        })
      })
    }, SPEED * quarters)
  })
}

async function playSequence(moves: string[]): Promise<void> {
  if (animating.value) { return }
  for (const m of moves) {
    await playMove(m)
    await new Promise((r) => setTimeout(r, 110))
  }
}

function resetCube(): void {
  if (timer) { clearTimeout(timer) }
  animFace.value = null; animAngle.value = 0; animating.value = false; noTransition.value = false
  reset()
}

onBeforeUnmount(() => { if (timer) { clearTimeout(timer) } })

defineExpose({ playSequence, resetCube })

// ── Transforms ─────────────────────────────────────────────────────────
function cubeletTransform(cl: Cubelet): string {
  const base = `translate3d(${cl.x * STEP}px, ${-cl.y * STEP}px, ${cl.z * STEP}px)`
  if (animFace.value && inLayer(cl, animFace.value)) {
    return `${turnTransform(animFace.value, animAngle.value)} ${base}`
  }
  return base
}
</script>

<template>
  <div class="cube3d">
    <div
      class="scene"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointerleave="onUp"
    >
      <div class="cube" :style="{ transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }">
        <!-- solid black core: fills the interior so gaps never show through -->
        <div class="core">
          <div v-for="f in FACES" :key="f.dir" class="core-face" :style="{ transform: `${f.t} translateZ(60px)` }" />
        </div>
        <div
          v-for="cl in cubelets"
          :key="cl.id"
          class="cubelet"
          :class="{ turning: !noTransition && animFace && inLayer(cl, animFace) }"
          :style="{ transform: cubeletTransform(cl) }"
        >
          <!-- Only the outer (coloured) faces are drawn — no inner faces to
               overlap and no backface to vanish mid-turn. The black core
               behind them hides the interior. -->
          <template v-for="f in FACES" :key="f.dir">
            <div
              v-if="cl.colors[f.dir]"
              class="face"
              :style="{ transform: `${f.t} translateZ(22px)` }"
            >
              <div
                class="sticker"
                :class="`lit-${f.dir}`"
                :style="{ background: cl.colors[f.dir] as string }"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
    <p class="hint-3d">{{ '↻ ' }}<span>покрути мышью</span></p>

    <!-- 2D unfolded net, in sync with the 3D model -->
    <div class="net2d">
      <div v-for="f in NET_FACES" :key="f" class="net-face" :class="`area-${f}`">
        <div v-for="(hex, i) in net[f]" :key="i" class="net-cell" :style="{ background: hex }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cube3d { display: flex; flex-direction: column; align-items: center; gap: 8px; }

.scene {
  width: 220px;
  height: 220px;
  perspective: 720px;
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.scene:active { cursor: grabbing; }

.cube {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  /* centre the cubelet coordinate system */
  display: grid;
  place-items: center;
}

/* Solid black interior block */
.core {
  position: absolute;
  width: 120px;
  height: 120px;
  transform-style: preserve-3d;
}
.core-face {
  position: absolute;
  inset: 0;
  background: #0a0a0a;
}

.cubelet {
  position: absolute;
  width: 44px;
  height: 44px;
  transform-style: preserve-3d;
}
.cubelet.turning { transition: transform 0.42s cubic-bezier(0.45, 0, 0.25, 1); }

.face {
  position: absolute;
  inset: 0;
  background: #101010;          /* black plastic body around the sticker */
  border-radius: 7px;
  display: grid;
  place-items: center;
  /* No backface-visibility:hidden — only outer faces are rendered, so they
     must stay visible at every rotation angle (otherwise they'd blink out
     mid-turn). The core behind them prevents see-through. */
}
.sticker {
  width: 90%;
  height: 90%;
  border-radius: 5px;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.4), inset 0 2px 2px rgba(255, 255, 255, 0.18);
}

/* Fake directional lighting for depth — top brightest, bottom darkest. */
.lit-U { filter: brightness(1.1); }
.lit-D { filter: brightness(0.74); }
.lit-F { filter: brightness(1.0); }
.lit-B { filter: brightness(0.82); }
.lit-R { filter: brightness(0.9); }
.lit-L { filter: brightness(0.86); }

.hint-3d {
  font-size: 11px;
  color: #555;
}
.hint-3d span { color: #777; }

/* 2D unfolded net (cross layout), driven by the same model */
.net2d {
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-template-areas:
    ".  U  .  ."
    "L  F  R  B"
    ".  D  .  .";
  gap: 4px;
  margin-top: 6px;
}
.area-U { grid-area: U; }
.area-L { grid-area: L; }
.area-F { grid-area: F; }
.area-R { grid-area: R; }
.area-B { grid-area: B; }
.area-D { grid-area: D; }

.net-face {
  display: grid;
  grid-template-columns: repeat(3, 13px);
  grid-template-rows: repeat(3, 13px);
  gap: 2px;
  padding: 2px;
  background: #1c1c1c;
  border-radius: 4px;
}
.net-cell { border-radius: 2px; }

@media (max-width: 480px) {
  .scene { width: 180px; height: 180px; }
}
</style>
