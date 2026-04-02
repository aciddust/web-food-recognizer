<script lang="ts">
	import type { Detection } from '$lib/onnx/types';

	let { detection }: { detection: Detection } = $props();
</script>

<div class="bg-card border-border flex items-center gap-4 rounded-lg border p-4">
	<div class="flex-1">
		<h3 class="font-semibold">{detection.className}</h3>
		<p class="text-muted-foreground text-sm">
			신뢰도 {Math.round(detection.confidence * 100)}%
		</p>
	</div>
	<!-- 영양정보 슬롯 (추후 확장) -->
	<div class="text-muted-foreground/50 text-xs">
		<!-- nutrition info placeholder -->
	</div>
</div>
