/**
 * Solver Web Worker.
 *
 * cubejs's solve() is synchronous and, on a cube that passes colour-count
 * checks but is physically unsolvable (bad parity from hand-painting), it can
 * spin in a long/endless search. Running it here keeps the main thread (and
 * the UI) responsive, and lets useSolver kill a hung run via a timeout.
 *
 * Protocol: postMessage(faceletString) → postMessage({ ok, solution? , error? })
 */
import Cube from '../lib/cubejs'

let ready = false

self.onmessage = (e: MessageEvent<string>): void => {
  try {
    if (!ready) {
      Cube.initSolver() // build pruning tables once (heavy, sync)
      ready = true
    }
    const solution = Cube.fromString(e.data).solve()
    self.postMessage({ ok: true, solution })
  } catch (err) {
    self.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) })
  }
}
