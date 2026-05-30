export type FaceLetter = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

/** Порядок граней для kociemba */
export const FACE_ORDER: FaceLetter[] = ['U', 'R', 'F', 'D', 'L', 'B']

/** Hex-цвет каждой грани */
export const FACE_BG: Record<FaceLetter, string> = {
  U: '#f0f0f0', // Белый
  R: '#e63946', // Красный
  F: '#2dc653', // Зелёный
  D: '#ffd60a', // Жёлтый
  L: '#f77f00', // Оранжевый
  B: '#4895ef', // Синий
}

/** Цвет текста поверх плашки */
export const FACE_TEXT: Record<FaceLetter, string> = {
  U: '#111', R: '#fff', F: '#fff', D: '#111', L: '#fff', B: '#fff',
}

/** Русское название */
export const FACE_LABEL: Record<FaceLetter, string> = {
  U: 'Верх', R: 'Право', F: 'Перед', D: 'Низ', L: 'Лево', B: 'Зад',
}

/** Английское/цвет подпись */
export const FACE_SUBLABEL: Record<FaceLetter, string> = {
  U: 'White', R: 'Red', F: 'Green', D: 'Yellow', L: 'Orange', B: 'Blue',
}

export const CENTER_IDX = 4
