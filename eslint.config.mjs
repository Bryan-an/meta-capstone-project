import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import unicornPlugin from 'eslint-plugin-unicorn';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      unicorn: unicornPlugin,
    },
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: [
            /^next\.config\.(js|mjs|ts)$/,
            /^\[.*\]\.tsx?$/,
            /^layout\.tsx?$/,
            /^page\.tsx?$/,
            /^loading\.tsx?$/,
            /^not-found\.tsx?$/,
            /^error\.tsx?$/,
            /^template\.tsx?$/,
            /^default\.tsx?$/,
            /^route\.tsx?$/,
            /^_app\.tsx?$/,
            /^_document\.tsx?$/,
            /^_error\.tsx?$/,
            /^api\//,
          ],
        },
      ],
    },
    files: ['src/**/*.{js,jsx,ts,tsx}'],
  },
];

export default eslintConfig;
