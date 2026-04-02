import type { Detection, LetterboxInfo } from './types';
import { getLabelName } from './labels';

const CONFIDENCE_THRESHOLD = 0.25;
const IOU_THRESHOLD = 0.45;
const NUM_CLASSES = 53;

export function transpose(
	data: Float32Array,
	rows: number,
	cols: number
): Float32Array {
	const result = new Float32Array(rows * cols);
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			result[c * rows + r] = data[r * cols + c];
		}
	}
	return result;
}

export function filterByConfidence(
	data: Float32Array,
	channels: number,
	numClasses: number,
	threshold: number = CONFIDENCE_THRESHOLD
): Detection[] {
	const numCandidates = data.length / channels;
	const detections: Detection[] = [];

	for (let i = 0; i < numCandidates; i++) {
		const offset = i * channels;
		const cx = data[offset];
		const cy = data[offset + 1];
		const w = data[offset + 2];
		const h = data[offset + 3];

		let maxScore = 0;
		let maxClassId = 0;
		for (let c = 0; c < numClasses; c++) {
			const score = data[offset + 4 + c];
			if (score > maxScore) {
				maxScore = score;
				maxClassId = c;
			}
		}

		if (maxScore < threshold) continue;

		detections.push({
			bbox: [cx - w / 2, cy - h / 2, w, h],
			classId: maxClassId,
			className: getLabelName(maxClassId),
			confidence: maxScore
		});
	}

	return detections;
}

function computeIoU(a: Detection, b: Detection): number {
	const ax2 = a.bbox[0] + a.bbox[2];
	const ay2 = a.bbox[1] + a.bbox[3];
	const bx2 = b.bbox[0] + b.bbox[2];
	const by2 = b.bbox[1] + b.bbox[3];

	const interX = Math.max(0, Math.min(ax2, bx2) - Math.max(a.bbox[0], b.bbox[0]));
	const interY = Math.max(0, Math.min(ay2, by2) - Math.max(a.bbox[1], b.bbox[1]));
	const interArea = interX * interY;

	const aArea = a.bbox[2] * a.bbox[3];
	const bArea = b.bbox[2] * b.bbox[3];
	const unionArea = aArea + bArea - interArea;

	return unionArea === 0 ? 0 : interArea / unionArea;
}

export function nms(
	detections: Detection[],
	iouThreshold: number = IOU_THRESHOLD
): Detection[] {
	const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
	const kept: Detection[] = [];
	const suppressed = new Set<number>();

	for (let i = 0; i < sorted.length; i++) {
		if (suppressed.has(i)) continue;
		kept.push(sorted[i]);

		for (let j = i + 1; j < sorted.length; j++) {
			if (suppressed.has(j)) continue;
			if (sorted[i].classId !== sorted[j].classId) continue;
			if (computeIoU(sorted[i], sorted[j]) > iouThreshold) {
				suppressed.add(j);
			}
		}
	}

	return kept;
}

function inverseLetterbox(detections: Detection[], letterbox: LetterboxInfo): Detection[] {
	return detections.map((d) => ({
		...d,
		bbox: [
			(d.bbox[0] - letterbox.offsetX) / letterbox.scale,
			(d.bbox[1] - letterbox.offsetY) / letterbox.scale,
			d.bbox[2] / letterbox.scale,
			d.bbox[3] / letterbox.scale
		] as [number, number, number, number]
	}));
}

export function postprocess(
	rawOutput: Float32Array,
	numCandidates: number,
	numClasses: number = NUM_CLASSES,
	letterbox: LetterboxInfo,
	confidenceThreshold: number = CONFIDENCE_THRESHOLD,
	iouThreshold: number = IOU_THRESHOLD
): Detection[] {
	const channels = 4 + numClasses;
	const transposed = transpose(rawOutput, channels, numCandidates);
	const detections = filterByConfidence(transposed, channels, numClasses, confidenceThreshold);
	const nmsResult = nms(detections, iouThreshold);
	return inverseLetterbox(nmsResult, letterbox);
}
