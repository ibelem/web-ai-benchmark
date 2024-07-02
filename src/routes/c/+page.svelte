<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Environment from '$lib/components/Environment.svelte';
	import { models } from '$lib/config';
	import Enlarge from '$lib/components/svg/Enlarge.svelte';
	import FitScreen from '$lib/components/svg/FitScreen.svelte';
	import Log from '$lib/components/svg/Log.svelte';
	import LogToggle from '$lib/components/svg/LogToggle.svelte';
	import { onMount, beforeUpdate, afterUpdate } from 'svelte';
	import { page } from '$app/stores';
	import {
		getModelDataTypeById,
		getModelNameById,
		clearConformance,
		clearConformanceLog,
		updateConformanceLog,
		clearConformanceQueue,
		resetStore,
		setModelDownloadUrl,
		sortModelById,
		getModelDescriptionById,
		getModelNoteById
	} from '$lib/assets/js/utils';
	import {
		conformanceLogStore,
		conformanceStore,
		conformanceQueueStore,
		autoStore
	} from '$lib/store/store';
	import { runOnnxConformance, rawResult } from '$lib/assets/js/ort_utils_conformance';

	/**
	 * @type {string | any[]}
	 */
	let sortedModels = [];

	/**
	 * @type {string[]}
	 */
	let conformance;
	conformanceStore.subscribe((value) => {
		conformance = value;
	});

	/**
	 * @type {string[]}
	 */
	let conformanceQueue;
	conformanceQueueStore.subscribe((value) => {
		conformanceQueue = value;
	});

	/**
	 * @type {string[]}
	 */
	let conformanceLog;
	conformanceLogStore.subscribe((value) => {
		conformanceLog = value;
	});

	$: conformanceString = JSON.stringify(conformance);

	/**
	 * @type {string}
	 */
	let id;
	/**
	 * @type {string}
	 */
	let backend;

	const run = async () => {
		let params = $page.url.searchParams.get('q');

		if (params) {
			id = params.split('__')[0];
			backend = params.split('__')[1];
			rawConsole = '';
			let model = models.find((item) => item.id === id);
			model.backend = backend;
			await runOnnxConformance(id, 'onnx', getModelDataTypeById(id), backend);
			rawConsole = JSON.stringify(rawResult, null, ' ');
			rawConsole = rawConsole;
			conformance = conformance;
			conformanceLog = conformanceLog;
		}
	};

	let logShow = true;
	let jsonLogShow = true;
	let consoleSize = false;
	$: rawConsole = '';

	const copyJsonInfo = async () => {
		let log = JSON.stringify(conformance).toString();
		await navigator.clipboard.writeText(log);
		updateConformanceLog(`Json file string copied`);
		conformanceLog = conformanceLog;
	};

	const copyRawConsole = async () => {
		await navigator.clipboard.writeText(rawConsole.replaceAll(' ', '').replaceAll('\n', ''));
		updateConformanceLog(`Raw inference result copied`);
		rawConsole = rawConsole;
	};

	const copyLogInfo = async () => {
		let log = conformanceLog.toString().replaceAll(',', '\r\n');
		await navigator.clipboard.writeText(log);
		updateConformanceLog(`Log history copied`);
		conformanceLog = conformanceLog;
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
		if (conformance) scrollToBottom(element);
		if (conformanceLog) scrollToBottom(element2);
		if (rawConsole) scrollToBottom(element3);
	});

	const nav = (/** @type {string} */ path) => {
		rawConsole = '';
		location.href = location.origin + `/c?q=${path}`;
	};

	afterUpdate(() => {});

	onMount(async () => {
		sortedModels = sortModelById(models);
		await setModelDownloadUrl();
		rawConsole = '';
		clearConformance();
		clearConformanceQueue();
		clearConformanceLog();
		await run();
	});
</script>

<Header />

