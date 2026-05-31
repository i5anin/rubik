import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  // Vite 8 (Rolldown): внутренние переменные HMR-клиента не заменяются
  // в production-бандле — определяем вручную
  define: {
    __BUNDLED_DEV__: false,
    __SERVER_FORWARD_CONSOLE__: false,
    __HMR_CONFIG_NAME__: JSON.stringify(''),
    __HMR_PROTOCOL__: JSON.stringify(''),
    __HMR_HOSTNAME__: JSON.stringify(''),
    __HMR_PORT__: JSON.stringify(''),
    __HMR_DIRECT_TARGET__: JSON.stringify(''),
    __HMR_BASE__: JSON.stringify('/'),
    __HMR_TIMEOUT__: 30000,
    __HMR_ENABLE_OVERLAY__: false,
    __SERVER_HOST__: JSON.stringify(''),
  },

  // cubejs — CJS-пакет, принудительно пре-бандлим
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
