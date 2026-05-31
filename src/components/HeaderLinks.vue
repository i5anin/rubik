<script setup lang="ts">
import { ref } from 'vue'
import { GITHUB_URL, CRYPTO_ADDR, CRYPTO_LABEL } from '../config'
import { t, lang, toggleLang } from '../i18n'
import AlgoInfo from './AlgoInfo.vue'

const copied = ref(false)

async function copyAddr() {
  await navigator.clipboard.writeText(CRYPTO_ADDR)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div class="links">

    <!-- Переключатель языка -->
    <button class="lang-btn" :title="lang === 'ru' ? 'Switch to English' : 'Переключить на русский'" @click="toggleLang">
      <span class="lang-flag">{{ lang === 'ru' ? '🇷🇺' : '🇺🇸' }}</span>
      <span class="lang-code">{{ lang === 'ru' ? 'RU' : 'EN' }}</span>
    </button>

    <!-- GitHub -->
    <a :href="GITHUB_URL" target="_blank" rel="noopener" class="icon-btn" :title="t('header.github')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57
                 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695
                 -.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99
                 .105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225
                 -.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405
                 c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225
                 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3
                 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    </a>

    <!-- Crypto -->
    <button
      class="icon-btn crypto-btn"
      :class="{ copied }"
      :title="copied ? t('header.copied') : `${CRYPTO_LABEL}: ${CRYPTO_ADDR}`"
      @click="copyAddr"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.5 8.5c.83-1.5 2.17-2.5 3.5-2.5 2.21 0 4 2.24 4 5s-1.79 5-4 5c-1.33 0-2.67-1-3.5-2.5"/>
        <path d="M7 12h10"/>
      </svg>
      <span class="crypto-label">{{ copied ? t('header.copied') : t('header.donate') }}</span>
    </button>

    <!-- Алгоритм -->
    <AlgoInfo />
  </div>
</template>

<style scoped>
.links { display:flex; align-items:center; gap:8px; }

/* Переключатель языка */
.lang-btn {
  display:flex; align-items:center; gap:5px;
  background:#1e1e1e; border:1px solid #2a2a2a; border-radius:8px;
  color:#bbb; font-size:12px; font-weight:700; padding:6px 10px;
  cursor:pointer; transition:color .15s,border-color .15s,background .15s;
}
.lang-btn:hover { color:#fff; border-color:#555; background:#252525; }
.lang-flag { font-size:14px; line-height:1; }
.lang-code { font-size:11px; letter-spacing:.05em; }

/* Общая кнопка-иконка */
.icon-btn {
  display:flex; align-items:center; gap:6px;
  background:#1e1e1e; border:1px solid #2a2a2a; border-radius:8px;
  color:#888; text-decoration:none; font-size:12px; padding:7px 10px;
  cursor:pointer; transition:color .15s,border-color .15s,background .15s;
}
.icon-btn:hover { color:#ddd; border-color:#444; background:#252525; }
a.icon-btn:hover { color:#fff; }

.crypto-btn { gap:6px; }
.crypto-btn.copied { color:#2dc653; border-color:#2dc65344; }
.crypto-label { font-size:11px; font-weight:600; }
</style>