<div class="tqtitle subtitle">
	<div class="title tq">WebNN Conformance Tests</div>
	{#if id && backend}
		<div class="title tq">{id}</div>
		<div class="title tq">{backend}</div>
	{/if}
	<div>Check the WebNN conformance status with your current browser</div>
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
				<button title="Copy raw inference result" on:click={() => copyRawConsole()}>
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
				<div>{conformanceString}</div>
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

{#if conformanceLog && conformanceLog.length > 0}
	<div class="log">
		{#if logShow}
			<div class="inferlog" bind:this={element2}>
				{#each conformanceLog as fb}
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
	{#each sortedModels as m}
		{#if m.id !== 'model_access_check'}
			{#if getModelDataTypeById(m.id) === 'fp32'}
				<div class="b">
					<div
						class="t"
						title="{m.id.replaceAll('_', '-')} · {getModelNameById(
							m.id
						)} · {getModelDescriptionById(m.id)} · {getModelNoteById(m.id)}
					"
					>
						{getModelNameById(m.id)}
					</div>
					<div class="i">
						<a class="fb2 cpu" href="#top" on:click={() => nav(m.id + '__wasm_4')}>Wasm</a>
						<a class="fb2 cpu" href="#top" on:click={() => nav(m.id + '__webnn_cpu_4')}
							>WebNN CPU
						</a>
						<a class="fb2 gpu" href="#top" on:click={() => nav(m.id + '__webgl')}>WebGL</a>
						<a class="fb2 gpu" href="#top" on:click={() => nav(m.id + '__webgpu')}>WebGPU</a>
						<a class="fb2 gpu" href="#top" on:click={() => nav(m.id + '__webnn_gpu')}>WebNN GPU</a>
						<a class="fb2 npu" href="#top" on:click={() => nav(m.id + '__webnn_npu')}>WebNN NPU</a>
					</div>
				</div>
			{/if}
		{/if}
	{/each}
</div>

<div class="title tq fp16">Float16</div>
<div class="ho">
	{#each sortedModels as m}
		{#if m.id !== 'model_access_check'}
			{#if getModelDataTypeById(m.id) === 'fp16'}
				<div class="b">
					<div
						class="t"
						title="{m.id.replaceAll('_', '-')} · {getModelNameById(
							m.id
						)} · {getModelDescriptionById(m.id)} · {getModelNoteById(m.id)}
					"
					>
						{getModelNameById(m.id)}
					</div>
					<div class="i">
						<a class="fb2 cpu" href="#top" on:click={() => nav(m.id + '__wasm_4')}>Wasm</a>
						<a class="fb2 cpu" href="#top" on:click={() => nav(m.id + '__webnn_cpu_4')}
							>WebNN CPU
						</a>
						<a class="fb2 gpu" href="#top" on:click={() => nav(m.id + '__webgl')}>WebGL</a>
						<a class="fb2 gpu" href="#top" on:click={() => nav(m.id + '__webgpu')}>WebGPU</a>
						<a class="fb2 gpu" href="#top" on:click={() => nav(m.id + '__webnn_gpu')}>WebNN GPU</a>
						<a class="fb2 npu" href="#top" on:click={() => nav(m.id + '__webnn_npu')}>WebNN NPU</a>
					</div>
				</div>
			{/if}
		{/if}
	{/each}
</div>

<div class="title tq int8">Int8</div>
<div class="ho">
	{#each sortedModels as m}
		{#if m.id !== 'model_access_check'}
			{#if getModelDataTypeById(m.id) === 'int8'}
				<div class="b">
					<div
						class="t"
						title="{m.id.replaceAll('_', '-')} · {getModelNameById(
							m.id
						)} · {getModelDescriptionById(m.id)} · {getModelNoteById(m.id)}"
					>
						{getModelNameById(m.id)}
					</div>
					<div class="i">
						<a class="fb2 cpu" href="#top" on:click={() => nav(m.id + '__wasm_4')}>Wasm</a>
						<a class="fb2 cpu" href="#top" on:click={() => nav(m.id + '__webnn_cpu_4')}
							>WebNN CPU
						</a>
						<a class="fb2 gpu" href="#top" on:click={() => nav(m.id + '__webgl')}>WebGL</a>
						<a class="fb2 gpu" href="#top" on:click={() => nav(m.id + '__webgpu')}>WebGPU</a>
						<a class="fb2 gpu" href="#top" on:click={() => nav(m.id + '__webnn_gpu')}>WebNN GPU</a>
						<a class="fb2 npu" href="#top" on:click={() => nav(m.id + '__webnn_npu')}>WebNN NPU</a>
					</div>
				</div>
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
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr;
		grid-column-gap: 0px;
		grid-row-gap: 0px;
	}

	.ho .b {
		margin: 4px 0 0 0;
	}
	.ho .b .i,
	.ho .t {
		display: inline-block;
	}
	.ho .t {
		width: 160px;
		font-size: 10px;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		margin: -4px;
	}

	.fb2 {
		border: 1px solid var(--grey-02);
		padding: 0px 6px 0px 6px;
		background: transparent;
		font-family: 'JetBrains Mono', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background-color: var(--white);
		color: var(--font);
		cursor: pointer;
		width: 60px;
		text-align: center;
		font-size: 10px;
	}

	.fb2.cpu:hover {
		border: 1px solid var(--b1);
		color: var(--b1);
	}

	.fb2.gpu:hover {
		border: 1px solid var(--p2);
		color: var(--p2);
	}

	.fb2.npu:hover {
		border: 1px solid var(--purple);
		color: var(--purple);
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
