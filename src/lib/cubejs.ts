/**
 * cubejs interop shim — the single import site for the solver.
 *
 * cubejs is a CoffeeScript-era package whose two modules share state through
 * the top-level `this`:
 *
 *   cube.js   →  this.Cube = Cube            // publish
 *   solve.js  →  Cube = this.Cube || …       // consume
 *
 * In a bundled ESM context top-level `this` is `undefined`, so `solve.js`
 * throws "Cannot read properties of undefined (reading 'Cube')" before the app
 * can mount.  The `this → globalThis` mapping that fixes it lives in
 * vite.config.ts (esbuildOptions.define for dev, commonjsOptions for build).
 * Funneling every consumer through this one module keeps that quirk in exactly
 * one place — nothing else imports 'cubejs' directly.
 */
import Cube from 'cubejs'

export default Cube
