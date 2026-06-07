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
import { FACE_ORDER } from '../types/cube'

// ── Solver worker ──────────────────────────────────────────────────────────
// Runs cubejs off the main thread so the UI never freezes, and so a hung
// search on an unsolvable cube can be terminated by timeout.

interface SolveResult { ok: boolean; solution?: string; error?: string }

let worker: Worker | null = null

function getWorker(): Worker {
  worker ??= new Worker(new URL('../workers/solver.worker.ts', import.meta.url), { type: 'module' })
  return worker
}

const SOLVE_TIMEOUT_MS = 5000

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

  // Lets the UI abort an in-flight (possibly hung) solve.
  let cancelCurrent: (() => void) | null = null

  async function solve(kStr: string): Promise<void> {
    solving.value     = true
    rawSolution.value = null
    solveError.value  = null

    if (isAlreadySolved(kStr)) { rawSolution.value = ''; solving.value = false; return }

    const w = getWorker()
    await new Promise<void>((resolve) => {
      const finish = (): void => { cancelCurrent = null; solving.value = false; resolve() }
      const timeout = setTimeout(() => {
        w.terminate(); worker = null // hung search — kill it
        solveError.value = 'Не удалось решить за отведённое время — скорее всего, такая раскраска невозможна на настоящем кубе. Проверьте цвета.'
        finish()
      }, SOLVE_TIMEOUT_MS)

      // user-triggered cancel: stop the worker, no error message
      cancelCurrent = (): void => {
        clearTimeout(timeout)
        w.terminate(); worker = null
        finish()
      }

      w.onmessage = (e: MessageEvent<SolveResult>): void => {
        clearTimeout(timeout)
        if (e.data.ok && e.data.solution !== undefined) {
          rawSolution.value = e.data.solution
        } else {
          solveError.value = 'Куб нерешаем — проверьте раскраску (такое расположение цветов невозможно собрать).'
        }
        finish()
      }
      w.onerror = (): void => {
        clearTimeout(timeout)
        solveError.value = 'Ошибка решателя.'
        finish()
      }

      w.postMessage(kStr)
    })
  }

  /** Abort an in-progress solve (UI cancel button). */
  function cancel(): void {
    cancelCurrent?.()
  }

  function clear(): void {
    rawSolution.value = null
    solveError.value  = null
  }

  const steps = computed<SolveStep[]>(() =>
    (rawSolution.value?.split(' ').filter(Boolean) ?? [])
      .map((move, i) => ({ n: i + 1, move })),
  )

  return { solve, cancel, solving, rawSolution, solveError, steps, clear }
}
