import { createApp } from 'vue'
import { inject as injectAnalytics } from '@vercel/analytics'
import App from './App.vue'
import { vTooltip } from './directives/tooltip'
import './style.css'

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const app = createApp(App)
app.directive('tooltip', vTooltip)
app.mount('#app')

// Vercel Web Analytics — page views & visitors (no-op outside production)
injectAnalytics()
