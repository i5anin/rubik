import { reactive, computed } from 'vue'
import type { FaceLetter } from '../types/cube'
import { FACE_ORDER } from '../types/cube'

/** Начальное состояние — решённый куб (каждая грань одного цвета) */
function makeSolvedFaces(): Record<FaceLetter, FaceLetter[]> {
  const faces = {} as Record<FaceLetter, FaceLetter[]>
  for (const face of FACE_ORDER) {
    faces[face] = Array(9).fill(face) as FaceLetter[]
  }
  return faces
}

export function useCube() {
  const faces = reactive<Record<FaceLetter, FaceLetter[]>>(makeSolvedFaces())

  /** Покрасить клетку (центр [4] — заблокирован) */
  function setCell(face: FaceLetter, idx: number, color: FaceLetter) {
    if (idx === 4) return
    faces[face][idx] = color
  }

  /** Вернуть грань к цвету по умолчанию */
  function resetFace(face: FaceLetter) {
    faces[face] = Array(9).fill(face) as FaceLetter[]
  }

  /** Сбросить весь куб */
  function resetAll() {
    const fresh = makeSolvedFaces()
    for (const face of FACE_ORDER) {
      faces[face].splice(0, 9, ...fresh[face])
    }
  }

  /** 54-символьная строка в порядке URFDLB для kociemba */
  function toKociemba(): string {
    return FACE_ORDER.map(f => faces[f].join('')).join('')
  }

  /** Валидация состояния */
  const validation = computed<{ ok: boolean; errorFace?: FaceLetter; errorCount?: number }>(() => {
    const s = toKociemba()
    for (const face of FACE_ORDER) {
      const count = [...s].filter(c => c === face).length
      if (count !== 9) return { ok: false, errorFace: face, errorCount: count }
    }
    return { ok: true }
  })

  /** Загрузить состояние из 54-символьной kociemba-строки (U/R/F/D/L/B) */
  function fromKociemba(kStr: string) {
    for (let i = 0; i < 6; i++) {
      const face = FACE_ORDER[i]
      faces[face].splice(0, 9, ...(kStr.slice(i * 9, i * 9 + 9).split('') as FaceLetter[]))
    }
  }

  /** Сколько раз встречается каждый цвет */
  const colorCounts = computed(() => {
    const s = toKociemba()
    const res = {} as Record<FaceLetter, number>
    for (const face of FACE_ORDER) {
      res[face] = [...s].filter(c => c === face).length
    }
    return res
  })

  return { faces, setCell, resetFace, resetAll, toKociemba, fromKociemba, validation, colorCounts }
}
