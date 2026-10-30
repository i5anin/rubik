# Путеводитель: rubik

Автономная инструкция: достаточно этой папки, исходников и перечисленных защищённых копий. История чатов и центральный каталог не требуются.

[Восстановление](RECOVERY.md) · [Карта файлов и зависимостей](PROJECT_MAP.json)

## Назначение

По [README.md](README.md): The solver is built on **`cubejs`**, a JavaScript port of Herbert Kociemba's **two-phase algorithm**:

Обнаруженные языки: TypeScript, Vue SFC.

## Порядок чтения

1. Локальные AGENTS.md / CLAUDE.md и документы ниже.
2. Манифесты: версии среды, зависимости, команды.
3. Кандидаты точек входа; фактический запуск проверить по манифесту.
4. PROJECT_MAP.json: imports_local от источника к импортируемому файлу; входящие рёбра — потребители модуля.
5. RECOVERY.md: независимые данные, восстановление среды, запуск и критерии приёмки.

- [README.md](README.md)
- [README.ru.md](README.ru.md)

## Манифесты

- [package.json](package.json)

## Кандидаты точек входа

- [src/main.ts](src/main.ts)

## Основные файлы по локальным импортам

| Файл | Входящих импортов |
|---|---:|
| [src/types/cube.ts](src/types/cube.ts) | 18 |
| [src/i18n.ts](src/i18n.ts) | 9 |
| [src/components/Icon.vue](src/components/Icon.vue) | 6 |
| [src/lib/cubejs.ts](src/lib/cubejs.ts) | 2 |
| [src/config.ts](src/config.ts) | 2 |
| [src/components/Cube3D.vue](src/components/Cube3D.vue) | 2 |
| [src/composables/useSolver.ts](src/composables/useSolver.ts) | 2 |
| [src/composables/useSavedConfigs.ts](src/composables/useSavedConfigs.ts) | 2 |
| [src/components/FaceGrid.vue](src/components/FaceGrid.vue) | 1 |
| [src/components/SolutionPanel.vue](src/components/SolutionPanel.vue) | 1 |
| [src/components/SavedConfigs.vue](src/components/SavedConfigs.vue) | 1 |
| [src/components/HeaderLinks.vue](src/components/HeaderLinks.vue) | 1 |

## Проверки


## Чтение карты без специальных плагинов

PROJECT_MAP.json — UTF-8 JSON: nodes и edges. Пути файлов относительные. contains обозначает наличие файла; imports_local — статически распознанный импорт; declares_dependency — объявление пакета в манифесте. evidence содержит источник и, где доступно, строку. Карта не исполняет код.

Статус исходного анализа: static-scan-complete; ограничений чтения: 0. Исходный снимок: 2026-10-30T14:47:11.360Z.

После изменения кода перечитайте затронутые файлы: карта является снимком. Отсутствие ребра не доказывает отсутствие зависимости.
