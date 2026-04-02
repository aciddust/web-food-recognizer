<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="bg-muted min-h-dvh">
	<div class="bg-background mx-auto min-h-dvh w-full max-w-md shadow-sm sm:border-x sm:border-border">
		{@render children()}
	</div>
</div>
