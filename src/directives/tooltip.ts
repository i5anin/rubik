/**
 * v-tooltip — a styled replacement for the native `title` attribute.
 *
 * Usage:  <button v-tooltip="'Reset the cube'">…</button>
 *         <button v-tooltip="t('saved.delete')">…</button>
 *
 * One shared bubble is reused for every target (created lazily, appended to
 * <body>), positioned above the element — or below if there's no room — and
 * clamped inside the viewport. The value is reactive: changing the bound
 * string updates the bubble while it's open (e.g. "Copy" → "Copied!").
 */
import type { Directive } from 'vue'

let bubble: HTMLElement | null = null

function ensureBubble(): HTMLElement {
  bubble ??= (() => {
    const el = document.createElement('div')
    el.className = 'app-tooltip'
    el.setAttribute('role', 'tooltip')
    document.body.appendChild(el)
    return el
  })()
  return bubble
}

function show(target: HTMLElement, text: string): void {
  if (text === '') { return }
  const tip = ensureBubble()
  tip.textContent = text
  tip.classList.add('visible')

  const r = target.getBoundingClientRect()
  const tr = tip.getBoundingClientRect()
  const gap = 8

  let top = r.top - tr.height - gap
  if (top < 6) { top = r.bottom + gap }                 // flip below if clipped
  const left = Math.min(
    Math.max(6, r.left + r.width / 2 - tr.width / 2),   // centre, clamped
    window.innerWidth - tr.width - 6,
  )
  tip.style.top = `${top}px`
  tip.style.left = `${left}px`
}

function hide(): void {
  bubble?.classList.remove('visible')
}

interface TipHandlers { enter: () => void; leave: () => void }
const handlers = new WeakMap<HTMLElement, TipHandlers>()
const texts = new WeakMap<HTMLElement, string>()

export const vTooltip: Directive<HTMLElement, string | undefined> = {
  mounted(el, binding) {
    texts.set(el, binding.value ?? '')
    const enter = (): void => { show(el, texts.get(el) ?? '') }
    const leave = (): void => { hide() }
    handlers.set(el, { enter, leave })
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    el.addEventListener('click', leave)
  },
  updated(el, binding) {
    const text = binding.value ?? ''
    texts.set(el, text)
    if (bubble?.classList.contains('visible')) { show(el, text) }
  },
  unmounted(el) {
    const h = handlers.get(el)
    if (h) {
      el.removeEventListener('mouseenter', h.enter)
      el.removeEventListener('mouseleave', h.leave)
      el.removeEventListener('click', h.leave)
      handlers.delete(el)
    }
    texts.delete(el)
    hide()
  },
}
