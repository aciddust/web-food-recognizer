import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/onnxruntime-web/dist/*.wasm',
					dest: '.'
				}
			]
		})
	],
	assetsInclude: ['**/*.onnx'],
	optimizeDeps: {
		exclude: ['onnxruntime-web']
	},
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'jsdom'
	}
});
