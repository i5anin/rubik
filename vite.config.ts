import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * cubejs closes its modules with `}).call(this)`, relying on top-level `this`
 * being a real object (module.exports / window). In a bundled ESM context it
 * is `undefined`, so `this.Cube` throws. A global `define: { this }` is unsafe
 * (it would rewrite `this` everywhere, including Vue internals), and Rolldown
 * ignores `rollupOptions.moduleContext`. So patch the source surgically — only
 * cubejs files, only the `.call(this)` tail — before any bundler touches it.
 * Runs `pre`, in both dev and build.
 */
function cubejsThisFix(): Plugin {
  return {
    name: 'cubejs-this-fix',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('cubejs') || !code.includes('.call(this)')) { return null }
      return { code: code.replaceAll('.call(this)', '.call(globalThis)'), map: null }
    },
  }
}

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
  plugins: [cubejsThisFix(), vue()],

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
