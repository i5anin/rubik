import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import type { Linter } from 'eslint'

const config: Linter.Config[] = [
  // ── Игнорируем сгенерированное ────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // ── JS base ───────────────────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript strict ─────────────────────────────────────────
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // ── Vue 3 ─────────────────────────────────────────────────────
  ...(pluginVue.configs['flat/recommended'] as Linter.Config[]),

  // ── Общий контекст ────────────────────────────────────────────
  {
    languageOptions: {
      globals: {
        ...globals.browser,  // window, document, setTimeout, etc.
        ...globals.es2021,
      },
      parserOptions: {
        parser: tseslint.parser,
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
      },
    },
  },

  // ── Правила проекта ───────────────────────────────────────────
  {
    files: ['src/**/*.{ts,vue}'],
    rules: {
      // --- TypeScript ---
      'no-undef': 'off',                       // TypeScript покрывает это сам
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', {
        allowNumber: true,
        allowBoolean: false,
      }],
      '@typescript-eslint/require-await': 'off',  // async-функции без await — нормально для единообразия

      // --- Vue ---
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/no-unused-vars': 'error',
      'vue/no-v-html': 'warn',
      'vue/define-macros-order': ['error', {
        order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'],
      }],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/no-undef-components': 'error',
      // Форматирование шаблонов — отдаём prettier/редактору
      'vue/max-attributes-per-line': 'off',
      'vue/html-indent': 'off',
      'vue/html-self-closing': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/singleline-html-element-content-newline': 'off',

      // --- Общий стиль ---
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
    },
  },
]

export default config
