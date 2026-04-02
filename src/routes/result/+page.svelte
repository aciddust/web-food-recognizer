<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { get } from 'svelte/store';
	import { Button } from '$lib/components/ui/button';
	import { RotateCcw, SearchX } from '@lucide/svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import FoodCard from '$lib/components/FoodCard.svelte';
	import { captureStore, resetCapture } from '$lib/stores/capture';

	const state = get(captureStore);

	// Redirect if no capture data
	if (!state.imageDataUrl) {
		goto(resolve('/camera'), { replaceState: true });
	}

	function handleRetake() {
		resetCapture();
		goto(resolve('/camera'));
	}
</script>

{#if state.imageDataUrl}
	<div class="flex min-h-dvh flex-col">
		<div class="flex-1 space-y-4 p-4">
			<ResultOverlay
				imageUrl={state.imageDataUrl}
				imageWidth={state.imageWidth}
				imageHeight={state.imageHeight}
				detections={state.detections}
			/>

			{#if state.detections.length > 0}
				<div class="space-y-2">
					<h2 class="text-lg font-semibold">
						감지된 음식 ({state.detections.length})
					</h2>
					{#each state.detections as detection}
						<FoodCard {detection} />
					{/each}
				</div>
			{:else}
				<div class="flex flex-col items-center gap-2 py-8 text-center">
					<SearchX class="text-muted-foreground h-10 w-10" />
					<p class="text-muted-foreground">
						음식을 찾지 못했습니다. 다시 촬영해보세요.
					</p>
				</div>
			{/if}
		</div>

		<div class="sticky bottom-0 border-t bg-background p-4">
			<Button class="w-full gap-2" onclick={handleRetake}>
				<RotateCcw class="h-4 w-4" />
				다시 촬영
			</Button>
		</div>
	</div>
{/if}
