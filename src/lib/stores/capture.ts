import { writable } from 'svelte/store';
import type { Detection } from '$lib/onnx/types';

interface CaptureState {
	imageDataUrl: string | null;
	imageWidth: number;
	imageHeight: number;
	detections: Detection[];
}

const initial: CaptureState = {
	imageDataUrl: null,
	imageWidth: 0,
	imageHeight: 0,
	detections: []
};

export const captureStore = writable<CaptureState>(initial);

export function setCapturedImage(dataUrl: string, width: number, height: number): void {
	captureStore.update((s) => ({
		...s,
		imageDataUrl: dataUrl,
		imageWidth: width,
		imageHeight: height,
		detections: []
	}));
}

export function setDetections(detections: Detection[]): void {
	captureStore.update((s) => ({ ...s, detections }));
}

export function resetCapture(): void {
	captureStore.set(initial);
}
