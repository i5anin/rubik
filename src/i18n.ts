/**
 * Type-safe i18n module.
 *
 * All translation keys are expressed as a TypeScript union built from
 * template-literal types.  Benefits:
 *   • t('typo.key')     → compile error, not a silent runtime miss
 *   • dict is typed as  Record<TranslationKey, DictEntry>
 *     → add a key to the union and forget the dict entry → compile error
 *   • t() return type is string — no undefined, no fallback needed
 */

import { ref } from 'vue'
import type { FaceLetter } from './types/cube'

// ── Language ──────────────────────────────────────────────────────────────

export type Lang = 'ru' | 'en'

const STORAGE_KEY = 'rubik_lang' as const

function detectLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'ru' || stored === 'en') { return stored }
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

export const lang = ref<Lang>(detectLang())

export function setLang(l: Lang): void {
  lang.value = l
  localStorage.setItem(STORAGE_KEY, l)
}

export function toggleLang(): void {
  setLang(lang.value === 'ru' ? 'en' : 'ru')
}

// ── Key union ─────────────────────────────────────────────────────────────

type FaceKey       = `face.${FaceLetter}`
type ColorKey      = `color.${FaceLetter}`
type SubKey        = `sub.${FaceLetter}`
type MoveLookKey   = `move.look.${FaceLetter}`
type MoveActionKey = 'move.cw' | 'move.ccw' | 'move.two'
type BtnKey        = `btn.${'reset' | 'scramble' | 'save' | 'saved' | 'solve' | 'solving'}`
type ValidKey      = `valid.${'ok' | 'tooltip.title' | 'centers' | 'centers.ok' | 'parity' | 'parity.note'}`
type SolutionKey   = `solution.${'title' | 'done' | 'already'}` | `solution.move.${'1' | '2' | '5'}`
type SavedKey      = `saved.${'title' | 'export' | 'import' | 'empty' | 'empty.hint' | 'load' | 'rename' | 'delete' | 'undo'}`
type AlgoKey       = `algo.${'title' | 'author' | 'guarantee' | 'guarantee.v' | 'time' | 'lib' | 'desc' | 'notation'}` | `algo.notation.${'cw' | 'ccw' | '180'}`
type HeaderKey     = `header.${'github' | 'donate' | 'copied'}`

type MetaKey = `meta.${'title' | 'description'}`

export type TranslationKey =
  | 'app.title' | 'app.hint' | 'palette.label' | 'step.done'
  | FaceKey | ColorKey | SubKey
  | MoveLookKey | MoveActionKey
  | BtnKey | ValidKey | SolutionKey | SavedKey | AlgoKey | HeaderKey | MetaKey

// ── Dictionary ────────────────────────────────────────────────────────────

interface DictEntry { readonly ru: string; readonly en: string }

