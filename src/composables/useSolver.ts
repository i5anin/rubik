import { ref, computed } from 'vue'
import Cube from 'cubejs'

let solverReady = false

/** Инициализировать таблицы один раз (синхронно, ~0.5с) */
async function ensureInit() {
  if (solverReady) return
  // defer чтобы UI успел обновиться
  await new Promise<void>(resolve => setTimeout(resolve, 30))
  Cube.initSolver()
  solverReady = true
}

const MOVE_NAME: Record<string, string> = {
  U: 'Верхний слой',
  D: 'Нижний слой',
  R: 'Правый слой',
  L: 'Левый слой',
  F: 'Передний слой',
  B: 'Задний слой',
}

function describeMove(m: string): string {
  const face = m[0] ?? ''
  const mod = m.slice(1)
  const name = MOVE_NAME[face] ?? face
  if (mod === '2') return `${name} — 180°`
  if (mod === "'") return `${name} — 90° против часовой`
  return `${name} — 90° по часовой`
}

export interface SolveStep {
  n: number
  move: string
  desc: string
}

export function useSolver() {
  const solving = ref(false)
  const rawSolution = ref<string | null>(null)
  const solveError = ref<string | null>(null)

  async function solve(kStr: string) {
    solving.value = true
    rawSolution.value = null
    solveError.value = null
    try {
      // Workaround: cubejs 1.x для identity возвращает 14-ходовое тождество вместо ''
      // Проверяем сами: каждая группа из 9 символов — один цвет
      const alreadySolved = Array.from({ length: 6 }, (_, i) =>
        kStr.slice(i * 9, i * 9 + 9).split('').every(c => c === kStr[i * 9])
      ).every(Boolean)
      if (alreadySolved) {
        rawSolution.value = ''
        return
      }
      await ensureInit()
      const cube = Cube.fromString(kStr)
      rawSolution.value = cube.solve()
    } catch (e: unknown) {
      solveError.value =
        e instanceof Error ? e.message : `Куб нерешаем (${String(e)})`
    } finally {
      solving.value = false
    }
  }

  function clear() {
    rawSolution.value = null
    solveError.value = null
  }

  const steps = computed<SolveStep[]>(() =>
    (rawSolution.value?.split(' ').filter(Boolean) ?? []).map((m, i) => ({
      n: i + 1,
      move: m,
      desc: describeMove(m),
    }))
  )

  return { solve, solving, rawSolution, solveError, steps, clear }
}
