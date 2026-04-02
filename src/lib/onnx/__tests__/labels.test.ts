import { describe, it, expect } from 'vitest';
import { LABELS, getLabelName } from '../labels';

describe('labels', () => {
	it('should have exactly 53 labels', () => {
		expect(LABELS).toHaveLength(53);
	});

	it('should return correct label by index', () => {
		expect(getLabelName(0)).toBe('Braised lotus roots');
		expect(getLabelName(14)).toBe('bibimbap');
		expect(getLabelName(52)).toBe('young radish Kimchi');
	});

	it('should return "unknown" for out-of-range index', () => {
		expect(getLabelName(-1)).toBe('unknown');
		expect(getLabelName(53)).toBe('unknown');
	});
});
