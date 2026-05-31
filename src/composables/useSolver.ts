/**
 * Rubik's Cube solver — thin wrapper around the cubejs Kociemba implementation.
 *
 * Responsibilities:
 *   • Lazy-initialise the pruning tables once (sync, ~0.5 s)
 *   • Short-circuit on an already-solved cube (cubejs returns a non-empty
 *     solution for the identity state in some versions)
 *   • Expose reactive state: solving / rawSolution / solveError / steps
 *
 * Note: move *descriptions* are a presentation concern — they live in i18n.ts,
 * not here.  SolveStep carries only the raw move token.
 */

import { ref, computed } from 'vue'
import Cube from '../lib/cubejs'
import { FACE_ORDER } from '../types/cube'

// ── Solver initialisation ─────────────────────────────────────────────────

let solverReady = false

async function ensureInit(): Promise<void> {
  if (solverReady) { return }
  // Defer the synchronous table build so the UI can render first.
  await new Promise<void>(resolve => { setTimeout(resolve, 30) })
  Cube.initSolver()
  solverReady = true
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Returns true when every face is a uniform colour (already solved). */
function isAlreadySolved(kStr: string): boolean {
  return FACE_ORDER.every((_, i) => {
    const start  = i * 9
    const centre = kStr[start]
    return kStr.slice(start, start + 9).split('').every(c => c === centre)
  })
}

// ── Types ─────────────────────────────────────────────────────────────────

/** A single step in the solution sequence. */
export interface SolveStep {
  readonly n:    number  // 1-based index
  readonly move: string  // e.g. "R2", "U'", "F"
}

// ── Composable ────────────────────────────────────────────────────────────

export function useSolver() {
  const solving       = ref(false)
  const rawSolution   = ref<string | null>(null)
  const solveError    = ref<string | null>(null)

  async function solve(kStr: string): Promise<void> {
    solving.value     = true
    rawSolution.value = null
    solveError.value  = null

    try {
      if (isAlreadySolved(kStr)) { rawSolution.value = ''; return }
      await ensureInit()
      rawSolution.value = Cube.fromString(kStr).solve()
    } catch (e: unknown) {
      solveError.value = e instanceof Error
        ? e.message
        : `Куб нерешаем (${String(e)})`
    } finally {
      solving.value = false
    }
  }

  function clear(): void {
    rawSolution.value = null
    solveError.value  = null
  }

  const steps = computed<SolveStep[]>(() =>
    (rawSolution.value?.split(' ').filter(Boolean) ?? [])
      .map((move, i) => ({ n: i + 1, move })),
  )

  return { solve, solving, rawSolution, solveError, steps, clear }
}
