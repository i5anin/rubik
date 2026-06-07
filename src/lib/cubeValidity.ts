/**
 * Physical-possibility check for a painted cube, beyond colour counts.
 *
 * Every corner (3 stickers) and edge (2 stickers) is a single physical piece.
 * A real piece can never carry two stickers of the same colour, nor two
 * colours from OPPOSITE faces (white/yellow, red/orange, green/blue) — those
 * faces sit on opposite sides and never meet on one cubie. Hand-painting
 * easily produces such impossible pieces, and the solver would just hang on
 * them, so we catch them up front.
 *
 * Note: this does NOT catch permutation/orientation parity (a cube can pass
 * this and still be unsolvable) — those are left to the solver + timeout.
 */
import type { FaceLetter } from '../types/cube'

// Faces are indexed in URFDLB order; offsets into the 54-char string.
const OFF: Record<FaceLetter, number> = { U: 0, R: 9, F: 18, D: 27, L: 36, B: 45 }

const OPPOSITE: Record<FaceLetter, FaceLetter> = {
  U: 'D', D: 'U', R: 'L', L: 'R', F: 'B', B: 'F',
}

/** Sticker global index = face offset + local 0..8. */
function gi(face: FaceLetter, local: number): number {
  return OFF[face] + local
}

// The 8 corners and 12 edges, each as the global sticker indices of one piece.
const CORNERS: number[][] = [
  [gi('U', 8), gi('R', 0), gi('F', 2)],
  [gi('U', 6), gi('F', 0), gi('L', 2)],
  [gi('U', 0), gi('L', 0), gi('B', 2)],
  [gi('U', 2), gi('B', 0), gi('R', 2)],
  [gi('D', 2), gi('F', 8), gi('R', 6)],
  [gi('D', 0), gi('L', 8), gi('F', 6)],
  [gi('D', 6), gi('B', 8), gi('L', 6)],
  [gi('D', 8), gi('R', 8), gi('B', 6)],
]

const EDGES: number[][] = [
  [gi('U', 5), gi('R', 1)], [gi('U', 7), gi('F', 1)],
  [gi('U', 3), gi('L', 1)], [gi('U', 1), gi('B', 1)],
  [gi('D', 5), gi('R', 7)], [gi('D', 1), gi('F', 7)],
  [gi('D', 3), gi('L', 7)], [gi('D', 7), gi('B', 7)],
  [gi('F', 5), gi('R', 3)], [gi('F', 3), gi('L', 5)],
  [gi('B', 5), gi('L', 3)], [gi('B', 3), gi('R', 5)],
]

export type PieceCheck = { ok: true } | { ok: false; reason: 'duplicate' | 'opposite' }

/** True if a set of sticker colours could exist on one physical piece. */
function pieceOk(colours: FaceLetter[]): PieceCheck {
  for (let i = 0; i < colours.length; i++) {
    for (let j = i + 1; j < colours.length; j++) {
      const a = colours[i]
      const b = colours[j]
      if (a === b) { return { ok: false, reason: 'duplicate' } }
      if (OPPOSITE[a] === b) { return { ok: false, reason: 'opposite' } }
    }
  }
  return { ok: true }
}

/** Check every corner and edge of a 54-char URFDLB string. */
export function checkPieces(facelet: string): PieceCheck {
  for (const piece of [...CORNERS, ...EDGES]) {
    const colours = piece.map(idx => facelet[idx] as FaceLetter)
    const res = pieceOk(colours)
    if (!res.ok) { return res }
  }
  return { ok: true }
}
