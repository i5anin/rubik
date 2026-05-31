import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Pinned to the Vite 7 (Rollup) line.
 *
 * Vite 8 publishes as `latest` but ships the new Rolldown bundler, which —
 * as of 8.0.14 — inlines its own dev/HMR client runtime (`env.mjs`, the
 * `__BUNDLED_DEV__` / `__SERVER_FORWARD_CONSOLE__` / `__HMR_*__` globals) into
 * the production bundle, crashing the deployed app with ReferenceError /
 * SyntaxError.  Hand-defining those private symbols is whack-a-mole — each
 * one patched reveals the next.  Vite 7 emits a clean, self-contained
 * production build with zero dev-runtime leakage, so the entire `define`
 * workaround is deleted rather than extended.
 */
export default defineConfig({
  plugins: [vue()],

  // cubejs is a UMD/CommonJS package — pre-bundle it so its `module.exports`
  // is interop-wrapped into a proper ESM default export.
  optimizeDeps: {
    include: ['cubejs'],
  },
  build: {
    commonjsOptions: {
      include: [/cubejs/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
})
