/**
 * Beginner "Layer-by-Layer" (LBL) course.
 *
 * Each lesson carries bilingual copy, optional named algorithms (standard
 * beginner sequences) and an optional 3×3 diagram that shows the target
 * pattern on the relevant face. Algorithms use standard notation
 * (U R F D L B, with ' = counter-clockwise and 2 = 180°).
 *
 * The sequences here are the widely-taught beginner set — kept deliberately
 * minimal (a handful of triggers you repeat) rather than fast/advanced.
 */

export interface Bilingual {
  ru: string
  en: string
}

export interface LessonAlgo {
  /** When to use this algorithm (case label). Optional for single-algo lessons. */
  when?: Bilingual
  /** Space-separated move sequence, e.g. "U R U' R' U' F' U F". */
  moves: string
}

/**
 * 3×3 diagram. Each of the 9 cells is either a FaceLetter colour, 'x' for
 * "any / not relevant" (shown grey), or a target colour to highlight.
 */
export type DiagramCell = 'U' | 'R' | 'F' | 'D' | 'L' | 'B' | 'x'

export interface Lesson {
  id: string
  title: Bilingual
  goal: Bilingual
  /** Paragraphs of explanation. Rendered as separate <p>. */
  body: Bilingual[]
  /** Optional diagram: the face you look at + its 9 cells. */
  diagram?: { face: Bilingual; cells: DiagramCell[] }
  algorithms?: LessonAlgo[]
  tip?: Bilingual
}

