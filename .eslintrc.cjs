module.exports = {
  root: true,

  env: {
    node: true,
    es2022: true,
  },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },

  plugins: ['@typescript-eslint', 'playwright'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:playwright/recommended',
  ],

  ignorePatterns: [
    'node_modules/',
    'dist/',
    'playwright-report/',
    'test-results/',
  ],

  rules: {
    // Allow console.log in tests (useful for debugging)
    'no-console': 'off',

    // Stricter unused vars rule, but ignore variables/args starting with _
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },

  overrides: [
    {
      files: ['tests/**/*.ts'],
      rules: {
        // In tests we allow a bit more freedom
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};

