<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { resolve } from '$app/paths';
	import { Camera, RotateCcw, ImagePlus, SwitchCamera } from '@lucide/svelte';

	let {
		onCapture
	}: {
		onCapture: (dataUrl: string, width: number, height: number) => void;
	} = $props();

	let videoEl: HTMLVideoElement | undefined = $state();
	let stream: MediaStream | null = $state(null);
	let capturedUrl: string | null = $state(null);
	let capturedWidth = $state(0);
	let capturedHeight = $state(0);
	let error: string | null = $state(null);
	let fileInputEl: HTMLInputElement | undefined = $state();
	let videoDevices: MediaDeviceInfo[] = $state([]);
	let currentDeviceIndex = $state(0);

	async function enumerateCameras() {
		const devices = await navigator.mediaDevices.enumerateDevices();
		videoDevices = devices.filter((d) => d.kind === 'videoinput');
	}

	async function stopStream() {
		if (stream) {
			stream.getTracks().forEach((t) => t.stop());
			stream = null;
		}
	}

	async function startStreamByDeviceId(deviceId?: string) {
		await stopStream();
		try {
			const constraints = deviceId
				? { video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 960 } } }
				: { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } } };
			stream = await navigator.mediaDevices.getUserMedia(constraints);
			if (videoEl) {
				videoEl.srcObject = stream;
			}
		} catch {
			error = '카메라에 접근할 수 없습니다. 카메라 권한을 허용해주세요.';
		}
	}

	async function switchCamera() {
		if (videoDevices.length < 2) return;
		currentDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
		await startStreamByDeviceId(videoDevices[currentDeviceIndex].deviceId);
	}

	function handleFileUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				capturedWidth = img.naturalWidth;
				capturedHeight = img.naturalHeight;
				capturedUrl = img.src;
			};
			img.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	async function startCamera() {
		await startStreamByDeviceId();
		await enumerateCameras();
		// Match current stream to device list
		if (stream && videoDevices.length > 0) {
			const activeTrack = stream.getVideoTracks()[0];
			const activeDeviceId = activeTrack?.getSettings().deviceId;
			const idx = videoDevices.findIndex((d) => d.deviceId === activeDeviceId);
			if (idx >= 0) currentDeviceIndex = idx;
		}
	}

	function capture() {
		if (!videoEl) return;
		capturedWidth = videoEl.videoWidth;
		capturedHeight = videoEl.videoHeight;
		const canvas = document.createElement('canvas');
		canvas.width = capturedWidth;
		canvas.height = capturedHeight;
		const ctx = canvas.getContext('2d')!;
		ctx.drawImage(videoEl, 0, 0);
		capturedUrl = canvas.toDataURL('image/jpeg', 0.9);
	}

	function retake() {
		capturedUrl = null;
	}

	function confirmCapture() {
		if (!capturedUrl) return;
		onCapture(capturedUrl, capturedWidth, capturedHeight);
	}

	onMount(() => {
		startCamera();
	});

	onDestroy(() => {
		stopStream();
	});
</script>

<div class="relative flex h-full w-full flex-col items-center">
	{#if error}
		<div class="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
			<p class="text-destructive text-sm">{error}</p>
			<Button href={resolve('/')} variant="outline">홈으로 돌아가기</Button>
		</div>
	{:else if capturedUrl}
		<div class="relative flex-1">
			<img src={capturedUrl} alt="촬영된 사진" class="h-full w-full object-contain" />
		</div>
		<div class="flex w-full gap-3 p-4">
			<Button variant="outline" class="flex-1 gap-2" onclick={retake}>
				<RotateCcw class="h-4 w-4" />
				다시 촬영
			</Button>
			<Button class="flex-1" onclick={confirmCapture}>
				분석하기
			</Button>
		</div>
	{:else}
		<video
			bind:this={videoEl}
			autoplay
			playsinline
			muted
			class="h-full w-full object-cover"
		></video>
		<div class="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6">
			<button
				onclick={() => fileInputEl?.click()}
				class="bg-white/90 shadow-lg flex h-12 w-12 items-center justify-center rounded-full active:scale-95 transition-transform"
				aria-label="이미지 업로드"
			>
				<ImagePlus class="h-5 w-5 text-neutral-800" />
			</button>
			<button
				onclick={capture}
				class="bg-white border-4 border-white/80 shadow-lg flex h-16 w-16 items-center justify-center rounded-full active:scale-95 transition-transform"
				aria-label="촬영"
			>
				<Camera class="h-7 w-7 text-neutral-800" />
			</button>
			{#if videoDevices.length > 1}
				<button
					onclick={switchCamera}
					class="bg-white/90 shadow-lg flex h-12 w-12 items-center justify-center rounded-full active:scale-95 transition-transform"
					aria-label="카메라 전환"
				>
					<SwitchCamera class="h-5 w-5 text-neutral-800" />
				</button>
			{:else}
				<div class="h-12 w-12"></div>
			{/if}
		</div>
		<input
			bind:this={fileInputEl}
			type="file"
			accept="image/*"
			class="hidden"
			onchange={handleFileUpload}
		/>
	{/if}
</div>
