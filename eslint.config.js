import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'public/**/*',
      'schema/**/*',
      'src/adapters/generated/**/*',
      'coverage/**/*',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@mui/material',
              message:
                "Import directly from '@mui/material/ComponentName' instead of using barrel imports for better performance.",
            },
            {
              name: '@mui/icons-material',
              message:
                "Import directly from '@mui/icons-material/IconName' instead of using barrel imports for better performance.",
            },
          ],
        },
      ],
      // Import ordering rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js builtin modules
            'external', // External packages
            'internal', // Internal modules (absolute imports)
            'parent', // Parent directories
            'sibling', // Same directory
            'index', // Index files
            'type', // Type-only imports
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  }
);
