import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		files: ['src/main/webapp/plugins/linter/**/*.js'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'script'
		},
		rules: {
			// draw.io provides the plugin API as browser globals at runtime.
			'no-undef': 'off',
			'no-unused-vars': ['error', { caughtErrors: 'none' }]
		}
	}
]);
