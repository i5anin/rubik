/**
 * Reactive Rubik's Cube state manager.
 *
 * The cube state is a flat Record<FaceLetter, FaceLetter[]> where each value
 * is a nine-element array of sticker colours, read left-to-right top-to-bottom.
 * The centre sticker (index 4) is immutable — its colour defines the face.
 */

import { reactive, computed } from 'vue'
import type { FaceLetter } from '../types/cube'
import { FACE_ORDER, CENTER_IDX } from '../types/cube'
import { checkPieces } from '../lib/cubeValidity'

// ── Helpers ───────────────────────────────────────────────────────────────

/** Returns a fully-solved cube (each face is a uniform nine-sticker array). */
function makeSolvedFaces(): Record<FaceLetter, FaceLetter[]> {
  return Object.fromEntries(
    FACE_ORDER.map(face => [face, Array<FaceLetter>(9).fill(face)]),
  ) as Record<FaceLetter, FaceLetter[]>
}

/** Count occurrences of a character in a string — O(n), allocation-free. */
function countChar(str: string, char: string): number {
  let n = 0
  for (const c of str) { if (c === char) { n++ } }
  return n
}

// ── Composable ────────────────────────────────────────────────────────────

export function useCube() {
  const faces = reactive<Record<FaceLetter, FaceLetter[]>>(makeSolvedFaces())

  /** Paint a sticker.  The centre (index 4) is locked and silently ignored. */
  function setCell(face: FaceLetter, idx: number, colour: FaceLetter): void {
    if (idx === CENTER_IDX) { return }
    faces[face][idx] = colour
  }

  /** Reset all six faces to the solved state. */
  function resetAll(): void {
    FACE_ORDER.forEach(face => { faces[face].splice(0, 9, ...Array<FaceLetter>(9).fill(face)) })
  }

  /** Encode the current state as a 54-character URFDLB Kociemba string. */
  function toKociemba(): string {
    return FACE_ORDER.map(f => faces[f].join('')).join('')
  }

  /**
   * Decode a 54-character Kociemba string back into reactive face arrays.
   * Used when loading a saved configuration or applying a move.
   */
  function fromKociemba(kStr: string): void {
    FACE_ORDER.forEach((face, i) => {
      const chunk = Array.from(kStr.slice(i * 9, i * 9 + 9)) as FaceLetter[]
      faces[face].splice(0, 9, ...chunk)
    })
  }

  /**
   * Structural validation.
   * Returns ok:true when every colour appears exactly nine times.
   * Parity (orientation/permutation) is verified later by the solver itself.
   */
  const validation = computed<{
    readonly ok:         true
  } | {
    readonly ok:         false
    readonly errorFace:  FaceLetter
    readonly errorCount: number
  } | {
    readonly ok:         false
    readonly impossible: true
  }>(() => {
    const s = toKociemba()
    for (const face of FACE_ORDER) {
      const count = countChar(s, face)
      if (count !== 9) { return { ok: false, errorFace: face, errorCount: count } }
    }
    // colour counts fine → check that every corner/edge is a possible piece
    if (!checkPieces(s).ok) { return { ok: false, impossible: true } }
    return { ok: true }
  })

  /** Sticker count per colour — used by the ValidationChip bar chart. */
  const colorCounts = computed<Record<FaceLetter, number>>(() => {
    const s = toKociemba()
    return Object.fromEntries(
      FACE_ORDER.map(face => [face, countChar(s, face)]),
    ) as Record<FaceLetter, number>
  })

  return { faces, setCell, resetAll, toKociemba, fromKociemba, validation, colorCounts }
}
