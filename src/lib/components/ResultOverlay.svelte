<script lang="ts">
	import { onMount } from 'svelte';
	import type { Detection } from '$lib/onnx/types';

	let {
		imageUrl,
		imageWidth,
		imageHeight,
		detections
	}: {
		imageUrl: string;
		imageWidth: number;
		imageHeight: number;
		detections: Detection[];
	} = $props();

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let containerEl: HTMLDivElement | undefined = $state();

	function draw() {
		if (!canvasEl || !containerEl) return;

		const img = new Image();
		img.onload = () => {
			const containerWidth = containerEl!.clientWidth;
			const scale = containerWidth / imageWidth;
			const displayHeight = imageHeight * scale;

			canvasEl!.width = containerWidth;
			canvasEl!.height = displayHeight;

			const ctx = canvasEl!.getContext('2d')!;
			ctx.drawImage(img, 0, 0, containerWidth, displayHeight);

			for (const det of detections) {
				const [x, y, w, h] = det.bbox;
				const dx = x * scale;
				const dy = y * scale;
				const dw = w * scale;
				const dh = h * scale;

				ctx.strokeStyle = '#22c55e';
				ctx.lineWidth = 2;
				ctx.strokeRect(dx, dy, dw, dh);

				const label = `${det.className} ${Math.round(det.confidence * 100)}%`;
				ctx.font = '12px Inter, sans-serif';
				const textWidth = ctx.measureText(label).width;
				ctx.fillStyle = '#22c55e';
				ctx.fillRect(dx, dy - 20, textWidth + 8, 20);

				ctx.fillStyle = '#fff';
				ctx.fillText(label, dx + 4, dy - 6);
			}
		};
		img.src = imageUrl;
	}

	onMount(() => {
		draw();
	});
</script>

<div bind:this={containerEl} class="w-full">
	<canvas bind:this={canvasEl} class="w-full rounded-lg"></canvas>
</div>
