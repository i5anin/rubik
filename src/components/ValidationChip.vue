<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FaceLetter } from '../types/cube'
import { FACE_ORDER, FACE_BG } from '../types/cube'
import { t } from '../i18n'
import Icon from './Icon.vue'

const props = defineProps<{
  ok: boolean
  errorFace?: FaceLetter
  errorCount?: number
  colorCounts: Record<FaceLetter, number>
}>()

const show = ref(false)

const chipMsg = computed(() => {
  if (props.ok) { return t('valid.ok') }
  if (props.errorFace !== undefined && props.errorCount !== undefined) {
    return `${t(`color.${props.errorFace}`)}: ${props.errorCount}/9`
  }
  return t('valid.ok')
})

const rows = computed(() =>
  FACE_ORDER.map(f => ({
    face: f,
    name: t(`color.${f}`),
    count: (props.colorCounts[f] as number | undefined) ?? 0,
    ok: ((props.colorCounts[f] as number | undefined) ?? 0) === 9,
    bg: FACE_BG[f],
  }))
)


</script>

<template>
  <div class="chip-wrap" @mouseenter="show = true" @mouseleave="show = false">
    <div class="chip" :class="ok ? 'ok' : 'err'">
      <Icon :name="ok ? 'check-circle' : 'close'" />
      {{ chipMsg }}
    </div>

    <Transition name="pop">
      <div v-if="show" class="tooltip-box">
        <div class="tt-title">{{ t('valid.tooltip.title') }}</div>
        <div class="tt-rows">
          <div v-for="r in rows" :key="r.face" class="tt-row">
            <span class="tt-dot" :style="{ background: r.bg }" />
            <span class="tt-name">{{ r.name }}</span>
            <div class="tt-bar-wrap">
              <div class="tt-bar-fill" :class="{ err: !r.ok }"
                :style="{ width: (r.count / 9 * 100) + '%', background: r.bg }" />
            </div>
            <span class="tt-count" :class="{ err: !r.ok }">{{ r.count }}/9</span>
            <Icon :name="r.ok ? 'check' : 'close'" class="tt-icon"
              :style="{ color: r.ok ? '#2dc653' : '#e63946' }" />
          </div>
        </div>
        <div class="tt-divider" />
        <div class="tt-footer">
          <span>{{ t('valid.centers') }}</span>
          <span class="tt-ok">{{ t('valid.centers.ok') }}</span>
        </div>
        <div class="tt-footer" style="margin-top:3px">
          <span>{{ t('valid.parity') }}</span>
          <span class="tt-note">{{ t('valid.parity.note') }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.chip-wrap { position:relative; display:inline-block; }
.chip {
  display:inline-flex; align-items:center; gap:6px;
  font-size:13px; padding:7px 14px; border-radius:20px;
  font-weight:500; cursor:default; user-select:none; transition:opacity .15s;
}
.chip:hover { opacity:.85; }
.chip.ok  { background:rgba(45,198,83,.12);  color:#2dc653; }
.chip.err { background:rgba(230,57,70,.12);  color:#e63946; }

.tooltip-box {
  position:absolute; top:calc(100% + 10px); left:50%; transform:translateX(-50%);
  background:#1a1a1a; border:1px solid #333; border-radius:12px;
  padding:14px 16px; width:260px; z-index:200; box-shadow:0 8px 32px rgba(0,0,0,.5);
}
.tt-title { font-size:11px; font-weight:700; color:#666; text-transform:uppercase; letter-spacing:.06em; margin-bottom:10px; }
.tt-rows  { display:flex; flex-direction:column; gap:6px; }
.tt-row   { display:flex; align-items:center; gap:7px; font-size:12px; }
.tt-dot   { width:10px; height:10px; border-radius:3px; flex-shrink:0; }
.tt-name  { color:#aaa; width:75px; flex-shrink:0; }
.tt-bar-wrap { flex:1; height:6px; background:#2a2a2a; border-radius:3px; overflow:hidden; }
.tt-bar-fill { height:100%; border-radius:3px; transition:width .3s; opacity:.8; }
.tt-bar-fill.err { background:#e63946!important; }
.tt-count     { font-size:11px; color:#666; width:26px; text-align:right; flex-shrink:0; }
.tt-count.err { color:#e63946; font-weight:700; }
.tt-icon      { width:13px; height:13px; flex-shrink:0; }
.tt-divider   { border:none; border-top:1px solid #2a2a2a; margin:10px 0 8px; }
.tt-footer    { display:flex; justify-content:space-between; font-size:11px; color:#555; }
.tt-ok   { color:#2dc653; }
.tt-note { color:#4895ef; }

.pop-enter-active { transition:opacity .15s,transform .15s; }
.pop-leave-active { transition:opacity .1s,transform .1s; }
.pop-enter-from,.pop-leave-to { opacity:0; transform:translateX(-50%) translateY(-4px); }
</style>
