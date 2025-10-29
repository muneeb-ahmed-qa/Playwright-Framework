module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  globals: {
    'localStorage': 'readonly',
    'sessionStorage': 'readonly',
    'document': 'readonly',
    'window': 'readonly',
    'expect': 'readonly',
    'test': 'readonly',
    'describe': 'readonly',
    'beforeEach': 'readonly',
    'afterEach': 'readonly',
    'beforeAll': 'readonly',
    'afterAll': 'readonly'
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'no-undef': 'error'
  },
  ignorePatterns: [
    'node_modules/',
    'test-results/',
    'playwright-report/',
    '*.config.js'
  ]
};
