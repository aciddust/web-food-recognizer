import { base } from '$app/paths';
import * as ort from 'onnxruntime-web/webgpu';
import { preprocessImage } from './preprocess';
import { postprocess } from './postprocess';
import type { Detection } from './types';
const NUM_CLASSES = 53;
const NUM_CANDIDATES = 8400;

let session: ort.InferenceSession | null = null;

export async function loadModel(
	onProgress?: (loaded: number, total: number) => void
): Promise<void> {
	if (session) return;

	const modelUrl = `${base}/model.onnx`;
	const response = await fetch(modelUrl);
	const contentLength = Number(response.headers.get('content-length') ?? 0);
	const reader = response.body!.getReader();
	const chunks: Uint8Array[] = [];
	let loaded = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
		loaded += value.length;
		onProgress?.(loaded, contentLength > 0 ? Math.max(contentLength, loaded) : loaded);
	}

	const modelBuffer = new Uint8Array(loaded);
	let offset = 0;
	for (const chunk of chunks) {
		modelBuffer.set(chunk, offset);
		offset += chunk.length;
	}

	const providers: string[] = [];
	if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
		providers.push('webgpu');
	}
	providers.push('wasm');

	session = await ort.InferenceSession.create(modelBuffer.buffer, {
		executionProviders: providers,
		graphOptimizationLevel: 'all'
	});
}

export async function runInference(
	image: HTMLImageElement | HTMLVideoElement | ImageBitmap,
	srcWidth: number,
	srcHeight: number
): Promise<Detection[]> {
	if (!session) {
		throw new Error('Model not loaded. Call loadModel() first.');
	}

	const canvas = document.createElement('canvas');
	const { tensor: floatData, letterbox } = preprocessImage(canvas, image, srcWidth, srcHeight);
	const inputTensor = new ort.Tensor('float32', floatData, [1, 3, 640, 640]);

	const results = await session.run({ images: inputTensor });
	const output = results['output0'];
	const rawData = output.data as Float32Array;

	return postprocess(rawData, NUM_CANDIDATES, NUM_CLASSES, letterbox);
}

export function isModelLoaded(): boolean {
	return session !== null;
}

export async function disposeModel(): Promise<void> {
	if (session) {
		await session.release();
		session = null;
	}
}
