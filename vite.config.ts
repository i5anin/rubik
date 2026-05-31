import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

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
