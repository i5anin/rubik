<script setup lang="ts">
/**
 * Inline SVG icon set (lucide geometry). Stroke-based, inherits `currentColor`
 * and font size via `1em`, so an icon always matches the text next to it.
 * One <path d> table — add an entry to extend; no emoji anywhere in the UI.
 */
import { computed } from 'vue'

type IconName =
  | 'reset' | 'shuffle' | 'save' | 'solve'
  | 'download' | 'upload' | 'undo' | 'pencil' | 'close'
  | 'check' | 'check-circle' | 'sparkles' | 'chevron' | 'info' | 'alert'

const props = withDefaults(defineProps<{ name: IconName; size?: number | string }>(), {
  size: '1em',
})

// Each entry is the inner markup of a 24×24 viewBox icon.
const PATHS: Record<IconName, string> = {
  reset:        '<path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>',
  shuffle:      '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>',
  save:         '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
  solve:        '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  download:     '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  upload:       '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
  undo:         '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  pencil:       '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  close:        '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check:        '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  sparkles:     '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  chevron:      '<path d="m9 18 6-6-6-6"/>',
  info:         '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  alert:        '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
}

const inner = computed(() => PATHS[props.name])
</script>

<template>
  <!-- inner is a fixed internal SVG string from PATHS above, never user input -->
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="icon"
    v-html="inner"
  />
</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: -0.125em;
  flex-shrink: 0;
}
</style>
