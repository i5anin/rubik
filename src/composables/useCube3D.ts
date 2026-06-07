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

// Cycle four sticker directions: new[a] = old[d], new[b] = old[a], … (a←b←c←d←a)
function cycleColors(c: Cubelet['colors'], order: [Dir, Dir, Dir, Dir]): void {
  const [a, b, cc, d] = order
  const last = c[d]
  c[d] = c[cc]; c[cc] = c[b]; c[b] = c[a]; c[a] = last
}

/** One clockwise quarter-turn of a face, applied to the model. */
function turnCW(cubelets: Cubelet[], face: FaceLetter): void {
  for (const cl of cubelets) {
    let inLayer = false
    switch (face) {
      case 'U': if (cl.y === 1)  { inLayer = true; [cl.x, cl.z] = [-cl.z, cl.x];  cycleColors(cl.colors, ['F', 'L', 'B', 'R']) } break
      case 'D': if (cl.y === -1) { inLayer = true; [cl.x, cl.z] = [cl.z, -cl.x];  cycleColors(cl.colors, ['F', 'R', 'B', 'L']) } break
      case 'R': if (cl.x === 1)  { inLayer = true; [cl.y, cl.z] = [cl.z, -cl.y];  cycleColors(cl.colors, ['U', 'F', 'D', 'B']) } break
      case 'L': if (cl.x === -1) { inLayer = true; [cl.y, cl.z] = [-cl.z, cl.y];  cycleColors(cl.colors, ['U', 'B', 'D', 'F']) } break
      case 'F': if (cl.z === 1)  { inLayer = true; [cl.x, cl.y] = [cl.y, -cl.x];  cycleColors(cl.colors, ['U', 'L', 'D', 'R']) } break
      case 'B': if (cl.z === -1) { inLayer = true; [cl.x, cl.y] = [-cl.y, cl.x];  cycleColors(cl.colors, ['U', 'R', 'D', 'L']) } break
    }
    void inLayer
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
