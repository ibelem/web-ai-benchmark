<script>
	import { goTo } from '$lib/assets/js/utils';
	import { numberOfRunsStore, autoStore } from '$lib/store/store';
	import { onMount } from 'svelte';

	/**
	 * @type {boolean}
	 */
	export let auto;
	autoStore.subscribe((value) => {
		auto = value;
	});

	/**
	 * @type {number}
	 */
	let numOfRuns;

	numberOfRunsStore.subscribe((value) => {
		numOfRuns = value;
	});

	let max = 200;

	const setNumberOfRuns = () => {
		if (numOfRuns > max) {
			numOfRuns = max;
		} else if (numOfRuns < 1) {
			numOfRuns = 1;
		}
		goTo('run', numOfRuns);
	};

	const limitNumberOfRuns = () => {
		if (!auto && location.pathname?.toLowerCase().indexOf('run') > -1) {
			max = 500000;
		} else {
			max = 200;
		}
	};

	onMount(() => {
		limitNumberOfRuns();
	});
</script>

<div class="title">
	<span class="" title="Number of Runs">
		{#if numOfRuns === 1}
			{numOfRuns} Run
		{:else}
			{numOfRuns} Runs
		{/if}
	</span>
</div>
<div class="numofruns">
	<label>
		<input type="number" bind:value={numOfRuns} min="1" {max} on:change={setNumberOfRuns} />
		<input type="range" bind:value={numOfRuns} min="1" {max} on:change={setNumberOfRuns} />
	</label>
</div>

<style>
	.title,
	.numofruns {
		margin-top: -4px;
	}

	.title span {
		text-align: center;
	}

	input[type='number'] {
		padding: 1px 6px;
		width: 60px;
		border: 1px solid var(--grey-02);
		margin-left: -6px;
		font-family: 'JetBrains Mono', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		font-size: 12px;
		color: var(--font);
	}
	input[type='number']:hover,
	input[type='number']:focus {
		border: 1px solid var(--red);
		outline: none;
	}
	input[type='range'] {
		-webkit-appearance: none;
		width: 71vw;
		height: 1px;
		border-radius: 5px;
		background-color: var(--grey-02);
		outline: none;
		margin-left: 8px;
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 10px;
		height: 10px;
		border-radius: 100%;
		background-color: var(--grey-02);
	}

	input[type='range']:hover,
	input[type='range']:hover::-webkit-slider-thumb {
		background-color: var(--red);
	}

	input[type='range']:hover {
		height: 4px;
	}

	input[type='range']:hover::-webkit-slider-thumb {
		width: 16px;
		height: 16px;
		cursor: pointer;
	}

	.numofruns label {
		display: flex;
		align-items: center;
	}

	.numofruns label:hover {
		background-color: transparent;
	}

	@media (max-width: 1100px) {
		input[type='range'] {
			width: 64vw;
		}
	}

	@media (max-width: 800px) {
		input[type='range'] {
			width: 60vw;
		}
	}

	@media (max-width: 660px) {
		input[type='range'] {
			width: 48vw;
		}
	}

	@media (max-width: 500px) {
		input[type='range'] {
			width: 35vw;
		}
	}
</style>
