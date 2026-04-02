import { describe, it, expect } from 'vitest';
import { computeLetterbox, imageDataToTensor } from '../preprocess';

describe('computeLetterbox', () => {
	it('should compute letterbox for landscape image', () => {
		const result = computeLetterbox(800, 600, 640);
		expect(result.scale).toBeCloseTo(0.8);
		expect(result.offsetX).toBe(0);
		expect(result.offsetY).toBeCloseTo(80);
	});

	it('should compute letterbox for portrait image', () => {
		const result = computeLetterbox(600, 800, 640);
		expect(result.scale).toBeCloseTo(0.8);
		expect(result.offsetX).toBeCloseTo(80);
		expect(result.offsetY).toBe(0);
	});

	it('should compute letterbox for square image', () => {
		const result = computeLetterbox(640, 640, 640);
		expect(result.scale).toBe(1);
		expect(result.offsetX).toBe(0);
		expect(result.offsetY).toBe(0);
	});
});

describe('imageDataToTensor', () => {
	it('should convert 2x2 RGBA ImageData to CHW float32 tensor', () => {
		const data = new Uint8ClampedArray([
			255, 0, 0, 255,
			255, 0, 0, 255,
			255, 0, 0, 255,
			255, 0, 0, 255
		]);
		const imageData = { data, width: 2, height: 2 } as ImageData;
		const tensor = imageDataToTensor(imageData);

		expect(tensor.length).toBe(3 * 2 * 2);
		expect(tensor[0]).toBeCloseTo(1.0);
		expect(tensor[1]).toBeCloseTo(1.0);
		expect(tensor[2]).toBeCloseTo(1.0);
		expect(tensor[3]).toBeCloseTo(1.0);
		expect(tensor[4]).toBeCloseTo(0.0);
		expect(tensor[8]).toBeCloseTo(0.0);
	});
});
