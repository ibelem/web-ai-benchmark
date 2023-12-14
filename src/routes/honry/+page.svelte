<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Environment from '$lib/components/Environment.svelte';
	import { models, ortDists } from '$lib/config';
	import Log from '$lib/components/svg/Log.svelte';
	import LogToggle from '$lib/components/svg/LogToggle.svelte';
	import Enlarge from '$lib/components/svg/Enlarge.svelte';
	import FitScreen from '$lib/components/svg/FitScreen.svelte';
	import { page } from '$app/stores';
	import { onMount, beforeUpdate } from 'svelte';
	import {
		getModelDataTypeById,
		getModelNameById,
		addFallback,
		resetFallback,
		resetFallbackLog,
		updateFallbackLog,
		resetFallbackQueue,
		resetStore
	} from '$lib/assets/js/utils';
	import { fallbackLogStore, fallbackStore, fallbackQueueStore, autoStore } from '$lib/store/store';

	/**
	 * @type {string[]}
	 */
	let fallback;
	fallbackStore.subscribe((value) => {
		fallback = value;
	});

	/**
	 * @type {string[]}
	 */
	let fallbackQueue;
	fallbackQueueStore.subscribe((value) => {
		fallbackQueue = value;
	});

	/**
	 * @type {string[]}
	 */
	let fallbackLog;
	fallbackLogStore.subscribe((value) => {
		fallbackLog = value;
	});

	$: fallbackString = JSON.stringify(fallback);

	$: rawConsole = '';

	/**
	 * @type {string}
	 */
	let id;
	/**
	 * @type {string}
	 */
	let backend;

	const run = async () => {
		rawConsole = '';

		let params = $page.url.searchParams.get('q');
		const worker = new Worker(ortDists.webnn_webglfix.workerjs);

		if (params) {
			id = params.split('__')[0];
			backend = params.split('__')[1];
			rawConsole = '';
			let model = models.find((item) => item.id === id);
			model.backend = backend;
			worker.postMessage(model);
		}

		worker.onmessage = (event) => {
			const outputData = event.data;
			if (typeof outputData === 'object' && 'name' in outputData && 'backend' in outputData) {
				addFallback(outputData);
				let filteredFallbackQueue = fallbackQueue.filter(
					(item) => item !== `${outputData.name}__${outputData.backend}`
				);
				fallbackQueueStore.update(() => filteredFallbackQueue);
				if (fallbackQueue.length > 0) {
					location.href = location.origin + `/fallback?${fallbackQueue[0]}`;
				}
			} else if (typeof outputData === 'object') {
				for (let i = 0; i < outputData.length; i++) {
					if (typeof outputData[i] === 'object') {
						rawConsole = rawConsole + `<div>${JSON.stringify(outputData[i])}</div>`;
					} else {
						rawConsole = rawConsole + `<div>${outputData[i]}</div>`;
					}
				}
			} else {
				updateFallbackLog(outputData);
			}

			fallback = fallback;
			fallbackLog = fallbackLog;
			// Handle the output received from the worker
		};
	};

	let logShow = true;
	let jsonLogShow = true;
	let consoleSize = false;

	const copyJsonInfo = async () => {
		let log = JSON.stringify(fallback);
		await navigator.clipboard.writeText(log);
		updateFallbackLog(`Json file string copied`);
		fallbackLog = fallbackLog;
	};

	const copyRawConsole = async () => {
		rawConsole = rawConsole.replaceAll('<div>', '').replaceAll('</div>', '\r\n');
		await navigator.clipboard.writeText(rawConsole);
		updateFallbackLog(`Raw console log copied`);
		rawConsole = rawConsole;
	};

	const copyLogInfo = async () => {
		let log = fallbackLog.toString().replaceAll(',', '\r\n');
		await navigator.clipboard.writeText(log);
		updateFallbackLog(`Log history copied`);
		fallbackLog = fallbackLog;
	};

	const toggleConsole = () => {
		consoleSize = !consoleSize;
	};

	/**
	 * @type {HTMLDivElement}
	 */
	let element;

	$: if (element) {
		scrollToBottom(element);
	}

	/**
	 * @type {HTMLDivElement}
	 */
	let element2;

	$: if (element2) {
		scrollToBottom(element2);
	}

	/**
	 * @type {HTMLDivElement}
	 */
	let element3;

	$: if (element3) {
		scrollToBottom(element3);
	}

	const scrollToBottom = (/** @type {HTMLDivElement} */ node) => {
		node?.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	beforeUpdate(() => {
		resetStore();
		autoStore.update(() => false);
		if (fallback) scrollToBottom(element);
		if (fallbackLog) scrollToBottom(element2);
		if (rawConsole) scrollToBottom(element3);
	});

	const nav = (/** @type {string} */ path) => {
		rawConsole = '';
		location.href = location.origin + `/honry?q=${path}`;
	};

	onMount(async () => {
		rawConsole = '';
		resetFallback();
		resetFallbackQueue();
		resetFallbackLog();
		await run();
	});
</script>

<Header />

<div class="tqtitle subtitle">
	<div class="title tq">WebNN Fallback Checker</div>
	{#if id && backend}
		<div class="title tq">{id}</div>
		<div class="title tq">
			{#if backend === 'cpu'}WebNN CPU{:else if backend === 'gpu'}WebNN GPU{/if}
		</div>
	{/if}
	<div>Check the WebNN fallback status with your current browser</div>
</div>

<div class="g2 {consoleSize}">
	<div class="fs rawconsole">
		{#if jsonLogShow}
			<div class="inferlog" bind:this={element3}>
				<div>{@html rawConsole}</div>
			</div>
		{/if}
		<div class="q copy">
			<div>
				<button title="Switch the element size" on:click={() => toggleConsole()}>
					{#if consoleSize}
						<Enlarge />
					{:else}
						<FitScreen />
					{/if}
				</button>
				<button title="Copy raw console logs" on:click={() => copyRawConsole()}>
					<Log />
				</button>

				<button
					title="Hide logs"
					on:click={() => {
						jsonLogShow = !jsonLogShow;
					}}
				>
					<LogToggle />
				</button>
			</div>
		</div>
	</div>

	<div class="fs">
		{#if jsonLogShow}
			<div class="inferlog" bind:this={element}>
				<div>{fallbackString}</div>
			</div>
		{/if}
		<div class="q copy">
			<div>
				<button title="Copy full test logs" on:click={() => copyJsonInfo()}>
					<Log />
				</button>

				<button
					title="Hide logs"
					on:click={() => {
						jsonLogShow = !jsonLogShow;
					}}
				>
					<LogToggle />
				</button>
			</div>
		</div>
	</div>
</div>

{#if fallbackLog && fallbackLog.length > 0}
	<div class="log">
		{#if logShow}
			<div class="inferlog" bind:this={element2}>
				{#each fallbackLog as fb}
					<div>{fb}</div>
				{/each}
			</div>
		{/if}
		<div class="q copy">
			<div>
				<button title="Copy full test logs" on:click={() => copyLogInfo()}>
					<Log />
				</button>

				<button
					title="Hide logs"
					on:click={() => {
						logShow = !logShow;
					}}
				>
					<LogToggle />
				</button>
			</div>
		</div>
	</div>
{/if}

<div class="title tq">Float32</div>
<div class="ho">
	{#each models as m}
		{#if m.id !== 'model_access_check'}
			{#if getModelDataTypeById(m.id) === 'fp32'}
				<a class="fb2" href="" on:click={() => nav(m.id + '__cpu')}>{getModelNameById(m.id)} C</a>
				<a class="fb2" href="" on:click={() => nav(m.id + '__gpu')}>{getModelNameById(m.id)} G</a>
			{/if}
		{/if}
	{/each}
</div>

<div class="title tq">Float16</div>
<div class="ho">
	{#each models as m}
		{#if m.id !== 'model_access_check'}
			{#if getModelDataTypeById(m.id) === 'fp16'}
				<a class="fb2" href="" on:click={() => nav(m.id + '__cpu')}>{getModelNameById(m.id)} C</a>
				<a class="fb2" href="" on:click={() => nav(m.id + '__gpu')}>{getModelNameById(m.id)} G</a>
			{/if}
		{/if}
	{/each}
</div>

<div class="title tq">Int8</div>
<div class="ho">
	{#each models as m}
		{#if m.id !== 'model_access_check'}
			{#if getModelDataTypeById(m.id) === 'int8'}
				<a class="fb2" href="" on:click={() => nav(m.id + '__cpu')}>{getModelNameById(m.id)} C</a>
				<a class="fb2" href="" on:click={() => nav(m.id + '__gpu')}>{getModelNameById(m.id)} G</a>
			{/if}
		{/if}
	{/each}
</div>

<Environment />
<Footer />

<style>
	.tqtitle {
		margin: 10px 0 0 0;
	}

	.subtitle {
		margin-bottom: 10px;
	}

	.ho {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.fb2 {
		border: 1px solid var(--grey-02);
		padding: 0px 6px 0px 6px;
		background: transparent;
		font-family: 'Space Mono', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background-color: var(--white);
		color: var(--font);
		cursor: pointer;
		width: 176px;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.title {
		text-align: center;
		color: var(--red);
	}

	.title button {
		background-color: transparent;
		border: 0;
		color: var(--red);
		text-transform: uppercase;
	}

	.title button:hover {
		cursor: pointer;
	}

	.tq {
		margin: 10px 0 10px 0;
	}

	.inferlog {
		margin-top: 10px;
		border: 1px solid var(--grey-02);
		padding: 10px;
		height: 120px;
		overflow-y: scroll;
		scroll-behavior: smooth;
		text-align: left;
	}

	.inferlog:hover {
		border: 1px solid var(--grey-04);
	}

	.inferlog {
		scrollbar-width: auto;
		scrollbar-color: var(--grey-02), #ffffff;
	}

	.inferlog::-webkit-scrollbar {
		width: 12px !important;
		height: 11px !important;
	}

	.inferlog::-webkit-scrollbar-track {
		background: transparent;
	}

	.inferlog::-webkit-scrollbar-thumb {
		background-color: var(--grey-04);
		border-radius: 10px;
		border: 5px solid #ffffff;
	}

	.inferlog:hover::-webkit-scrollbar-thumb {
		background-color: var(--green);
	}

	.f {
		cursor: pointer;
		min-width: 45px;
		text-align: center;
	}

	.f button {
		border: 1px solid var(--grey-02);
		padding: 0px 6px 0px 6px;
		background: transparent;
		font-family: 'Space Mono', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background-color: var(--white);
		color: var(--font);
		cursor: pointer;
		width: 176px;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.f button:hover {
		background-image: none;
		background-color: var(--red-005);
		color: var(--red);
		border: 1px solid var(--red) !important;
	}

	.run {
		margin-top: 40px;
	}

	.progress {
		border: 1px solid var(--grey-02);
		padding: 4px 10px;
		margin-top: -1px;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr;
		grid-column-gap: 0px;
		grid-row-gap: 0px;
	}

	.progress:hover {
		border: 1px solid var(--grey-04);
	}

	.g2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr;
		grid-column-gap: 10px;
		grid-row-gap: 0px;
	}

	.g2 .fs {
		width: 44.2vw;
	}

	.true.g2 {
		display: block;
	}

	.true.g2 .fs {
		width: 100%;
	}

	.true.g2 .rawconsole .inferlog {
		height: 60vh;
	}

	@media (max-width: 512px) {
		.f button {
			width: 46.6vw;
		}
		.g2 {
			display: block;
		}
		.g2 .fs {
			width: 100%;
		}
	}
</style>