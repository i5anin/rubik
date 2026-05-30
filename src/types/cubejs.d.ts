declare module 'cubejs' {
  interface CubeInstance {
    /** Решить куб — вернуть строку ходов вида "U R2 F' ..." */
    solve(): string
    move(alg: string): void
    /** 54-символьное состояние в kociemba-формате */
    asString(): string
  }

  interface CubeStatic {
    new(): CubeInstance
    /** Инициализировать таблицы пруниг (синхронно, ~0.5с) */
    initSolver(): void
    /** Создать куб из 54-символьной строки в порядке URFDLB */
    fromString(s: string): CubeInstance
    /** Случайный скрамбл */
    scramble(): string
  }

  const Cube: CubeStatic
  export = Cube
}
