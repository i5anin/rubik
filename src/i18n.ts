import { ref } from 'vue'

export type Lang = 'ru' | 'en'

// ── Определение языка ──────────────────────────────────────────────
function detectLang(): Lang {
  const stored = localStorage.getItem('rubik_lang') as Lang | null
  if (stored === 'ru' || stored === 'en') {return stored}
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

export const lang = ref<Lang>(detectLang())

export function setLang(l: Lang) {
  lang.value = l
  localStorage.setItem('rubik_lang', l)
}

export function toggleLang() {
  setLang(lang.value === 'ru' ? 'en' : 'ru')
}

// ── Словарь ───────────────────────────────────────────────────────
interface DictEntry { ru: string; en: string }
type Dict = Record<string, DictEntry | undefined>

const dict: Dict = {
  // Приложение
  'app.title':    { ru: 'Кубик Рубика',        en: "Rubik's Cube" },
  'app.hint':     { ru: 'Держи куб: <b>белый верх</b>, <b>зелёный к тебе</b>. Кликай клетки, чтобы покрасить. Наводи — увидишь цвет.',
                    en: 'Hold: <b>white top</b>, <b>green front</b>. Click cells to paint. Hover to see color.' },

  // Грани
  'face.U': { ru: 'Верх',  en: 'Up' },
  'face.R': { ru: 'Право', en: 'Right' },
  'face.F': { ru: 'Перед', en: 'Front' },
  'face.D': { ru: 'Низ',   en: 'Down' },
  'face.L': { ru: 'Лево',  en: 'Left' },
  'face.B': { ru: 'Зад',   en: 'Back' },

  // Цвета
  'color.U': { ru: 'Белый',     en: 'White' },
  'color.R': { ru: 'Красный',   en: 'Red' },
  'color.F': { ru: 'Зелёный',   en: 'Green' },
  'color.D': { ru: 'Жёлтый',    en: 'Yellow' },
  'color.L': { ru: 'Оранжевый', en: 'Orange' },
  'color.B': { ru: 'Синий',     en: 'Blue' },

  // Подписи граней (english below face name)
  'sub.U': { ru: 'White',  en: 'White' },
  'sub.R': { ru: 'Red',    en: 'Red' },
  'sub.F': { ru: 'Green',  en: 'Green' },
  'sub.D': { ru: 'Yellow', en: 'Yellow' },
  'sub.L': { ru: 'Orange', en: 'Orange' },
  'sub.B': { ru: 'Blue',   en: 'Blue' },

  // Кнопки
  'btn.reset':    { ru: '↺ Сброс',      en: '↺ Reset' },
  'btn.scramble': { ru: '🎲 Скрамбл',   en: '🎲 Scramble' },
  'btn.save':     { ru: '💾 Сохранить', en: '💾 Save' },
  'btn.saved':    { ru: 'Сохранено!',   en: 'Saved!' },
  'btn.solve':    { ru: 'Решить ↗',     en: 'Solve ↗' },
  'btn.solving':  { ru: 'Считаю…',      en: 'Solving…' },

  // Палитра
  'palette.label': { ru: 'Цвет кисти:', en: 'Paint color:' },

  // Валидация
  'valid.ok':            { ru: '✓ Состояние корректно', en: '✓ State is valid' },
  'valid.tooltip.title': { ru: 'Что проверяется:',      en: 'Validation checks:' },
  'valid.centers':       { ru: 'Центры граней:',         en: 'Face centers:' },
  'valid.centers.ok':    { ru: '✓ зафиксированы',        en: '✓ locked' },
  'valid.parity':        { ru: 'Чётность перестановок:', en: 'Permutation parity:' },
  'valid.parity.note':   { ru: 'проверяет солвер',       en: 'checked by solver' },

  // Решение
  'solution.title':   { ru: 'Решение',                 en: 'Solution' },
  'solution.done':    { ru: '🎉 Готово! Куб собран!',  en: '🎉 Done! Cube solved!' },
  'solution.already': { ru: 'Куб уже собран! 🎉',      en: 'Cube is already solved! 🎉' },
  'solution.move.1':  { ru: 'ход',                     en: 'move' },
  'solution.move.2':  { ru: 'хода',                    en: 'moves' },
  'solution.move.5':  { ru: 'ходов',                   en: 'moves' },
  'step.done':        { ru: 'Готово ✓',                en: 'Done ✓' },

  // Ходы — откуда смотреть
  'move.look.U': { ru: 'смотришь сверху',  en: 'look from above' },
  'move.look.D': { ru: 'смотришь снизу',   en: 'look from below' },
  'move.look.R': { ru: 'смотришь справа',  en: 'look from right' },
  'move.look.L': { ru: 'смотришь слева',   en: 'look from left' },
  'move.look.F': { ru: 'смотришь спереди', en: 'look from front' },
  'move.look.B': { ru: 'смотришь сзади',   en: 'look from behind' },
  'move.cw':     { ru: 'крути по часовой ↻',          en: 'clockwise ↻' },
  'move.ccw':    { ru: 'крути против часовой ↺',       en: 'counter-clockwise ↺' },
  'move.two':    { ru: 'два щелчка ↻↻',                en: 'two clicks ↻↻' },

  // Сохранённые
  'saved.title':      { ru: 'Сохранённые',                    en: 'Saved' },
  'saved.export':     { ru: '⬇ Экспорт',                      en: '⬇ Export' },
  'saved.import':     { ru: '⬆ Импорт',                       en: '⬆ Import' },
  'saved.empty':      { ru: 'Нет сохранённых конфигураций.',   en: 'No saved configurations.' },
  'saved.empty.hint': { ru: 'Нажми 💾 Сохранить после ввода.', en: 'Click 💾 Save after entering the cube.' },
  'saved.load':       { ru: 'Загрузить на куб',               en: 'Load to cube' },
  'saved.rename':     { ru: 'Переименовать',                  en: 'Rename' },
  'saved.delete':     { ru: 'Удалить',                        en: 'Delete' },
  'saved.undo':       { ru: 'Отменить шаг',                   en: 'Undo step' },

  // Алгоритм
  'algo.title':      { ru: 'Алгоритм вычисления', en: 'Solving Algorithm' },
  'algo.author':     { ru: 'Автор',               en: 'Author' },
  'algo.guarantee':  { ru: 'Гарантия',            en: 'Guarantee' },
  'algo.guarantee.v':{ ru: '≤ 20 ходов',          en: '≤ 20 moves' },
  'algo.time':       { ru: 'Время',               en: 'Time' },
  'algo.lib':        { ru: 'Библиотека',           en: 'Library' },
  'algo.desc':       {
    ru: 'Двухфазный алгоритм: сначала переводит куб в подгруппу G₁ (ориентации рёбер и углов), затем решает внутри G₁ до идеального состояния.',
    en: 'Two-phase algorithm: first moves the cube into subgroup G₁ (edge and corner orientations), then solves within G₁ to the identity.',
  },
  'algo.notation':     { ru: 'Нотация ходов',       en: 'Move notation' },
  'algo.notation.cw':  { ru: '— 90° по часовой',    en: '— 90° clockwise' },
  'algo.notation.ccw': { ru: '— 90° против часовой', en: '— 90° counter-clockwise' },
  'algo.notation.180': { ru: '— 180° (два щелчка)', en: '— 180° (two clicks)' },

  // Хедер
  'header.github': { ru: 'GitHub репозиторий', en: 'GitHub repository' },
  'header.donate': { ru: 'Поддержать',         en: 'Donate' },
  'header.copied': { ru: 'Скопировано!',        en: 'Copied!' },
}

// ── t() — получить перевод ────────────────────────────────────────
export function t(key: string): string {
  return dict[key]?.[lang.value] ?? key
}

// ── describeMove — описание хода на текущем языке ─────────────────
export function describeMove(m: string): string {
  const face = m.charAt(0)
  const mod  = m.slice(1)
  const faceName = t(`face.${face}`)
  const look     = t(`move.look.${face}`)
  const action   = mod === '2' ? t('move.two') : mod === "'" ? t('move.ccw') : t('move.cw')
  return `${faceName}: ${look} → ${action}`
}

// ── pluralMoves — склонение числительного ─────────────────────────
export function pluralMoves(n: number): string {
  if (lang.value === 'en') {return `${n} ${t('solution.move.5')}`}
  const mod10 = n % 10, mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) {return `${n} ${t('solution.move.1')}`}
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {return `${n} ${t('solution.move.2')}`}
  return `${n} ${t('solution.move.5')}`
}
