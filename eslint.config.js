import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';
export default [js.configs.recommended, ...ts.configs.recommended, { files: ['public/**/*.js'], languageOptions: { globals: globals.browser } }, { files: ['scripts/**/*.mjs','*.js','*.cjs'], languageOptions: { globals: globals.node } }, { files: ['scripts/e2e.mjs','scripts/e2e-founder.mjs','scripts/e2e-code-console.mjs','scripts/e2e-clerk-live.mjs','scripts/e2e-landing.mjs'], languageOptions: { globals: { ...globals.node, ...globals.browser } } }, { rules: { '@typescript-eslint/no-explicit-any': 'error' } }];
