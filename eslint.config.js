/**
 * eslint.config.js — gate 0-2, static analysis.
 *
 * What fails the gate is what failed it under oxlint, nothing more:
 *   - a file that does not parse
 *   - a React hook called where React cannot keep its order (rules-of-hooks):
 *     inside an `if`, a loop, after an early return. It builds and then breaks
 *     state at runtime, and no other gate reads for it.
 * Everything else is a warning and does not stop QA.
 *
 * ── Why ESLint and not oxlint (2026-10-01, SudokuDiary 85) ────────────────
 * oxlint runs a native Windows binary that is not signed. Smart App Control
 * judges unsigned binaries by asking Microsoft's cloud each time its cached
 * verdict runs out, and for this one the answer changed from day to day: it
 * loaded for weeks, was blocked on 09-12, loaded again, and was blocked from
 * 10-01 02:29 on. ESLint is JavaScript that node.exe (signed) runs, so there is
 * nothing for Smart App Control to judge. The hooks rule here is also the
 * original — oxlint's is a port of this one.
 *
 * The files checked are the repository's own; generated and ignored folders are
 * left out, as oxlint left out what .gitignore lists.
 */
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: [
      'dist/**', 'dist-ssr/**', 'android/**', 'ios/**',
      'release_archive/**', 'test_output/**', 'gemini/**', 'coverage/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'commonjs' },
  },
];
