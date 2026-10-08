// v1.17.7 - Lint exists for one reason: the Rules of Hooks. v1.17.6 shipped a useEffect
// placed after `if(!onboarded) return`, so finishing onboarding crashed every new user
// (React error #310) for three weeks. `npm test` runs this, and CI runs `npm test`
// before building, so a hook-order violation now blocks the deploy.
// Style rules are deliberately off; add them separately if ever wanted.
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    linterOptions: {
      // Existing `eslint-disable-line` comments refer to rules we don't enable.
      reportUnusedDisableDirectives: 'off',
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
    },
  },
];
