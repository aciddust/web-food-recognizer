export interface Detection {
	bbox: [x: number, y: number, w: number, h: number];
	classId: number;
	className: string;
	confidence: number;
}

export interface LetterboxInfo {
	scale: number;
	offsetX: number;
	offsetY: number;
}
