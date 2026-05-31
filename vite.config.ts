import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Vite 8 (Rolldown).
 *
 * No `define` block: the earlier __BUNDLED_DEV__ / __HMR_*__ overrides were a
 * mistake — `define` performs a global text substitution that also rewrites
 * Vite's own dev-client (`env.mjs`), corrupting its syntax. Those symbols are
 * dev-server internals and must never be touched from userland. A clean
 * production `vite build` never references them.
 */
export default defineConfig({
  plugins: [vue()],

  // cubejs ends each module with `}).call(this)`, expecting top-level `this`
  // to be `module.exports` (CJS) or `window` (browser). In a pre-bundled ESM
  // dep, top-level `this` is `undefined` → "reading 'Cube' of undefined",
  // which leaves #app empty in dev. Map `this` → `globalThis` for the dev
  // pre-bundle so the IIFE has a real object to attach to.
  //
  // NB: Vite 8 deprecates `esbuildOptions` in favour of `rolldownOptions`,
  // but Rolldown's optimizer does not yet accept `define` here
  // ("Invalid key: Expected never but received 'define'"), so esbuildOptions
  // remains the working path. The deprecation log line is harmless.
  // (`build` solves the same problem via commonjsOptions below.)
  optimizeDeps: {
    include: ['cubejs'],
    esbuildOptions: {
      define: { this: 'globalThis' },
    },
  },
  build: {
    commonjsOptions: {
      include: [/cubejs/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
})
