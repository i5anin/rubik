<script setup lang="ts">
import { ref } from 'vue'
import { t } from '../i18n'
const show = ref(false)

</script>

<template>
  <div class="wrap" @mouseenter="show = true" @mouseleave="show = false">
    <button class="algo-btn" :title="t('algo.title')">⚙</button>
    <Transition name="pop">
      <div v-if="show" class="popover">
        <div class="pop-title">{{ t('algo.title') }}</div>
        <div class="pop-name">Kociemba Two-Phase</div>
        <div class="pop-rows">
          <div class="pop-row"><span class="pop-key">{{ t('algo.author') }}</span><span class="pop-val">Herbert Kociemba, 1992</span></div>
          <div class="pop-row"><span class="pop-key">{{ t('algo.guarantee') }}</span><span class="pop-val pop-green">{{ t('algo.guarantee.v') }}</span></div>
          <div class="pop-row"><span class="pop-key">{{ t('algo.time') }}</span><span class="pop-val">&lt; 1s</span></div>
          <div class="pop-row"><span class="pop-key">{{ t('algo.lib') }}</span><span class="pop-val pop-blue">cubejs v1.3</span></div>
        </div>
        <div class="pop-divider" />
        <div class="pop-desc">{{ t('algo.desc') }}</div>
        <div class="pop-nt-title">{{ t('algo.notation') }}</div>
        <div class="pop-nt-grid">
          <span><b>U R F D L B</b> {{ t('algo.notation.cw') }}</span>
          <span><b>U' R' …</b> {{ t('algo.notation.ccw') }}</span>
          <span><b>U2 R2 …</b> {{ t('algo.notation.180') }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.wrap { position:relative; display:inline-block; }
.algo-btn {
  background:#222; border:1px solid #333; border-radius:8px; color:#888;
  font-size:16px; width:34px; height:34px; cursor:pointer;
  display:flex; align-items:center; justify-content:center; transition:color .15s,border-color .15s;
}
.algo-btn:hover { color:#ffd60a; border-color:#ffd60a44; }
.popover {
  position:absolute; top:calc(100% + 10px); right:0; background:#1a1a1a;
  border:1px solid #333; border-radius:12px; padding:16px 18px;
  width:280px; z-index:200; box-shadow:0 8px 32px rgba(0,0,0,.6);
}
.pop-title { font-size:11px; font-weight:700; color:#666; text-transform:uppercase; letter-spacing:.06em; margin-bottom:6px; }
.pop-name  { font-size:16px; font-weight:800; color:#ffd60a; margin-bottom:12px; }
.pop-rows  { display:flex; flex-direction:column; gap:6px; }
.pop-row   { display:flex; justify-content:space-between; font-size:12px; }
.pop-key   { color:#555; }
.pop-val   { color:#ccc; }
.pop-green { color:#2dc653; font-weight:700; }
.pop-blue  { color:#4895ef; }
.pop-divider { border:none; border-top:1px solid #2a2a2a; margin:12px 0; }
.pop-desc    { font-size:11px; color:#666; line-height:1.6; margin-bottom:12px; }
.pop-nt-title { font-size:11px; font-weight:700; color:#555; margin-bottom:6px; }
.pop-nt-grid  { display:flex; flex-direction:column; gap:4px; font-size:11px; color:#666; }
.pop-nt-grid b { color:#aaa; font-family:monospace; }
.pop-enter-active { transition:opacity .15s,transform .15s; }
.pop-leave-active { transition:opacity .1s,transform .1s; }
.pop-enter-from,.pop-leave-to { opacity:0; transform:translateY(-4px); }
</style>
