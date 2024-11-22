import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: '.',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-invalid-this': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/prefer-destructuring': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/explicit-member-accessibility': 'error',
      'prettier/prettier': 'error',
    },
  },
];
