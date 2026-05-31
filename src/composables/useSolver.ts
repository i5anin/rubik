import { ref, computed } from 'vue'
import Cube from 'cubejs'

let solverReady = false

/** Инициализировать таблицы один раз (синхронно, ~0.5с) */
async function ensureInit() {
  if (solverReady) {return}
  // defer чтобы UI успел обновиться
  await new Promise<void>(resolve => setTimeout(resolve, 30))
  Cube.initSolver()
  solverReady = true
}

// Описание каждого конкретного хода — максимально понятно
const MOVE_DESC: Record<string, string> = {
  // Верхний слой (смотришь сверху вниз)
  'U':  'Верх: смотришь сверху → крути по часовой ↻',
  "U'": 'Верх: смотришь сверху → крути против часовой ↺',
  'U2': 'Верх: смотришь сверху → два щелчка ↻↻',
  // Нижний слой (смотришь снизу вверх)
  'D':  'Низ: смотришь снизу → крути по часовой ↻',
  "D'": 'Низ: смотришь снизу → крути против часовой ↺',
  'D2': 'Низ: смотришь снизу → два щелчка ↻↻',
  // Правый слой (смотришь справа)
  'R':  'Право: смотришь справа → крути по часовой ↻',
  "R'": 'Право: смотришь справа → крути против часовой ↺',
  'R2': 'Право: смотришь справа → два щелчка ↻↻',
  // Левый слой (смотришь слева)
  'L':  'Лево: смотришь слева → крути по часовой ↻',
  "L'": 'Лево: смотришь слева → крути против часовой ↺',
  'L2': 'Лево: смотришь слева → два щелчка ↻↻',
  // Передний слой (смотришь спереди — обычная позиция)
  'F':  'Перед: крути по часовой ↻',
  "F'": 'Перед: крути против часовой ↺',
  'F2': 'Перед: два щелчка ↻↻',
  // Задний слой (смотришь сзади)
  'B':  'Зад: смотришь сзади → крути по часовой ↻',
  "B'": 'Зад: смотришь сзади → крути против часовой ↺',
  'B2': 'Зад: смотришь сзади → два щелчка ↻↻',
}

function describeMove(m: string): string {
  return MOVE_DESC[m] ?? m
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