export const LESSONS: Lesson[] = [
  // ── 0. Notation & anatomy ────────────────────────────────────────────
  {
    id: 'basics',
    title: { ru: 'Устройство и нотация', en: 'Anatomy & notation' },
    goal: {
      ru: 'Понять, из чего состоит куб и как записываются ходы.',
      en: 'Understand the cube’s parts and how moves are written.',
    },
    body: [
      {
        ru: 'У кубика 6 граней. Центр каждой грани не двигается относительно других — именно <b>центры задают цвет грани</b>. Их нельзя переставить, поэтому белый центр — это всегда «белая» грань.',
        en: 'A cube has 6 faces. Each face’s centre never moves relative to the others — the <b>centres define the face colour</b>. They can’t be swapped, so the white centre is always the “white” face.',
      },
      {
        ru: 'Угловые детали (с 3 наклейками) и рёберные (с 2 наклейками) — это то, что мы переставляем. Цель сборки — поставить каждый угол и ребро на своё место и правильно повернуть.',
        en: 'Corner pieces (3 stickers) and edge pieces (2 stickers) are what we move around. Solving means putting every corner and edge in its place and orienting it correctly.',
      },
      {
        ru: 'Ходы обозначают буквами граней: <b>U</b> — верх, <b>D</b> — низ, <b>R</b> — право, <b>L</b> — лево, <b>F</b> — перёд, <b>B</b> — зад. Просто буква = поворот этой грани на 90° по часовой (если смотреть на неё в лоб). Штрих <b>(\')</b> = против часовой. Двойка <b>(2)</b> = на 180°.',
        en: 'Moves are named by face letters: <b>U</b> up, <b>D</b> down, <b>R</b> right, <b>L</b> left, <b>F</b> front, <b>B</b> back. A bare letter = turn that face 90° clockwise (looking straight at it). A prime <b>(\')</b> = counter-clockwise. A <b>2</b> = 180°.',
      },
    ],
    tip: {
      ru: 'Возьми собранный куб и медленно сделай R, потом R\'. Ты вернёшься в начало — почувствуй, что штрих просто отменяет ход.',
      en: 'Take a solved cube and slowly do R, then R\'. You’re back to start — feel how the prime just undoes the move.',
    },
  },

  // ── 1. White cross ───────────────────────────────────────────────────
  {
    id: 'white-cross',
    title: { ru: 'Шаг 1. Белый крест', en: 'Step 1. The white cross' },
    goal: {
      ru: 'Собрать на белой грани крест так, чтобы боковые цвета рёбер совпадали с центрами.',
      en: 'Build a cross on the white face with the edge side-colours matching the centres.',
    },
    body: [
      {
        ru: 'Держи белый центр сверху. Нужно поставить 4 белых ребра вокруг него. Важно не только, чтобы сверху был белый, но и чтобы второй цвет ребра совпал с центром своей грани — тогда крест «правильный».',
        en: 'Keep the white centre on top. Place the 4 white edges around it. It’s not enough for white to be on top — the edge’s other colour must match its face’s centre, making the cross “correct”.',
      },
      {
        ru: 'Это единственный шаг, который решается интуитивно, без зубрёжки. Найди белое ребро, подведи его под нужное место и подними наверх. Если ребро уже наверху, но не на месте — сначала убери его вниз.',
        en: 'This is the one step you solve by intuition, no memorising. Find a white edge, bring it under its target slot, and lift it up. If an edge is already on top but wrong, drop it down first.',
      },
    ],
    diagram: {
      face: { ru: 'Вид сверху (белая грань)', en: 'Top view (white face)' },
      cells: ['x', 'U', 'x', 'U', 'U', 'U', 'x', 'U', 'x'],
    },
    tip: {
      ru: 'Сравнивай ребро с двумя соседними центрами. «Лепесток» креста ставится между двумя своими центрами.',
      en: 'Match each edge to its two neighbouring centres. A cross “petal” sits between its own two centres.',
    },
  },

  // ── 2. First layer corners ───────────────────────────────────────────
  {
    id: 'first-layer',
    title: { ru: 'Шаг 2. Углы первого слоя', en: 'Step 2. First-layer corners' },
    goal: {
      ru: 'Завершить белый слой целиком: вставить 4 белых угла.',
      en: 'Finish the whole white layer by inserting the 4 white corners.',
    },
    body: [
      {
        ru: 'Найди внизу белый угол. Покрути нижний слой так, чтобы он оказался прямо под местом, куда должен встать (между двумя своими цветами). Затем повторяй короткий приём, пока угол не «вкрутится» наверх белым вверх.',
        en: 'Find a white corner on the bottom. Turn the bottom layer so it sits directly under its target slot (between its two matching colours). Then repeat the short trigger until the corner screws into place, white on top.',
      },
      {
        ru: 'Приём R U R\' U\' — это «правый триггер». Делай его, держа целевое место спереди-справа. Иногда нужно повторить 1–3 раза.',
        en: 'The trigger R U R\' U\' is the “righty”. Do it with the target slot at front-right. Sometimes you repeat it 1–3 times.',
      },
    ],
    algorithms: [
      { when: { ru: 'Вставить угол (повторяй)', en: 'Insert a corner (repeat)' }, moves: "R U R' U'" },
    ],
    tip: {
      ru: 'Если белый угол застрял наверху не на месте — примени R U R\' U\' один раз, он выйдет вниз, и ты подведёшь его правильно.',
      en: 'If a white corner is stuck on top in the wrong spot, do R U R\' U\' once to pop it down, then reposition.',
    },
  },

  // ── 3. Second layer edges ────────────────────────────────────────────
  {
    id: 'second-layer',
    title: { ru: 'Шаг 3. Второй слой', en: 'Step 3. The second layer' },
    goal: {
      ru: 'Поставить 4 ребра среднего слоя (без жёлтого цвета).',
      en: 'Place the 4 middle-layer edges (none with yellow).',
    },
    body: [
      {
        ru: 'Переверни куб белым вниз — теперь жёлтый сверху. Ищи на верхнем слое ребро <b>без жёлтого</b>. Поверни верх так, чтобы передний цвет ребра совпал с центром передней грани (получится «перевёрнутая Т»).',
        en: 'Flip the cube white-down — yellow is on top now. Find a top-layer edge with <b>no yellow</b>. Turn the top so the edge’s front colour matches the front centre (you get an upside-down “T”).',
      },
      {
        ru: 'Теперь определи, куда ребру ехать — влево или вправо — и примени соответствующий алгоритм.',
        en: 'Now decide whether the edge goes left or right, and apply the matching algorithm.',
      },
    ],
    algorithms: [
      { when: { ru: 'Ребро едет вправо', en: 'Edge goes right' }, moves: "U R U' R' U' F' U F" },
      { when: { ru: 'Ребро едет влево', en: 'Edge goes left' }, moves: "U' L' U L U F U' F'" },
    ],
    tip: {
      ru: 'Если нужное ребро уже в среднем слое, но повёрнуто/не на месте — выгони его любым из алгоритмов, поставив на его место любое верхнее ребро, затем вставь правильно.',
      en: 'If a needed edge is already in the middle but wrong, kick it out with either algorithm (insert any top edge into its slot), then place it correctly.',
    },
  },

  // ── 4. Yellow cross ──────────────────────────────────────────────────
  {
    id: 'yellow-cross',
    title: { ru: 'Шаг 4. Жёлтый крест', en: 'Step 4. The yellow cross' },
    goal: {
      ru: 'Сделать жёлтый крест сверху (пока не важно, совпадают ли боковые цвета).',
      en: 'Form a yellow cross on top (side-colours don’t matter yet).',
    },
    body: [
      {
        ru: 'Смотри на верхнюю (жёлтую) грань. Возможны 4 картинки: точка, «уголок» (буква L), «палочка» (линия) или готовый крест. Применяй один и тот же алгоритм, пока не дойдёшь до креста.',
        en: 'Look at the top (yellow) face. You’ll see one of 4 shapes: a dot, an L-shape, a line, or the finished cross. Apply the same algorithm until you reach the cross.',
      },
      {
        ru: 'Палочку держи горизонтально. Уголок держи так, чтобы две жёлтые грани смотрели влево и вверх (на «9 и 12 часов»).',
        en: 'Hold the line horizontally. Hold the L so its two yellow arms point left and up (to “9 and 12 o’clock”).',
      },
    ],
    diagram: {
      face: { ru: 'Вид сверху (жёлтая грань)', en: 'Top view (yellow face)' },
      cells: ['x', 'D', 'x', 'D', 'D', 'D', 'x', 'D', 'x'],
    },
    algorithms: [
      { when: { ru: 'Повторяй до креста', en: 'Repeat until cross' }, moves: "F R U R' U' F'" },
    ],
    tip: {
      ru: 'Точка → после алгоритма станет уголком, уголок → палочкой, палочка → крестом. Максимум три прохода.',
      en: 'Dot → becomes an L, L → becomes a line, line → becomes the cross. Three passes at most.',
    },
  },

  // ── 5. Orient last-layer corners ─────────────────────────────────────
  {
    id: 'yellow-face',
    title: { ru: 'Шаг 5. Вся жёлтая грань', en: 'Step 5. The full yellow face' },
    goal: {
      ru: 'Развернуть жёлтые углы так, чтобы вся верхняя грань стала жёлтой.',
      en: 'Twist the yellow corners so the entire top face is yellow.',
    },
    body: [
      {
        ru: 'Алгоритм «Sune» разворачивает углы. Держи куб так, чтобы неразвёрнутый жёлтый угол был спереди-справа, и применяй приём. Грань будет выглядеть «неправильно» между повторами — это нормально, не паникуй и продолжай.',
        en: 'The “Sune” algorithm twists corners. Hold an unsolved yellow corner at front-right and apply it. The face will look “scrambled” between repeats — that’s normal, keep going.',
      },
      {
        ru: 'Важное правило: не поворачивай куб целиком между повторами, только верх (U), подводя следующий неготовый угол на позицию спереди-справа.',
        en: 'Key rule: don’t rotate the whole cube between repeats — only U, bringing the next unsolved corner to front-right.',
      },
    ],
    diagram: {
      face: { ru: 'Цель: вся грань жёлтая', en: 'Goal: full yellow face' },
      cells: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
    },
    algorithms: [
      { when: { ru: 'Sune (повторяй)', en: 'Sune (repeat)' }, moves: "R U R' U R U2 R'" },
    ],
    tip: {
      ru: 'Считай готовые углы перед началом: их бывает 0, 1 или 2. Ставь готовый угол (если есть) спереди-слева.',
      en: 'Count solved corners first: 0, 1 or 2. Keep a solved corner (if any) at front-left.',
    },
  },

  // ── 6. Permute corners ───────────────────────────────────────────────
  {
    id: 'place-corners',
    title: { ru: 'Шаг 6. Расставить углы', en: 'Step 6. Position the corners' },
    goal: {
      ru: 'Поставить жёлтые углы по своим местам (цвета пока могут «гулять» — это следующий шаг уже сделан, тут только места).',
      en: 'Move the yellow corners to their correct corners (just the positions).',
    },
    body: [
      {
        ru: 'Найди угол, который уже стоит на правильном месте (его три цвета подходят к соседним граням), и держи его спереди-справа. Применяй алгоритм — остальные три угла будут циклически меняться местами, пока все не встанут.',
        en: 'Find a corner already in its right place (its three colours fit the neighbouring faces) and hold it at front-right. Apply the algorithm — the other three corners cycle until all are correct.',
      },
      {
        ru: 'Если ни одного готового угла нет — просто примени алгоритм один раз из любого положения, появится готовый.',
        en: 'If no corner is correct yet, just apply the algorithm once from any angle and one will appear.',
      },
    ],
    algorithms: [
      { when: { ru: 'Цикл углов', en: 'Cycle corners' }, moves: "U R U' L' U R' U' L" },
    ],
    tip: {
      ru: '«Правильное место» — это не про цвет сверху, а про то, что три наклейки угла принадлежат трём сходящимся граням.',
      en: '“Correct place” isn’t about the top colour — it’s that the corner’s three stickers belong to the three meeting faces.',
    },
  },

  // ── 7. Permute edges ─────────────────────────────────────────────────
  {
    id: 'place-edges',
    title: { ru: 'Шаг 7. Расставить рёбра — готово!', en: 'Step 7. Position the edges — done!' },
    goal: {
      ru: 'Поставить последние 4 ребра по местам и собрать куб полностью.',
      en: 'Place the last 4 edges and complete the cube.',
    },
    body: [
      {
        ru: 'Остался последний слой рёбер. Если одно ребро уже стоит верно — держи его сзади и применяй алгоритм, пока куб не соберётся. Если верных нет — примени алгоритм один раз, появится готовое ребро.',
        en: 'Only the last-layer edges remain. If one edge is already correct, keep it at the back and apply the algorithm until solved. If none are correct, apply it once and a correct edge appears.',
      },
      {
        ru: 'После этого шага куб собран. Поздравляю — теперь ты знаешь полный метод новичка!',
        en: 'After this step the cube is solved. Congratulations — you now know the full beginner method!',
      },
    ],
    algorithms: [
      { when: { ru: 'Цикл рёбер', en: 'Cycle edges' }, moves: "R U' R U R U R U' R' U' R2" },
    ],
    tip: {
      ru: 'Это последний алгоритм метода. Выучи 7 приёмов из этого курса — и ты соберёшь любой кубик сам.',
      en: 'This is the method’s last algorithm. Learn the 7 triggers from this course and you can solve any cube yourself.',
    },
  },
]