// Every key in TranslationKey *must* be present — TypeScript enforces completeness.
const dict: Record<TranslationKey, DictEntry> = {
  'app.title':    { ru: 'Кубик Рубика',        en: "Rubik's Cube" },
  'app.hint':     {
    ru: 'Держи куб: <b>белый верх</b>, <b>зелёный к тебе</b>. Кликай клетки, чтобы покрасить. Наводи — увидишь цвет.',
    en: 'Hold: <b>white top</b>, <b>green front</b>. Click cells to paint. Hover to see colour.',
  },
  'palette.label': { ru: 'Цвет кисти:',  en: 'Paint colour:' },
  'step.done':     { ru: 'Готово ✓',     en: 'Done ✓' },

  // Faces
  'face.U': { ru: 'Верх',  en: 'Up' },
  'face.R': { ru: 'Право', en: 'Right' },
  'face.F': { ru: 'Перед', en: 'Front' },
  'face.D': { ru: 'Низ',   en: 'Down' },
  'face.L': { ru: 'Лево',  en: 'Left' },
  'face.B': { ru: 'Зад',   en: 'Back' },

  // Colours
  'color.U': { ru: 'Белый',     en: 'White' },
  'color.R': { ru: 'Красный',   en: 'Red' },
  'color.F': { ru: 'Зелёный',   en: 'Green' },
  'color.D': { ru: 'Жёлтый',    en: 'Yellow' },
  'color.L': { ru: 'Оранжевый', en: 'Orange' },
  'color.B': { ru: 'Синий',     en: 'Blue' },

  // Sub-labels (colour name below each face grid)
  'sub.U': { ru: 'White',  en: 'White' },
  'sub.R': { ru: 'Red',    en: 'Red' },
  'sub.F': { ru: 'Green',  en: 'Green' },
  'sub.D': { ru: 'Yellow', en: 'Yellow' },
  'sub.L': { ru: 'Orange', en: 'Orange' },
  'sub.B': { ru: 'Blue',   en: 'Blue' },

  // Buttons
  'btn.reset':    { ru: '↺ Сброс',      en: '↺ Reset' },
  'btn.scramble': { ru: '🎲 Скрамбл',   en: '🎲 Scramble' },
  'btn.save':     { ru: '💾 Сохранить', en: '💾 Save' },
  'btn.saved':    { ru: 'Сохранено!',   en: 'Saved!' },
  'btn.solve':    { ru: 'Решить ↗',     en: 'Solve ↗' },
  'btn.solving':  { ru: 'Считаю…',      en: 'Solving…' },

  // Validation
  'valid.ok':            { ru: '✓ Состояние корректно', en: '✓ State is valid' },
  'valid.tooltip.title': { ru: 'Что проверяется:',      en: 'Validation checks:' },
  'valid.centers':       { ru: 'Центры граней:',         en: 'Face centres:' },
  'valid.centers.ok':    { ru: '✓ зафиксированы',        en: '✓ locked' },
  'valid.parity':        { ru: 'Чётность перестановок:', en: 'Permutation parity:' },
  'valid.parity.note':   { ru: 'проверяет солвер',       en: 'checked by solver' },

  // Solution
  'solution.title':   { ru: 'Решение',                en: 'Solution' },
  'solution.done':    { ru: '🎉 Готово! Куб собран!', en: '🎉 Done! Cube solved!' },
  'solution.already': { ru: 'Куб уже собран! 🎉',     en: 'Cube is already solved! 🎉' },
  'solution.move.1':  { ru: 'ход',                    en: 'move' },
  'solution.move.2':  { ru: 'хода',                   en: 'moves' },
  'solution.move.5':  { ru: 'ходов',                  en: 'moves' },

  // Move direction — where to look
  'move.look.U': { ru: 'смотришь сверху',  en: 'look from above' },
  'move.look.R': { ru: 'смотришь справа',  en: 'look from right' },
  'move.look.F': { ru: 'смотришь спереди', en: 'look from front' },
  'move.look.D': { ru: 'смотришь снизу',   en: 'look from below' },
  'move.look.L': { ru: 'смотришь слева',   en: 'look from left' },
  'move.look.B': { ru: 'смотришь сзади',   en: 'look from behind' },
  'move.cw':     { ru: 'крути по часовой ↻',    en: 'clockwise ↻' },
  'move.ccw':    { ru: 'крути против часовой ↺', en: 'counter-clockwise ↺' },
  'move.two':    { ru: 'два щелчка ↻↻',          en: 'two clicks ↻↻' },

  // Saved configurations
  'saved.title':      { ru: 'Сохранённые',                    en: 'Saved' },
  'saved.export':     { ru: '⬇ Экспорт',                      en: '⬇ Export' },
  'saved.import':     { ru: '⬆ Импорт',                       en: '⬆ Import' },
  'saved.empty':      { ru: 'Нет сохранённых конфигураций.',   en: 'No saved configurations.' },
  'saved.empty.hint': { ru: 'Нажми 💾 Сохранить после ввода.', en: 'Click 💾 Save after entering the cube.' },
  'saved.load':       { ru: 'Загрузить на куб',               en: 'Load to cube' },
  'saved.rename':     { ru: 'Переименовать',                  en: 'Rename' },
  'saved.delete':     { ru: 'Удалить',                        en: 'Delete' },
  'saved.undo':       { ru: 'Отменить шаг',                   en: 'Undo step' },

  // Algorithm info
  'algo.title':       { ru: 'Алгоритм вычисления', en: 'Solving Algorithm' },
  'algo.author':      { ru: 'Автор',               en: 'Author' },
  'algo.guarantee':   { ru: 'Гарантия',            en: 'Guarantee' },
  'algo.guarantee.v': { ru: '≤ 20 ходов',          en: '≤ 20 moves' },
  'algo.time':        { ru: 'Время',               en: 'Time' },
  'algo.lib':         { ru: 'Библиотека',           en: 'Library' },
  'algo.desc': {
    ru: 'Двухфазный алгоритм: сначала переводит куб в подгруппу G₁ (ориентации рёбер и углов), затем решает внутри G₁ до идеального состояния.',
    en: 'Two-phase algorithm: first moves the cube into subgroup G₁ (edge and corner orientations), then solves within G₁ to the identity.',
  },
  'algo.notation':     { ru: 'Нотация ходов',        en: 'Move notation' },
  'algo.notation.cw':  { ru: '— 90° по часовой',     en: '— 90° clockwise' },
  'algo.notation.ccw': { ru: '— 90° против часовой', en: '— 90° counter-clockwise' },
  'algo.notation.180': { ru: '— 180° (два щелчка)',  en: '— 180° (two clicks)' },

  // Header links
  'header.github': { ru: 'GitHub репозиторий', en: 'GitHub repository' },
  'header.donate': { ru: 'Поддержать',         en: 'Donate' },
  'header.copied': { ru: 'Скопировано!',        en: 'Copied!' },

  // Document meta (SEO — updated live on language switch)
  'meta.title': {
    ru: 'Кубик Рубика — Решатель онлайн',
    en: "Rubik's Cube Solver — Online",
  },
  'meta.description': {
    ru: 'Введите развёртку кубика по цветам, проверьте корректность и соберите его за ≤20 ходов с пошаговой анимацией.',
    en: 'Paint your scrambled cube, validate it, and solve it in ≤20 moves — animated, step by step.',
  },
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Look up a translation.
 * The key must be a member of TranslationKey — misspellings are compile errors,
 * not silent runtime misses.  The returned string is always defined.
 */
export function t(key: TranslationKey): string {
  return dict[key][lang.value]
}

/**
 * Human-readable move description for the current language.
 * Example: "R2" → "Right: look from right → two clicks ↻↻"
 */
export function describeMove(move: string): string {
  const face   = move.charAt(0) as FaceLetter
  const mod    = move.slice(1)
  const action = mod === '2' ? t('move.two') : mod === "'" ? t('move.ccw') : t('move.cw')
  return `${t(`face.${face}`)}: ${t(`move.look.${face}`)} → ${action}`
}

/**
 * Pluralised move count for the current language.
 * Russian requires three plural forms (1, 2–4, 5+).
 */
export function pluralMoves(n: number): string {
  if (lang.value === 'en') { return `${n} ${t('solution.move.5')}` }
  const mod10  = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11)                                   { return `${n} ${t('solution.move.1')}` }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) { return `${n} ${t('solution.move.2')}` }
  return `${n} ${t('solution.move.5')}`
}
