import {resolve} from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		root: resolve(import.meta.dirname),
		include: ['src/**/*.spec.ts'],
		reporters: ['default'],
	},
	resolve: {
		alias: {
			'@': resolve(import.meta.dirname, './src'),
		},
	},
});
