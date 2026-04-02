import type { LetterboxInfo } from './types';

const MODEL_INPUT_SIZE = 640;

export function computeLetterbox(
	srcWidth: number,
	srcHeight: number,
	targetSize: number = MODEL_INPUT_SIZE
): LetterboxInfo {
	const scale = Math.min(targetSize / srcWidth, targetSize / srcHeight);
	const newWidth = Math.round(srcWidth * scale);
	const newHeight = Math.round(srcHeight * scale);
	const offsetX = (targetSize - newWidth) / 2;
	const offsetY = (targetSize - newHeight) / 2;
	return { scale, offsetX, offsetY };
}

export function imageDataToTensor(imageData: ImageData): Float32Array {
	const { data, width, height } = imageData;
	const pixelCount = width * height;
	const tensor = new Float32Array(3 * pixelCount);

	for (let i = 0; i < pixelCount; i++) {
		const srcIdx = i * 4;
		tensor[i] = data[srcIdx] / 255;
		tensor[i + pixelCount] = data[srcIdx + 1] / 255;
		tensor[i + 2 * pixelCount] = data[srcIdx + 2] / 255;
	}

	return tensor;
}

export function preprocessImage(
	canvas: HTMLCanvasElement,
	image: HTMLImageElement | HTMLVideoElement | ImageBitmap,
	srcWidth: number,
	srcHeight: number
): { tensor: Float32Array; letterbox: LetterboxInfo } {
	const targetSize = MODEL_INPUT_SIZE;
	canvas.width = targetSize;
	canvas.height = targetSize;
	const ctx = canvas.getContext('2d')!;

	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, targetSize, targetSize);

	const letterbox = computeLetterbox(srcWidth, srcHeight, targetSize);
	const drawWidth = Math.round(srcWidth * letterbox.scale);
	const drawHeight = Math.round(srcHeight * letterbox.scale);
	ctx.drawImage(image, letterbox.offsetX, letterbox.offsetY, drawWidth, drawHeight);

	const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
	const tensor = imageDataToTensor(imageData);

	return { tensor, letterbox };
}
