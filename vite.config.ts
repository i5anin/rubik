import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  // Vite 8: __BUNDLED_DEV__ не определён в production-бандле
  define: {
    __BUNDLED_DEV__: JSON.stringify(false),
  },

  // cubejs — CJS-пакет, принудительно пре-бандлим его
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
