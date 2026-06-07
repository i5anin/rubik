/**
 * 3D cube model for the tutorial — a real cubelet simulation (no three.js).
 *
 * 26 cubelets at integer coords x,y,z ∈ {-1,0,1} (the hidden core is skipped).
 * Each cubelet carries the sticker colour facing each of the six directions;
 * a layer turn both moves the cubelets to new positions and cycles their
 * sticker colours, exactly like a physical turn. The CSS layer in Cube3D.vue
 * just renders this state and animates the in-between rotation.
 *
 * Axes:  x+ right, y+ up, z+ front.
 */
import { ref } from 'vue'
import { FACE_BG } from '../types/cube'
import type { FaceLetter } from '../types/cube'

export type Dir = 'U' | 'D' | 'L' | 'R' | 'F' | 'B'

export interface Cubelet {
  id: string
  x: number
  y: number
  z: number
  /** Sticker colour facing each direction, or null for an internal face. */
  colors: Record<Dir, string | null>
}

const C: Record<FaceLetter, string> = FACE_BG // U white, R red, F green, D yellow, L orange, B blue

function solved(): Cubelet[] {
  const list: Cubelet[] = []
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) { continue }
        list.push({
          id: `${x},${y},${z}`,
          x, y, z,
          colors: {
            U: y === 1 ? C.U : null,
            D: y === -1 ? C.D : null,
            R: x === 1 ? C.R : null,
            L: x === -1 ? C.L : null,
            F: z === 1 ? C.F : null,
            B: z === -1 ? C.B : null,
          },
        })
      }
    }
  }
  return list
}

type Vec = readonly [number, number, number]

const DIRS: Dir[] = ['U', 'D', 'L', 'R', 'F', 'B']
const DIR_VEC: Record<Dir, Vec> = {
  U: [0, 1, 0], D: [0, -1, 0],
  R: [1, 0, 0], L: [-1, 0, 0],
  F: [0, 0, 1], B: [0, 0, -1],
}

function vecToDir([x, y, z]: Vec): Dir {
  for (const d of DIRS) {
    const v = DIR_VEC[d]
    if (v[0] === x && v[1] === y && v[2] === z) { return d }
  }
  return 'U' // unreachable for unit axis vectors
}

/**
 * Clockwise 90° rotation of a vector around the given face's axis.
 * The SAME rotation is applied to a cubelet's position and to each of its
 * sticker directions, so position and colours can never drift apart — which
 * is what previously left some outer faces blank.
 */
function rotateVec(face: FaceLetter, [x, y, z]: Vec): Vec {
  switch (face) {
    case 'U': return [-z, y, x]
    case 'D': return [z, y, -x]
    case 'R': return [x, z, -y]
    case 'L': return [x, -z, y]
    case 'F': return [y, -x, z]
    case 'B': return [-y, x, z]
  }
}

/** One clockwise quarter-turn of a face, applied to the model. */
function turnCW(cubelets: Cubelet[], face: FaceLetter): void {
  for (const cl of cubelets) {
    if (!inLayer(cl, face)) { continue }

    // rotate position
    const [nx, ny, nz] = rotateVec(face, [cl.x, cl.y, cl.z])
    cl.x = nx; cl.y = ny; cl.z = nz

    // rotate sticker directions by the same matrix
    const old = { ...cl.colors }
    const next: Cubelet['colors'] = { U: null, D: null, L: null, R: null, F: null, B: null }
    for (const d of DIRS) {
      next[vecToDir(rotateVec(face, DIR_VEC[d]))] = old[d]
    }
    cl.colors = next
  }
}

export function useCube3D() {
  const cubelets = ref<Cubelet[]>(solved())

  function reset(): void {
    cubelets.value = solved()
  }

  /** Apply a move like "U", "R'", "F2" instantly to the model. */
  function applyMove(move: string): void {
    const face = move[0] as FaceLetter
    const mod = move.slice(1)
    const times = mod === '2' ? 2 : mod === "'" ? 3 : 1
    for (let i = 0; i < times; i++) { turnCW(cubelets.value, face) }
    cubelets.value = [...cubelets.value] // trigger reactivity
  }

  return { cubelets, reset, applyMove }
}

/** Which cubelets belong to a face's layer — used by the animation. */
export function inLayer(cl: Cubelet, face: FaceLetter): boolean {
  switch (face) {
    case 'U': return cl.y === 1
    case 'D': return cl.y === -1
    case 'R': return cl.x === 1
    case 'L': return cl.x === -1
    case 'F': return cl.z === 1
    case 'B': return cl.z === -1
  }
}

/** Rotation axis + sign for the CSS animation of a clockwise turn. */
export function turnTransform(face: FaceLetter, angle: number): string {
  switch (face) {
    case 'U': return `rotateY(${-angle}deg)`
    case 'D': return `rotateY(${angle}deg)`
    case 'R': return `rotateX(${-angle}deg)`
    case 'L': return `rotateX(${angle}deg)`
    case 'F': return `rotateZ(${-angle}deg)`
    case 'B': return `rotateZ(${angle}deg)`
  }
}
