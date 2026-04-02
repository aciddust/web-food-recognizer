import { describe, it, expect } from 'vitest';
import { transpose, filterByConfidence, nms, postprocess } from '../postprocess';
import type { LetterboxInfo } from '../types';

describe('transpose', () => {
	it('should transpose [channels, candidates] to [candidates, channels]', () => {
		const input = new Float32Array([1, 2, 3, 4, 5, 6]);
		const result = transpose(input, 3, 2);
		expect(Array.from(result)).toEqual([1, 3, 5, 2, 4, 6]);
	});
});

describe('filterByConfidence', () => {
	it('should filter candidates below threshold', () => {
		const data = new Float32Array([
			100, 100, 50, 50, 0.9, 0.1,
			200, 200, 30, 30, 0.1, 0.2
		]);
		const result = filterByConfidence(data, 6, 2, 0.5);
		expect(result).toHaveLength(1);
		expect(result[0].classId).toBe(0);
		expect(result[0].confidence).toBeCloseTo(0.9);
	});
});

describe('nms', () => {
	it('should suppress overlapping boxes of same class', () => {
		const detections = [
			{ bbox: [100, 100, 50, 50] as [number, number, number, number], classId: 0, className: 'rice', confidence: 0.9 },
			{ bbox: [105, 105, 50, 50] as [number, number, number, number], classId: 0, className: 'rice', confidence: 0.8 },
			{ bbox: [300, 300, 50, 50] as [number, number, number, number], classId: 1, className: 'Kimchi', confidence: 0.7 }
		];
		const result = nms(detections, 0.45);
		expect(result).toHaveLength(2);
		expect(result[0].confidence).toBeCloseTo(0.9);
		expect(result[1].className).toBe('Kimchi');
	});

	it('should keep non-overlapping boxes of same class', () => {
		const detections = [
			{ bbox: [0, 0, 50, 50] as [number, number, number, number], classId: 0, className: 'rice', confidence: 0.9 },
			{ bbox: [400, 400, 50, 50] as [number, number, number, number], classId: 0, className: 'rice', confidence: 0.8 }
		];
		const result = nms(detections, 0.45);
		expect(result).toHaveLength(2);
	});
});

describe('postprocess', () => {
	it('should convert raw output to detections with coordinate inverse', () => {
		const numClasses = 2;
		const channels = 4 + numClasses;
		const numCandidates = 1;

		const rawOutput = new Float32Array(channels * numCandidates);
		rawOutput[0] = 320; // cx
		rawOutput[1] = 320; // cy
		rawOutput[2] = 100; // w
		rawOutput[3] = 100; // h
		rawOutput[4] = 0.95; // class 0 score
		rawOutput[5] = 0.05; // class 1 score

		const letterbox: LetterboxInfo = { scale: 1, offsetX: 0, offsetY: 0 };
		const result = postprocess(rawOutput, numCandidates, numClasses, letterbox);

		expect(result).toHaveLength(1);
		expect(result[0].classId).toBe(0);
		expect(result[0].confidence).toBeCloseTo(0.95);
		expect(result[0].bbox[0]).toBeCloseTo(270);
		expect(result[0].bbox[1]).toBeCloseTo(270);
	});
});
