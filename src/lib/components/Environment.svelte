<script>
	import { onMount } from 'svelte';
	import { environment, cpu } from '$lib/config.js';
	import { getGpu } from '$lib/assets/js/utils.js';
	// @ts-ignore
	import { UAParser } from 'ua-parser-js';
	import to from 'await-to-js';
	import Modal from './Modal.svelte';
	import AutoComplete from 'simple-svelte-autocomplete';
	import OrtDetect from './OrtDetect.svelte';
	import { cpuStore } from '$lib/store/store';

	let showModal = false;

	/**
	 * @type {string}
	 */
	let cpuInfo;
	cpuStore.subscribe((value) => {
		cpuInfo = value;
	});

	let cpState = '';
	let observer;

	const getCP = async () => {
		if ('PressureObserver' in window) {
			const pressureObserverCallback = (updates) => {
				cpState = updates[0].state;
			};
			observer = new PressureObserver(pressureObserverCallback, { sampleRate: 1 });
			await observer.observe('cpu');
		}
	};

	let connectionType = '';
	let connectionEffectiveType = '';

	const getNetworkInfomation = async () => {
		connectionType = navigator.connection?.type;
		connectionEffectiveType = navigator.connection?.effectiveType;
	};

	let batteryCharging = false;
	let batteryLevel = 0;

	const getBattery = () => {
		navigator
			.getBattery()
			.then(
				(
					/** @type {{ addEventListener: (arg0: string, arg1: { (): void; (): void; (): void; (): void; }) => void; }} */ battery
				) => {
					const updateChargeInfo = () => {
						batteryCharging = battery.charging;
					};

					const updateLevelInfo = () => {
						batteryLevel = battery.level * 100;
					};

					// const updateChargingInfo = () => {
					// 	console.log(`Battery charging time: ${battery.chargingTime} seconds`);
					// };

					// const updateDischargingInfo = () => {
					// 	console.log(`Battery discharging time: ${battery.dischargingTime} seconds`);
					// };

					const updateAllBatteryInfo = () => {
						updateChargeInfo();
						updateLevelInfo();
						// updateChargingInfo();
						// updateDischargingInfo();
					};
					updateAllBatteryInfo();

					battery.addEventListener('chargingchange', () => {
						updateChargeInfo();
					});

					battery.addEventListener('levelchange', () => {
						updateLevelInfo();
					});

					// battery.addEventListener('chargingtimechange', () => {
					// 	updateChargingInfo();
					// });

					// battery.addEventListener('dischargingtimechange', () => {
					// 	updateDischargingInfo();
					// });
				}
			);
	};

	/**
	 * @type {any}
	 */
	let memory;

	/**
	 * @type {any}
	 */
	let storage = null;
	/**
	 * @type {string | null}
	 */
	let _used = null;
	// let _quota = null;

	const performMeasurement = async () => {
		memory = await performance.measureUserAgentSpecificMemory();
		if (memory) {
			memory = memory.bytes / (1024 * 1024.0);
			memory = memory.toFixed(2);
		}
		scheduleMeasurement();
	};

	const scheduleMeasurement = () => {
		setTimeout(performMeasurement, 1000);
	};

	const ONE_MEG = 1000000;

	const formatToMB = (val) => {
		const opts = {
			maximumFractionDigits: 0
		};
		let result;
		try {
			result = new Intl.NumberFormat('en-us', opts).format(val / ONE_MEG);
		} catch (ex) {
			result = Math.round(val / ONE_MEG);
		}
		return `${result} MB`;
	};

	const checkStorage = () => {
		navigator.storage
			.estimate()
			.then((quota) => {
				_used = formatToMB(quota?.usage);
				// _remaining = formatToMB(quota?.quota - quota?.usage);
				// _quota = formatToMB(quota.quota);
				storage = ((quota.usage * 100) / quota.quota).toFixed(2);
			})
			.catch((err) => {
				console.error('*** Unable to update quota ***', err);
			})
			.then(() => {
				setTimeout(() => {
					checkStorage();
				}, 1000);
			});
	};

	const updateCPU = () => {
		cpuStore.update(() => cpuInfo);
		environment.cpu = cpuInfo;
	};

	onMount(async () => {
		let parser = UAParser(navigator.userAgent);
		if (cpuInfo) {
			environment.cpu = cpuInfo;
		} else {
			environment.cpu = parser.cpu.architecture;
		}
		environment.logicCores = navigator.hardwareConcurrency;
		environment.gpu = getGpu();
		environment.os = parser.os.name;
		environment.osVersion = parser.os.version;
		environment.webbrowser = parser.browser.name;
		environment.browserVersion = parser.browser.version;

		const [err, data] = await to(getCP());
		const [errNI, dataNI] = await to(getNetworkInfomation());

		checkStorage();

		try {
			navigator.connection?.addEventListener('change', getNetworkInfomation);
		} catch {}
		try {
			getBattery();
		} catch {}
		if (crossOriginIsolated && performance.measureUserAgentSpecificMemory) {
			scheduleMeasurement();
		}
	});
</script>

<OrtDetect />

