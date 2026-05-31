/**
 * Core cube domain types.
 * Single source of truth: FaceLetter is *derived* from FACE_ORDER — the
 * two can never drift apart.
 */

/** Immutable face-order array — Kociemba URFDLB encoding. */
export const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'] as const

/** Union type derived from the array above. */
export type FaceLetter = (typeof FACE_ORDER)[number]

/**
 * Background hex colours for each face sticker.
 * `satisfies` preserves string literals (for IDE autocomplete) while
 * enforcing the `#${string}` constraint at compile-time.
 */
export const FACE_BG = {
  U: '#f0f0f0',
  R: '#e63946',
  F: '#2dc653',
  D: '#ffd60a',
  L: '#f77f00',
  B: '#4895ef',
} as const satisfies Record<FaceLetter, `#${string}`>

/** Foreground text colour overlaid on each face background. */
export const FACE_TEXT = {
  U: '#111111',
  R: '#ffffff',
  F: '#ffffff',
  D: '#111111',
  L: '#ffffff',
  B: '#ffffff',
} as const satisfies Record<FaceLetter, `#${string}`>

/** English colour name displayed below each face grid. */
export const FACE_SUBLABEL = {
  U: 'White',
  R: 'Red',
  F: 'Green',
  D: 'Yellow',
  L: 'Orange',
  B: 'Blue',
} as const satisfies Record<FaceLetter, string>

/** Zero-based index of the centre sticker within a nine-element face array. */
export const CENTER_IDX = 4 as const
