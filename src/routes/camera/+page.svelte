<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Loader2 } from '@lucide/svelte';
	import CameraView from '$lib/components/CameraView.svelte';
	import { loadModel, runInference, isModelLoaded } from '$lib/onnx/session';
	import { setCapturedImage, setDetections } from '$lib/stores/capture';

	let modelLoading = $state(true);
	let modelError: string | null = $state(null);
	let progress = $state(0);
	let analyzing = $state(false);

	async function initModel() {
		try {
			await loadModel((loaded, total) => {
				progress = total > 0 ? Math.round((loaded / total) * 100) : 0;
			});
			modelLoading = false;
		} catch {
			modelError = '모델을 불러올 수 없습니다.';
			modelLoading = false;
		}
	}

	async function handleCapture(dataUrl: string, width: number, height: number) {
		setCapturedImage(dataUrl, width, height);

		if (!isModelLoaded()) {
			await initModel();
		}

		analyzing = true;
		try {
			const img = new Image();
			img.src = dataUrl;
			await new Promise<void>((resolve) => {
				img.onload = () => resolve();
			});

			const detections = await runInference(img, width, height);
			setDetections(detections);
			goto(resolve('/result'));
		} catch (e) {
			console.error('Inference failed:', e);
			analyzing = false;
		}
	}

	$effect(() => {
		initModel();
	});
</script>

<div class="flex h-dvh flex-col">
	{#if analyzing}
		<div class="flex flex-1 flex-col items-center justify-center gap-4">
			<Loader2 class="text-muted-foreground h-8 w-8 animate-spin" />
			<p class="text-muted-foreground text-sm">음식을 분석하고 있습니다...</p>
		</div>
	{:else if modelLoading}
		<div class="flex flex-1 flex-col items-center justify-center gap-4 px-8">
			<p class="text-muted-foreground text-sm">모델 준비 중... {progress}%</p>
			<div class="bg-muted h-2 w-full max-w-xs overflow-hidden rounded-full">
				<div
					class="bg-primary h-full transition-all duration-300"
					style="width: {progress}%"
				></div>
			</div>
		</div>
	{:else if modelError}
		<div class="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
			<p class="text-destructive text-sm">{modelError}</p>
			<button class="text-primary text-sm underline" onclick={() => { modelError = null; modelLoading = true; initModel(); }}>
				다시 시도
			</button>
		</div>
	{:else}
		<CameraView onCapture={handleCapture} />
	{/if}
</div>