<div class="environment">
	<div title="CPU model">
		<svg width="1em" height="1em" viewBox="0 0 24 24"
			><path
				fill="currentColor"
				fill-rule="evenodd"
				d="M9 1.25a.75.75 0 0 1 .75.75v1.263a85.75 85.75 0 0 1 1.5-.013V2a.75.75 0 0 1 1.5 0v1.25c.535.001 1.034.004 1.5.013V2a.75.75 0 0 1 1.5 0v1.327c.26.02.506.045.739.076c1.172.158 2.121.49 2.87 1.238c.748.749 1.08 1.698 1.238 2.87c.031.233.056.48.076.739H22a.75.75 0 0 1 0 1.5h-1.263c.01.466.012.965.013 1.5H22a.75.75 0 0 1 0 1.5h-1.25a87.137 87.137 0 0 1-.013 1.5H22a.75.75 0 0 1 0 1.5h-1.327c-.02.26-.045.506-.076.739c-.158 1.172-.49 2.121-1.238 2.87c-.749.748-1.698 1.08-2.87 1.238c-.233.031-.48.056-.739.076V22a.75.75 0 0 1-1.5 0v-1.263c-.466.01-.965.012-1.5.013V22a.75.75 0 0 1-1.5 0v-1.25a87.137 87.137 0 0 1-1.5-.013V22a.75.75 0 0 1-1.5 0v-1.327c-.26-.02-.506-.045-.739-.076c-1.172-.158-2.121-.49-2.87-1.238c-.748-.749-1.08-1.698-1.238-2.87c-.031-.233-.056-.48-.076-.739H2a.75.75 0 0 1 0-1.5h1.263a85.75 85.75 0 0 1-.013-1.5H2a.75.75 0 0 1 0-1.5h1.25c.001-.535.004-1.034.013-1.5H2a.75.75 0 0 1 0-1.5h1.327c.02-.26.045-.506.076-.739c.158-1.172.49-2.121 1.238-2.87c.749-.748 1.698-1.08 2.87-1.238c.233-.031.48-.056.739-.076V2A.75.75 0 0 1 9 1.25ZM7.71 4.89c-1.005.135-1.585.389-2.008.812c-.423.423-.677 1.003-.812 2.009c-.138 1.028-.14 2.382-.14 4.289c0 1.907.002 3.261.14 4.29c.135 1.005.389 1.585.812 2.008c.423.423 1.003.677 2.009.812c1.028.138 2.382.14 4.289.14c1.907 0 3.261-.002 4.29-.14c1.005-.135 1.585-.389 2.008-.812c.423-.423.677-1.003.812-2.009c.138-1.028.14-2.382.14-4.289c0-1.907-.002-3.261-.14-4.29c-.135-1.005-.389-1.585-.812-2.008c-.423-.423-1.003-.677-2.009-.812c-1.028-.138-2.382-.14-4.289-.14c-1.907 0-3.261.002-4.29.14Zm2.24 1.36h4.1c.664 0 1.237 0 1.696.062c.492.066.963.215 1.345.597s.531.854.597 1.345c.062.459.062 1.032.062 1.697v4.098c0 .665 0 1.238-.062 1.697c-.066.492-.215.963-.597 1.345s-.854.531-1.345.597c-.459.062-1.032.062-1.697.062H9.951c-.665 0-1.238 0-1.697-.062c-.491-.066-.963-.215-1.345-.597s-.531-.854-.597-1.345c-.062-.459-.062-1.032-.062-1.697V9.951c0-.665 0-1.238.062-1.697c.066-.491.215-.963.597-1.345s.854-.531 1.345-.597c.459-.062 1.032-.062 1.697-.062ZM8.455 7.798c-.325.044-.427.115-.484.172c-.057.057-.128.159-.172.484c-.046.347-.048.818-.048 1.546v4c0 .728.002 1.2.048 1.546c.044.325.115.427.172.484c.057.057.159.128.484.172c.347.046.818.048 1.546.048h4c.728 0 1.2-.002 1.546-.048c.325-.044.427-.115.484-.172c.057-.057.128-.159.172-.484c.046-.347.048-.818.048-1.546v-4c0-.728-.002-1.2-.048-1.546c-.044-.325-.115-.427-.172-.484c-.057-.057-.159-.128-.484-.172c-.347-.046-.818-.048-1.546-.048h-4c-.728 0-1.2.002-1.546.048Z"
				clip-rule="evenodd"
			/></svg
		>
		<button
			class="updateCPULink"
			on:click={() => (showModal = true)}
			title="Clink this link to update CPU model"
		>
			{#if environment.cpu}
				<span
					>{#if environment.cpu === 'amd64'}x86-64{:else}{environment.cpu}{/if}</span
				>
			{/if}

			{#if environment.logicCores}
				<span>{environment.logicCores} Logical Cores</span>
			{/if}

			{#if !environment.logicCores && !environment.logicCores}
				Update CPU model
			{/if}
		</button>
	</div>

	<Modal bind:showModal>
		<h2 slot="header" class="updatecpu">Your CPU Model</h2>

		<div class="info">
			This website does not collect any test equipment information or user data. It is intended
			solely for your local use.
		</div>

		<AutoComplete items={cpu} bind:selectedItem={cpuInfo} onChange={updateCPU} />
	</Modal>

	{#if cpState}
		<div title="CPU pressure" class={cpState}>
			<a href="https://www.w3.org/TR/compute-pressure/#pressure-states">
				{#if cpState === 'nominal'}
					<svg viewBox="0 -960 960 960"
						><path
							d="M480-260q68 0 123.5-38.5T684-400H276q25 63 80.5 101.5T480-260ZM312-520l44-42 42 42 42-42-84-86-86 86 42 42Zm250 0 42-42 44 42 42-42-86-86-84 86 42 42ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"
						/></svg
					>
					Nominal{/if}
				{#if cpState === 'fair'}
					<svg viewBox="0 -960 960 960"
						><path
							d="M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm140 260q68 0 123.5-38.5T684-400h-66q-22 37-58.5 58.5T480-320q-43 0-79.5-21.5T342-400h-66q25 63 80.5 101.5T480-260Zm0 180q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"
						/></svg
					> Fair{/if}
				{#if cpState === 'serious'}
					<svg viewBox="0 -960 960 960"
						><path
							d="M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm140 100q-68 0-123.5 38.5T276-280h408q-25-63-80.5-101.5T480-420Zm0 340q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"
						/></svg
					> Serious{/if}
				{#if cpState === 'critical'}<svg
						xmlns="http://www.w3.org/2000/svg"
						height="24"
						viewBox="0 -960 960 960"
						><path
							d="M480-420q-68 0-123.5 38.5T276-280h408q-25-63-80.5-101.5T480-420Zm-168-60 44-42 42 42 42-42-42-42 42-44-42-42-42 42-44-42-42 42 42 44-42 42 42 42Zm250 0 42-42 44 42 42-42-42-42 42-44-42-42-44 42-42-42-42 42 42 44-42 42 42 42ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"
						/></svg
					> Critical{/if}
				CPU Pressure</a
			>
		</div>
	{/if}

	{#if environment.gpu}
		<div title="GPU: {environment.gpu}">
			<svg width="1em" height="1em" viewBox="0 0 16 16"
				><g fill="currentColor"
					><path
						d="M4 8a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0Zm7.5-1.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3Z"
					/><path
						d="M0 1.5A.5.5 0 0 1 .5 1h1a.5.5 0 0 1 .5.5V4h13.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H2v2.5a.5.5 0 0 1-1 0V2H.5a.5.5 0 0 1-.5-.5Zm5.5 4a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5ZM9 8a2.5 2.5 0 1 0 5 0a2.5 2.5 0 0 0-5 0Z"
					/><path
						d="M3 12.5h3.5v1a.5.5 0 0 1-.5.5H3.5a.5.5 0 0 1-.5-.5v-1Zm4 1v-1h4v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5Z"
					/></g
				></svg
			>
			{environment.gpu}
		</div>
	{/if}

	<div
		title="Memory usage of this page. It performs memory measurement during garbage collection. This reduces the noise in the results, but it may take a while until the results are produced."
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
			><path
				d="M240-360h80v-240h-80v240Zm200 0h80v-240h-80v240Zm200 0h80v-240h-80v240Zm-480 80h640v-400H160v400Zm0 0v-400 400Zm40 160v-80h-40q-33 0-56.5-23.5T80-280v-400q0-33 23.5-56.5T160-760h40v-80h80v80h160v-80h80v80h160v-80h80v80h40q33 0 56.5 23.5T880-680v400q0 33-23.5 56.5T800-200h-40v80h-80v-80H520v80h-80v-80H280v80h-80Z"
			/></svg
		>
		{#if memory}
			{memory} MB
		{:else}
			Estimating Memory <div class="loader">
				<span class="loader_el"></span>
				<span class="loader_el"></span>
				<span class="loader_el"></span>
			</div>
		{/if}
	</div>

	{#if storage}
		<div title="Storage usage">
			<!-- {_remaining}/{_quota} -->
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
				><path
					d="M160-280h640v-240H160v240Zm520-60q25 0 42.5-17.5T740-400q0-25-17.5-42.5T680-460q-25 0-42.5 17.5T620-400q0 25 17.5 42.5T680-340Zm200-260H767l-80-80H273l-80 80H80l137-137q11-11 25.5-17t30.5-6h414q16 0 30.5 6t25.5 17l137 137ZM160-200q-33 0-56.5-23.5T80-280v-320h800v320q0 33-23.5 56.5T800-200H160Z"
				/></svg
			>
			{_used}
			{storage}% Storage Used
		</div>
	{/if}

	{#if (connectionType && connectionType !== 'none' && connectionType !== 'unknown' && connectionType !== 'other') || connectionEffectiveType}
		<div title="Connection type">
			{#if connectionType?.toLowerCase().indexOf('bluetooth') > -1}
				<svg viewBox="0 -960 960 960"
					><path
						d="M440-80v-304L256-200l-56-56 224-224-224-224 56-56 184 184v-304h40l228 228-172 172 172 172L480-80h-40Zm80-496 76-76-76-74v150Zm0 342 76-74-76-76v150ZM200-420q-25 0-42.5-17.5T140-480q0-25 17.5-42.5T200-540q25 0 42.5 17.5T260-480q0 25-17.5 42.5T200-420Zm560 0q-25 0-42.5-17.5T700-480q0-25 17.5-42.5T760-540q25 0 42.5 17.5T820-480q0 25-17.5 42.5T760-420Z"
					/></svg
				>{/if}
			{#if connectionType?.toLowerCase().indexOf('cellular') > -1}
				<svg viewBox="0 -960 960 960"
					><path
						d="M200-160v-240h120v240H200Zm240 0v-440h120v440H440Zm240 0v-640h120v640H680Z"
					/></svg
				>{/if}
			{#if connectionType?.toLowerCase().indexOf('ethernet') > -1}
				<svg viewBox="0 -960 960 960"
					><path
						d="m680-240-56-56 182-184-182-184 56-56 240 240-240 240Zm-400 0L40-480l240-240 56 56-182 184 182 184-56 56Zm40-200q-17 0-28.5-11.5T280-480q0-17 11.5-28.5T320-520q17 0 28.5 11.5T360-480q0 17-11.5 28.5T320-440Zm160 0q-17 0-28.5-11.5T440-480q0-17 11.5-28.5T480-520q17 0 28.5 11.5T520-480q0 17-11.5 28.5T480-440Zm160 0q-17 0-28.5-11.5T600-480q0-17 11.5-28.5T640-520q17 0 28.5 11.5T680-480q0 17-11.5 28.5T640-440Z"
					/></svg
				>
			{/if}
			{#if connectionType?.toLowerCase().indexOf('mixed') > -1}
				<svg viewBox="0 -960 960 960"
					><path
						d="m442-440-77-77q16-16 35.5-24.5T442-550q22 0 41.5 8.5T519-517l-77 77ZM240-80l640-642v642H240Zm480-80h80v-368l-80 80v288ZM314-568l-52-52q36-36 82.5-55t97.5-19q51 0 97.5 19t82.5 55l-52 52q-26-26-59-40t-69-14q-36 0-69 14t-59 40ZM212-672l-52-50q57-57 129.5-87.5T442-840q81 0 154 30.5T726-722l-52 50q-46-46-106-70t-126-24q-65 0-124.5 24T212-672Z"
					/></svg
				>{/if}
			{#if connectionType?.toLowerCase().indexOf('wifi') > -1}
				<svg viewBox="0 -960 960 960"
					><path
						d="M480-120q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM254-346l-84-86q59-59 138.5-93.5T480-560q92 0 171.5 35T790-430l-84 84q-44-44-102-69t-124-25q-66 0-124 25t-102 69ZM84-516 0-600q92-94 215-147t265-53q142 0 265 53t215 147l-84 84q-77-77-178.5-120.5T480-680q-116 0-217.5 43.5T84-516Z"
					/></svg
				>{/if}
			{#if connectionType?.toLowerCase().indexOf('wimax') > -1}
				<svg viewBox="0 -960 960 960"
					><path
						d="M480-120q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM254-346l-84-86q59-59 138.5-93.5T480-560q92 0 171.5 35T790-430l-84 84q-44-44-102-69t-124-25q-66 0-124 25t-102 69ZM84-516 0-600q92-94 215-147t265-53q142 0 265 53t215 147l-84 84q-77-77-178.5-120.5T480-680q-116 0-217.5 43.5T84-516Z"
					/></svg
				>{/if}

			{#if connectionEffectiveType.toLowerCase().indexOf('slow-2g') > -1}
				<svg viewBox="0 -960 960 960"
					><path
						d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Zm200 480h160q33 0 56.5-23.5T640-360v-160H480v80h80v80H400v-240h240q0-33-23.5-56.5T560-680H400q-33 0-56.5 23.5T320-600v240q0 33 23.5 56.5T400-280Z"
					/></svg
				>{/if}
			{#if connectionEffectiveType.toLowerCase().indexOf('2g') > -1}<svg
					xmlns="http://www.w3.org/2000/svg"
					height="24"
					viewBox="0 -960 960 960"
					><path
						d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Zm120 480h320v-80H400v-80h200v-80H400v-80h240v-80H320v400Z"
					/></svg
				>{/if}
			{#if connectionEffectiveType.toLowerCase().indexOf('3g') > -1}
				<svg viewBox="0 -960 960 960"
					><path
						d="M120-120q-33 0-56.5-23.5T40-200v-560q0-33 23.5-56.5T120-840h720q33 0 56.5 23.5T920-760v560q0 33-23.5 56.5T840-120H120Zm0-80h720v-560H120v560Zm0 0v-560 560Zm640-320H640v80h40v80H560v-240h200q0-33-23.5-56.5T680-680H560q-33 0-56.5 23.5T480-600v240q0 33 23.5 56.5T560-280h120q33 0 56.5-23.5T760-360v-160ZM200-280h160q33 0 56.5-23.5T440-360v-60q0-25-17.5-42.5T380-480q25 0 42.5-17.5T440-540v-60q0-33-23.5-56.5T360-680H200v80h160v80H200v80h160v80H200v80Z"
					/></svg
				>{/if}
			{#if connectionEffectiveType.toLowerCase().indexOf('4g') > -1}
				<svg viewBox="0 -960 960 960"
					><path
						d="M120-120q-33 0-56.5-23.5T40-200v-560q0-33 23.5-56.5T120-840h720q33 0 56.5 23.5T920-760v560q0 33-23.5 56.5T840-120H120Zm0-80h720v-560H120v560Zm0 0v-560 560Zm680-320H660v80h60v80H600v-240h200q0-33-23.5-56.5T720-680H600q-33 0-56.5 23.5T520-600v240q0 33 23.5 56.5T600-280h120q33 0 56.5-23.5T800-360v-160ZM320-280h80v-120h80v-80h-80v-200h-80v200h-80v-200h-80v280h160v120Z"
					/></svg
				>{/if}
			{#if connectionEffectiveType.toLowerCase().indexOf('5g') > -1}
				<svg viewBox="0 -960 960 960"
					><path
						d="M120-120q-33 0-56.5-23.5T40-200v-560q0-33 23.5-56.5T120-840h720q33 0 56.5 23.5T920-760v560q0 33-23.5 56.5T840-120H120Zm0-80h720v-560H120v560Zm0 0v-560 560Zm640-320H640v80h40v80H560v-240h200q0-33-23.5-56.5T680-680H560q-33 0-56.5 23.5T480-600v240q0 33 23.5 56.5T560-280h120q33 0 56.5-23.5T760-360v-160ZM200-280h160q33 0 56.5-23.5T440-360v-80q0-33-23.5-56.5T360-520h-80v-80h160v-80H200v240h160v80H200v80Z"
					/></svg
				>{/if}
		</div>
	{/if}

	{#if batteryLevel}
		<div title="Battery status">
			{#if batteryCharging}
				{#if batteryLevel < 30}
					<svg viewBox="0 -960 960 960"
						><path
							d="M660-80v-120H560l140-200v120h100L660-80Zm-340 0q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-80h160v80h80q17 0 28.5 11.5T680-760v280q-21 0-41 3.5T600-466v-254H360v480h80q0 46 16 87t45 73H320Z"
						/></svg
					>
				{:else if batteryLevel >= 30 && batteryLevel < 50}
					<svg viewBox="0 -960 960 960"
						><path
							d="M660-80v-120H560l140-200v120h100L660-80Zm-340 0q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-80h160v80h80q17 0 28.5 11.5T680-760v280q-21 0-41 3.5T600-466v-254H360v400h94q-7 19-10.5 39t-3.5 41q0 46 16 87t45 73H320Z"
						/></svg
					>
				{:else if batteryLevel >= 50 && batteryLevel < 60}
					<svg viewBox="0 -960 960 960"
						><path
							d="M660-80v-120H560l140-200v120h100L660-80Zm-340 0q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-80h160v80h80q17 0 28.5 11.5T680-760v280q-21 0-41 3.5T600-466v-254H360v320h142q-29 32-45.5 72.5T440-240q0 46 16 87t45 73H320Z"
						/></svg
					>{:else if batteryLevel >= 60 && batteryLevel < 80}
					<svg viewBox="0 -960 960 960"
						><path
							d="M320-80q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-80h160v80h80q17 0 28.5 11.5T680-760v280q-100 1-170 70.5T440-240q0 46 16 87t45 73H320Zm40-400h240v-240H360v240ZM660-80v-120H560l140-200v120h100L660-80Z"
						/></svg
					>{:else if batteryLevel >= 80 && batteryLevel < 90}
					<svg viewBox="0 -960 960 960"
						><path
							d="M320-80q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-80h160v80h80q17 0 28.5 11.5T680-760v280q-100 1-170 70.5T440-240q0 46 16 87t45 73H320Zm40-480h240v-160H360v160ZM660-80v-120H560l140-200v120h100L660-80Z"
						/></svg
					>
				{:else if batteryLevel >= 90 && batteryLevel < 100}
					<svg viewBox="0 -960 960 960"
						><path
							d="M320-80q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-80h160v80h80q17 0 28.5 11.5T680-760v280q-100 1-170 70.5T440-240q0 46 16 87t45 73H320Zm40-560h240v-80H360v80ZM660-80v-120H560l140-200v120h100L660-80Z"
						/></svg
					>
				{:else if batteryLevel == 100}
					<svg viewBox="0 -960 960 960"
						><path
							d="M660-80v-120H560l140-200v120h100L660-80Zm-300-80Zm-40 80q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-80h160v80h80q17 0 28.5 11.5T680-760v280q-21 0-41 3.5T600-466v-254H360v560h94q8 23 19.5 43T501-80H320Z"
						/></svg
					>
				{:else}
					<svg viewBox="0 -960 960 960"
						><path
							d="M660-80v-120H560l140-200v120h100L660-80Zm-300-80Zm-40 80q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-80h160v80h80q17 0 28.5 11.5T680-760v280q-21 0-41 3.5T600-466v-254H360v560h94q8 23 19.5 43T501-80H320Z"
						/></svg
					>
				{/if}
				{batteryLevel}% AC
			{:else}
				{#if batteryLevel <= 10}
					<svg viewBox="0 -960 960 960"
						><path
							d="M200-280q-17 0-28.5-11.5T160-320v-80H80v-160h80v-80q0-17 11.5-28.5T200-680h640q17 0 28.5 11.5T880-640v320q0 17-11.5 28.5T840-280H200Zm40-80h520v-240H240v240Z"
						/></svg
					>
				{:else if batteryLevel > 10 && batteryLevel < 50}
					<svg viewBox="0 -960 960 960"
						><path
							d="M200-280q-17 0-28.5-11.5T160-320v-80H80v-160h80v-80q0-17 11.5-28.5T200-680h640q17 0 28.5 11.5T880-640v320q0 17-11.5 28.5T840-280H200Zm40-80h440v-240H240v240Z"
						/></svg
					>{:else if batteryLevel >= 50 && batteryLevel <= 75}
					<svg viewBox="0 -960 960 960"
						><path
							d="M200-280q-17 0-28.5-11.5T160-320v-80H80v-160h80v-80q0-17 11.5-28.5T200-680h640q17 0 28.5 11.5T880-640v320q0 17-11.5 28.5T840-280H200Zm40-80h280v-240H240v240Z"
						/></svg
					>
				{:else if batteryLevel > 75 && batteryLevel < 100}
					<svg viewBox="0 -960 960 960"
						><path
							d="M200-280q-17 0-28.5-11.5T160-320v-80H80v-160h80v-80q0-17 11.5-28.5T200-680h640q17 0 28.5 11.5T880-640v320q0 17-11.5 28.5T840-280H200Zm40-80h160v-240H240v240Z"
						/></svg
					>
				{:else if batteryLevel == 100}
					<svg viewBox="0 -960 960 960"
						><path
							d="M200-280q-17 0-28.5-11.5T160-320v-80H80v-160h80v-80q0-17 11.5-28.5T200-680h640q17 0 28.5 11.5T880-640v320q0 17-11.5 28.5T840-280H200Z"
						/></svg
					>
				{:else}
					<svg viewBox="0 -960 960 960"
						><path
							d="M656-182q0-14 .5-27.5T664-235q10-17 25.5-29t26.5-28q3-4 7-23 0-17-13-28t-30-11q-17 0-30 11t-18 28l-44-19q10-30 35-48t57-18q37 0 64.5 24t27.5 60q0 11-3 20.5t-9 17.5q-11 16-26 28.5T710-220q-6 11-6 38h-48Zm24 102q-14 0-24-9.5T646-113q0-14 10-24t24-10q14 0 23.5 10t9.5 24q0 14-9.5 23.5T680-80Zm-320-80Zm-40 80q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-80h160v80h80q17 0 28.5 11.5T680-760v280q-21 0-41 3.5T600-466v-254H360v560h94q8 23 19.5 43T501-80H320Z"
						/></svg
					>
				{/if}
				{batteryLevel}% DC
			{/if}
		</div>
	{/if}

	{#if environment.os}
		<div title="Operation system">
			{#if environment.os.toLowerCase().indexOf('windows') > -1}
				<svg viewBox="0 0 448 512"
					><path
						d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z"
					/></svg
				>
			{:else if environment.os.toLowerCase().indexOf('linux') > -1}
				<svg viewBox="0 0 448 512"
					><path
						d="M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0 132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4 0 3.9.6 7.9 1.2 11.8 1.2 8.1 2.5 15.7.8 20.8-5.2 14.4-5.9 24.4-2.2 31.7 3.8 7.3 11.4 10.5 20.1 12.3 17.3 3.6 40.8 2.7 59.3 12.5 19.8 10.4 39.9 14.1 55.9 10.4 11.6-2.6 21.1-9.6 25.9-20.2 12.5-.1 26.3-5.4 48.3-6.6 14.9-1.2 33.6 5.3 55.1 4.1.6 2.3 1.4 4.6 2.5 6.7v.1c8.3 16.7 23.8 24.3 40.3 23 16.6-1.3 34.1-11 48.3-27.9 13.6-16.4 36-23.2 50.9-32.2 7.4-4.5 13.4-10.1 13.9-18.3.4-8.2-4.4-17.3-15.5-29.7zM223.7 87.3c9.8-22.2 34.2-21.8 44-.4 6.5 14.2 3.6 30.9-4.3 40.4-1.6-.8-5.9-2.6-12.6-4.9 1.1-1.2 3.1-2.7 3.9-4.6 4.8-11.8-.2-27-9.1-27.3-7.3-.5-13.9 10.8-11.8 23-4.1-2-9.4-3.5-13-4.4-1-6.9-.3-14.6 2.9-21.8zM183 75.8c10.1 0 20.8 14.2 19.1 33.5-3.5 1-7.1 2.5-10.2 4.6 1.2-8.9-3.3-20.1-9.6-19.6-8.4.7-9.8 21.2-1.8 28.1 1 .8 1.9-.2-5.9 5.5-15.6-14.6-10.5-52.1 8.4-52.1zm-13.6 60.7c6.2-4.6 13.6-10 14.1-10.5 4.7-4.4 13.5-14.2 27.9-14.2 7.1 0 15.6 2.3 25.9 8.9 6.3 4.1 11.3 4.4 22.6 9.3 8.4 3.5 13.7 9.7 10.5 18.2-2.6 7.1-11 14.4-22.7 18.1-11.1 3.6-19.8 16-38.2 14.9-3.9-.2-7-1-9.6-2.1-8-3.5-12.2-10.4-20-15-8.6-4.8-13.2-10.4-14.7-15.3-1.4-4.9 0-9 4.2-12.3zm3.3 334c-2.7 35.1-43.9 34.4-75.3 18-29.9-15.8-68.6-6.5-76.5-21.9-2.4-4.7-2.4-12.7 2.6-26.4v-.2c2.4-7.6.6-16-.6-23.9-1.2-7.8-1.8-15 .9-20 3.5-6.7 8.5-9.1 14.8-11.3 10.3-3.7 11.8-3.4 19.6-9.9 5.5-5.7 9.5-12.9 14.3-18 5.1-5.5 10-8.1 17.7-6.9 8.1 1.2 15.1 6.8 21.9 16l19.6 35.6c9.5 19.9 43.1 48.4 41 68.9zm-1.4-25.9c-4.1-6.6-9.6-13.6-14.4-19.6 7.1 0 14.2-2.2 16.7-8.9 2.3-6.2 0-14.9-7.4-24.9-13.5-18.2-38.3-32.5-38.3-32.5-13.5-8.4-21.1-18.7-24.6-29.9s-3-23.3-.3-35.2c5.2-22.9 18.6-45.2 27.2-59.2 2.3-1.7.8 3.2-8.7 20.8-8.5 16.1-24.4 53.3-2.6 82.4.6-20.7 5.5-41.8 13.8-61.5 12-27.4 37.3-74.9 39.3-112.7 1.1.8 4.6 3.2 6.2 4.1 4.6 2.7 8.1 6.7 12.6 10.3 12.4 10 28.5 9.2 42.4 1.2 6.2-3.5 11.2-7.5 15.9-9 9.9-3.1 17.8-8.6 22.3-15 7.7 30.4 25.7 74.3 37.2 95.7 6.1 11.4 18.3 35.5 23.6 64.6 3.3-.1 7 .4 10.9 1.4 13.8-35.7-11.7-74.2-23.3-84.9-4.7-4.6-4.9-6.6-2.6-6.5 12.6 11.2 29.2 33.7 35.2 59 2.8 11.6 3.3 23.7.4 35.7 16.4 6.8 35.9 17.9 30.7 34.8-2.2-.1-3.2 0-4.2 0 3.2-10.1-3.9-17.6-22.8-26.1-19.6-8.6-36-8.6-38.3 12.5-12.1 4.2-18.3 14.7-21.4 27.3-2.8 11.2-3.6 24.7-4.4 39.9-.5 7.7-3.6 18-6.8 29-32.1 22.9-76.7 32.9-114.3 7.2zm257.4-11.5c-.9 16.8-41.2 19.9-63.2 46.5-13.2 15.7-29.4 24.4-43.6 25.5s-26.5-4.8-33.7-19.3c-4.7-11.1-2.4-23.1 1.1-36.3 3.7-14.2 9.2-28.8 9.9-40.6.8-15.2 1.7-28.5 4.2-38.7 2.6-10.3 6.6-17.2 13.7-21.1.3-.2.7-.3 1-.5.8 13.2 7.3 26.6 18.8 29.5 12.6 3.3 30.7-7.5 38.4-16.3 9-.3 15.7-.9 22.6 5.1 9.9 8.5 7.1 30.3 17.1 41.6 10.6 11.6 14 19.5 13.7 24.6zM173.3 148.7c2 1.9 4.7 4.5 8 7.1 6.6 5.2 15.8 10.6 27.3 10.6 11.6 0 22.5-5.9 31.8-10.8 4.9-2.6 10.9-7 14.8-10.4s5.9-6.3 3.1-6.6-2.6 2.6-6 5.1c-4.4 3.2-9.7 7.4-13.9 9.8-7.4 4.2-19.5 10.2-29.9 10.2s-18.7-4.8-24.9-9.7c-3.1-2.5-5.7-5-7.7-6.9-1.5-1.4-1.9-4.6-4.3-4.9-1.4-.1-1.8 3.7 1.7 6.5z"
					/></svg
				>
			{:else if environment.os.toLowerCase().indexOf('cros') > -1}
				<svg viewBox="0 0 512 512"
					><path
						d="M0 256C0 209.4 12.47 165.6 34.27 127.1L144.1 318.3C166 357.5 207.9 384 256 384C270.3 384 283.1 381.7 296.8 377.4L220.5 509.6C95.9 492.3 0 385.3 0 256zM365.1 321.6C377.4 302.4 384 279.1 384 256C384 217.8 367.2 183.5 340.7 160H493.4C505.4 189.6 512 222.1 512 256C512 397.4 397.4 511.1 256 512L365.1 321.6zM477.8 128H256C193.1 128 142.3 172.1 130.5 230.7L54.19 98.47C101 38.53 174 0 256 0C350.8 0 433.5 51.48 477.8 128V128zM168 256C168 207.4 207.4 168 256 168C304.6 168 344 207.4 344 256C344 304.6 304.6 344 256 344C207.4 344 168 304.6 168 256z"
					/></svg
				>
			{:else if environment.os.toLowerCase().indexOf('android') > -1}
				<svg viewBox="0 0 576 512"
					><path
						d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.27-10h0l-48.54,84.07a301.25,301.25,0,0,0-246.56,0L116.18,64.45a10,10,0,1,0-17.27,10h0l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55"
					/></svg
				>
			{:else if environment.os.toLowerCase().indexOf('mac os') > -1 || environment.os
					.toLowerCase()
					.indexOf('iphone os') > -1 || environment.os.toLowerCase().indexOf('ios') > -1}
				<svg viewBox="0 0 384 512"
					><path
						d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
					/></svg
				>
			{/if}
			{environment.os}
			{environment.osVersion}
		</div>
	{/if}

	{#if environment.webbrowser}
		<div title="Browser version">
			{#if environment.webbrowser.toLowerCase().indexOf('chrome') > -1 || environment.webbrowser
					.toLowerCase()
					.indexOf('chromium') > -1}
				<svg viewBox="0 0 512 512"
					><path
						d="M0 256C0 209.4 12.47 165.6 34.27 127.1L144.1 318.3C166 357.5 207.9 384 256 384C270.3 384 283.1 381.7 296.8 377.4L220.5 509.6C95.9 492.3 0 385.3 0 256zM365.1 321.6C377.4 302.4 384 279.1 384 256C384 217.8 367.2 183.5 340.7 160H493.4C505.4 189.6 512 222.1 512 256C512 397.4 397.4 511.1 256 512L365.1 321.6zM477.8 128H256C193.1 128 142.3 172.1 130.5 230.7L54.19 98.47C101 38.53 174 0 256 0C350.8 0 433.5 51.48 477.8 128V128zM168 256C168 207.4 207.4 168 256 168C304.6 168 344 207.4 344 256C344 304.6 304.6 344 256 344C207.4 344 168 304.6 168 256z"
					/></svg
				>
			{:else if environment.webbrowser.toLowerCase().indexOf('firefox') > -1}
				<svg viewBox="0 0 512 512"
					><path
						d="M130.22 127.548C130.38 127.558 130.3 127.558 130.22 127.548V127.548ZM481.64 172.898C471.03 147.398 449.56 119.898 432.7 111.168C446.42 138.058 454.37 165.048 457.4 185.168C457.405 185.306 457.422 185.443 457.45 185.578C429.87 116.828 383.098 89.1089 344.9 28.7479C329.908 5.05792 333.976 3.51792 331.82 4.08792L331.7 4.15792C284.99 30.1109 256.365 82.5289 249.12 126.898C232.503 127.771 216.219 131.895 201.19 139.035C199.838 139.649 198.736 140.706 198.066 142.031C197.396 143.356 197.199 144.87 197.506 146.323C197.7 147.162 198.068 147.951 198.586 148.639C199.103 149.327 199.76 149.899 200.512 150.318C201.264 150.737 202.096 150.993 202.954 151.071C203.811 151.148 204.676 151.045 205.491 150.768L206.011 150.558C221.511 143.255 238.408 139.393 255.541 139.238C318.369 138.669 352.698 183.262 363.161 201.528C350.161 192.378 326.811 183.338 304.341 187.248C392.081 231.108 368.541 381.784 246.951 376.448C187.487 373.838 149.881 325.467 146.421 285.648C146.421 285.648 157.671 243.698 227.041 243.698C234.541 243.698 255.971 222.778 256.371 216.698C256.281 214.698 213.836 197.822 197.281 181.518C188.434 172.805 184.229 168.611 180.511 165.458C178.499 163.75 176.392 162.158 174.201 160.688C168.638 141.231 168.399 120.638 173.51 101.058C148.45 112.468 128.96 130.508 114.8 146.428H114.68C105.01 134.178 105.68 93.7779 106.25 85.3479C106.13 84.8179 99.022 89.0159 98.1 89.6579C89.5342 95.7103 81.5528 102.55 74.26 110.088C57.969 126.688 30.128 160.242 18.76 211.318C14.224 231.701 12 255.739 12 263.618C12 398.318 121.21 507.508 255.92 507.508C376.56 507.508 478.939 420.281 496.35 304.888C507.922 228.192 481.64 173.82 481.64 172.898Z"
					/></svg
				>
			{:else if environment.webbrowser.toLowerCase().indexOf('opera') > -1}
				<svg viewBox="0 0 496 512"
					><path
						d="M313.9 32.7c-170.2 0-252.6 223.8-147.5 355.1 36.5 45.4 88.6 75.6 147.5 75.6 36.3 0 70.3-11.1 99.4-30.4-43.8 39.2-101.9 63-165.3 63-3.9 0-8 0-11.9-.3C104.6 489.6 0 381.1 0 248 0 111 111 0 248 0h.8c63.1.3 120.7 24.1 164.4 63.1-29-19.4-63.1-30.4-99.3-30.4zm101.8 397.7c-40.9 24.7-90.7 23.6-132-5.8 56.2-20.5 97.7-91.6 97.7-176.6 0-84.7-41.2-155.8-97.4-176.6 41.8-29.2 91.2-30.3 132.9-5 105.9 98.7 105.5 265.7-1.2 364z"
					/></svg
				>
			{:else if environment.webbrowser.toLowerCase().indexOf('safari') > -1}
				<svg viewBox="0 0 512 512"
					><path
						d="M274.69,274.69l-37.38-37.38L166,346ZM256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8ZM411.85,182.79l14.78-6.13A8,8,0,0,1,437.08,181h0a8,8,0,0,1-4.33,10.46L418,197.57a8,8,0,0,1-10.45-4.33h0A8,8,0,0,1,411.85,182.79ZM314.43,94l6.12-14.78A8,8,0,0,1,331,74.92h0a8,8,0,0,1,4.33,10.45l-6.13,14.78a8,8,0,0,1-10.45,4.33h0A8,8,0,0,1,314.43,94ZM256,60h0a8,8,0,0,1,8,8V84a8,8,0,0,1-8,8h0a8,8,0,0,1-8-8V68A8,8,0,0,1,256,60ZM181,74.92a8,8,0,0,1,10.46,4.33L197.57,94a8,8,0,1,1-14.78,6.12l-6.13-14.78A8,8,0,0,1,181,74.92Zm-63.58,42.49h0a8,8,0,0,1,11.31,0L140,128.72A8,8,0,0,1,140,140h0a8,8,0,0,1-11.31,0l-11.31-11.31A8,8,0,0,1,117.41,117.41ZM60,256h0a8,8,0,0,1,8-8H84a8,8,0,0,1,8,8h0a8,8,0,0,1-8,8H68A8,8,0,0,1,60,256Zm40.15,73.21-14.78,6.13A8,8,0,0,1,74.92,331h0a8,8,0,0,1,4.33-10.46L94,314.43a8,8,0,0,1,10.45,4.33h0A8,8,0,0,1,100.15,329.21Zm4.33-136h0A8,8,0,0,1,94,197.57l-14.78-6.12A8,8,0,0,1,74.92,181h0a8,8,0,0,1,10.45-4.33l14.78,6.13A8,8,0,0,1,104.48,193.24ZM197.57,418l-6.12,14.78a8,8,0,0,1-14.79-6.12l6.13-14.78A8,8,0,1,1,197.57,418ZM264,444a8,8,0,0,1-8,8h0a8,8,0,0,1-8-8V428a8,8,0,0,1,8-8h0a8,8,0,0,1,8,8Zm67-6.92h0a8,8,0,0,1-10.46-4.33L314.43,418a8,8,0,0,1,4.33-10.45h0a8,8,0,0,1,10.45,4.33l6.13,14.78A8,8,0,0,1,331,437.08Zm63.58-42.49h0a8,8,0,0,1-11.31,0L372,383.28A8,8,0,0,1,372,372h0a8,8,0,0,1,11.31,0l11.31,11.31A8,8,0,0,1,394.59,394.59ZM286.25,286.25,110.34,401.66,225.75,225.75,401.66,110.34ZM437.08,331h0a8,8,0,0,1-10.45,4.33l-14.78-6.13a8,8,0,0,1-4.33-10.45h0A8,8,0,0,1,418,314.43l14.78,6.12A8,8,0,0,1,437.08,331ZM444,264H428a8,8,0,0,1-8-8h0a8,8,0,0,1,8-8h16a8,8,0,0,1,8,8h0A8,8,0,0,1,444,264Z"
					/></svg
				>
			{:else if environment.webbrowser.toLowerCase().indexOf('edge') > -1}
				<svg viewBox="0 0 512 512"
					><path
						d="M120.1 37.44C161.1 12.23 207.7-.7753 255 .0016C423 .0016 512 123.8 512 219.5C511.9 252.2 499 283.4 476.1 306.7C453.2 329.9 422.1 343.2 389.4 343.7C314.2 343.7 297.9 320.6 297.9 311.7C297.9 307.9 299.1 305.5 302.7 302.3L303.7 301.1L304.1 299.5C314.6 288 320 273.3 320 257.9C320 179.2 237.8 115.2 136 115.2C98.46 114.9 61.46 124.1 28.48 142.1C55.48 84.58 111.2 44.5 119.8 38.28C120.6 37.73 120.1 37.44 120.1 37.44V37.44zM135.7 355.5C134.3 385.5 140.3 415.5 152.1 442.7C165.7 469.1 184.8 493.7 208.6 512C149.1 500.5 97.11 468.1 59.2 422.7C21.12 376.3 0 318.4 0 257.9C0 206.7 62.4 163.5 136 163.5C172.6 162.9 208.4 174.4 237.8 196.2L234.2 197.4C182.7 215 135.7 288.1 135.7 355.5V355.5zM469.8 400L469.1 400.1C457.3 418.9 443.2 435.2 426.9 449.6C396.1 477.6 358.8 495.1 318.1 499.5C299.5 499.8 281.3 496.3 264.3 488.1C238.7 477.8 217.2 458.1 202.7 435.1C188.3 411.2 181.6 383.4 183.7 355.5C183.1 335.4 189.1 315.2 198.7 297.3C212.6 330.4 236.2 358.6 266.3 378.1C296.4 397.6 331.8 407.6 367.7 406.7C398.7 407 429.8 400 457.9 386.2L459.8 385.3C463.7 383 467.5 381.4 471.4 385.3C475.9 390.2 473.2 394.5 470.2 399.3C470 399.5 469.9 399.8 469.8 400V400z"
					/></svg
				>
			{:else if environment.webbrowser.toLowerCase().indexOf('ie') > -1}
				<svg viewBox="0 0 512 512"
					><path
						d="M483.049 159.706c10.855-24.575 21.424-60.438 21.424-87.871 0-72.722-79.641-98.371-209.673-38.577-107.632-7.181-211.221 73.67-237.098 186.457 30.852-34.862 78.271-82.298 121.977-101.158C125.404 166.85 79.128 228.002 43.992 291.725 23.246 329.651 0 390.94 0 436.747c0 98.575 92.854 86.5 180.251 42.006 31.423 15.43 66.559 15.573 101.695 15.573 97.124 0 184.249-54.294 216.814-146.022H377.927c-52.509 88.593-196.819 52.996-196.819-47.436H509.9c6.407-43.581-1.655-95.715-26.851-141.162zM64.559 346.877c17.711 51.15 53.703 95.871 100.266 123.304-88.741 48.94-173.267 29.096-100.266-123.304zm115.977-108.873c2-55.151 50.276-94.871 103.98-94.871 53.418 0 101.981 39.72 103.981 94.871H180.536zm184.536-187.6c21.425-10.287 48.563-22.003 72.558-22.003 31.422 0 54.274 21.717 54.274 53.722 0 20.003-7.427 49.007-14.569 67.867-26.28-42.292-65.986-81.584-112.263-99.586z"
					/></svg
				>
			{/if}
			{environment.webbrowser}
			<a href="https://developer.chrome.com/blog/user-agent-reduction-android-model-and-version/"
				>{environment.browserVersion}</a
			>
		</div>
		<div
			class="cap"
			title="Check if cross origin isolated via Cross Origin Opener Policy and Cross Origin Embedder Policy to enable SharedArrayBuffer for multiple threads testsing"
		>
			{#if crossOriginIsolated}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
					><path
						d="M420-340h120v-100h100v-120H540v-100H420v100H320v120h100v100Zm60 260q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z"
					/></svg
				>
				Cross Origin Isolated
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
					><path
						d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z"
					/></svg
				>
				Cross Origin Not Isolated
			{/if}
		</div>
	{/if}
</div>

<style>
	.environment .loader {
		display: inline-flex;
		align-items: center;
		justify-content: left;
		margin-left: -2px;
	}

	.loader_el {
		border-radius: 100%;
		border: 1px solid var(--font);
		margin: calc(1px * 2);
	}

	.loader_el:nth-child(1) {
		animation: preloader 0.6s ease-in-out alternate infinite;
	}
	.loader_el:nth-child(2) {
		animation: preloader 0.6s ease-in-out alternate 0.2s infinite;
	}

	.loader_el:nth-child(3) {
		animation: preloader 0.6s ease-in-out alternate 0.4s infinite;
	}

	@keyframes preloader {
		100% {
			transform: scale(2);
		}
	}

	.environment .info {
		margin: 10px 0 20px 0;
		display: block;
		text-align: left;
	}

	.environment .updatecpu {
		color: var(--b1);
		display: inline-block;
		background-color: var(--b1-005);
		font-size: 1.2em;
		padding: 6px 20px;
		border-radius: 9999px;
		text-transform: uppercase;
	}

	.environment .updateCPULink {
		border: 0px;
		background: transparent;
		color: var(--font);
		font-family: 'JetBrains Mono', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		margin: 0;
		padding: 0;
		cursor: pointer;
		font-size: 12px;
		text-underline-offset: 6px;
		text-decoration-thickness: 2px;
		text-decoration-style: wavy;
		border-bottom: dashed 1px var(--b1-01);
	}

	.environment .updateCPULink:hover {
		border-bottom: solid 1px var(--b1);
		color: var(--b1);
	}

	.serious,
	.critical {
		padding: 6px 8px;
		border-radius: 0px;
		position: absolute;
		top: 0px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1;
		box-shadow:
			rgba(198, 26, 62, 0.05) 0px 10px 20px -12px,
			rgba(198, 26, 62, 0.1) 0px 18px 16px -18px;
	}

	.serious a,
	.critical a {
		color: white !important;
	}

	.serious svg path,
	.critical svg path {
		fill: white !important;
	}

	.serious {
		color: white !important;
		background-color: var(--orange);
	}

	.critical {
		color: white !important;
		background-color: var(--red);
	}

	.environment div {
		display: inline-block;
		margin: 0 6px;
	}

	.environment svg path {
		fill: var(--font);
	}

	.cap {
		text-transform: capitalize;
	}
</style>
