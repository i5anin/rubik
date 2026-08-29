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

// Reference pieces — colours in the SAME sticker order as CORNERS / EDGES
// above (each corner starts with its U/D facelet; each edge starts with its
// U/D facelet, or F/B for the middle-layer edges).
const CORNER_REF: FaceLetter[][] = [
  ['U', 'R', 'F'], ['U', 'F', 'L'], ['U', 'L', 'B'], ['U', 'B', 'R'],
  ['D', 'F', 'R'], ['D', 'L', 'F'], ['D', 'B', 'L'], ['D', 'R', 'B'],
]
const EDGE_REF: FaceLetter[][] = [
  ['U', 'R'], ['U', 'F'], ['U', 'L'], ['U', 'B'],
  ['D', 'R'], ['D', 'F'], ['D', 'L'], ['D', 'B'],
  ['F', 'R'], ['F', 'L'], ['B', 'L'], ['B', 'R'],
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

// ── Full solvability (parity) check ─────────────────────────────────────────

/** Index of the reference piece whose colour-set matches, or -1. */
function matchPiece(colours: FaceLetter[], refs: FaceLetter[][]): number {
  const key = [...colours].sort().join('')
  return refs.findIndex(ref => [...ref].sort().join('') === key)
}

/** Parity (0 even / 1 odd) of a permutation given as an array of indices. */
function permParity(perm: number[]): number {
  const seen = new Array<boolean>(perm.length).fill(false)
  let parity = 0
  for (let i = 0; i < perm.length; i++) {
    if (seen[i]) { continue }
    let len = 0
    let j = i
    while (!seen[j]) { seen[j] = true; j = perm[j] ?? j; len++ }
    if (len % 2 === 0) { parity ^= 1 } // even-length cycle = odd permutation
  }
  return parity
}

export type SolvableCheck =
  | { ok: true }
  | { ok: false; reason: 'pieces' | 'corner-twist' | 'edge-flip' | 'permutation' }

/**
 * Is this colouring actually solvable? Beyond colour counts and piece
 * validity, a 3×3 cube is solvable iff all three hold:
 *   1. corner orientations sum ≡ 0 (mod 3)
 *   2. edge orientations sum ≡ 0 (mod 2)
 *   3. corner-permutation parity == edge-permutation parity
 */
export function checkSolvable(facelet: string): SolvableCheck {
  if (!checkPieces(facelet).ok) { return { ok: false, reason: 'pieces' } }

  // ── corners ──
  const cornerPerm: number[] = []
  let cornerOri = 0
  for (const piece of CORNERS) {
    const cols = piece.map(idx => facelet[idx] as FaceLetter)
    const id = matchPiece(cols, CORNER_REF)
    if (id < 0) { return { ok: false, reason: 'pieces' } }
    cornerPerm.push(id)
    // orientation = index of the U/D-coloured sticker (0,1,2)
    const ori = cols.findIndex(c => c === 'U' || c === 'D')
    if (ori < 0) { return { ok: false, reason: 'pieces' } }
    cornerOri += ori
  }
  if (cornerOri % 3 !== 0) { return { ok: false, reason: 'corner-twist' } }

  // ── edges ──
  const edgePerm: number[] = []
  let edgeOri = 0
  EDGES.forEach((piece, i) => {
    const cols = piece.map(idx => facelet[idx] as FaceLetter)
    edgePerm.push(matchPiece(cols, EDGE_REF))
    // primary sticker is cols[0]; "good" (0) when it carries an axis colour
    const primary = cols[0]
    const good = i < 8
      ? primary === 'U' || primary === 'D'   // U/D-layer edges
      : primary === 'F' || primary === 'B'   // middle-layer edges
    if (!good) { edgeOri++ }
  })
  if (edgePerm.some(id => id < 0)) { return { ok: false, reason: 'pieces' } }
  if (edgeOri % 2 !== 0) { return { ok: false, reason: 'edge-flip' } }

  // ── permutation parity must match ──
  if (permParity(cornerPerm) !== permParity(edgePerm)) {
    return { ok: false, reason: 'permutation' }
  }
  return { ok: true }
}
