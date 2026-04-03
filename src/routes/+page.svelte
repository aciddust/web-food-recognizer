<script lang="ts">
	import { base } from '$app/paths';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import { Camera, ScanSearch, UtensilsCrossed, ArrowRight, FileText } from '@lucide/svelte';
</script>

<div class="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
	<div class="w-full max-w-md space-y-8 text-center">
		<div class="space-y-2">
			<h1 class="text-3xl font-bold tracking-tight">Food Recognizer</h1>
			<p class="text-muted-foreground text-sm">
				카메라로 음식을 촬영하거나 이미지를 업로드하면 음식 종류를 인식합니다.
			</p>
		</div>

		<div class="grid grid-cols-3 gap-4 py-8">
			<div class="flex flex-col items-center gap-2">
				<div class="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
					<Camera class="text-muted-foreground h-6 w-6" />
				</div>
				<span class="text-sm font-medium">촬영</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<div class="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
					<ScanSearch class="text-muted-foreground h-6 w-6" />
				</div>
				<span class="text-sm font-medium">분석</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<div class="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
					<UtensilsCrossed class="text-muted-foreground h-6 w-6" />
				</div>
				<span class="text-sm font-medium">결과</span>
			</div>
		</div>

		<Button href={resolve('/camera')} class="w-full gap-2" size="lg">
			시작하기
			<ArrowRight class="h-4 w-4" />
		</Button>
		<Button href="{base}/finetune.html" class="w-full gap-2" size="lg" variant="outline">
			모델 전이학습 히스토리 1
			<FileText class="h-4 w-4" />
		</Button>
		<Button href="{base}/finetune2.html" class="w-full gap-2" size="lg" variant="outline">
			모델 전이학습 히스토리 2
			<FileText class="h-4 w-4" />
		</Button>
	</div>
</div>
