<script>
	import {
		testQueueStore,
		testQueueLengthStore,
		backendsStore,
		modelDownloadProgressStore
	} from '$lib/store/store';
	import {
		getModelNameById,
		getModelDescriptionById,
		getModelHFUrlById,
		copyResults,
		copyRawInference,
		downloadScreenshot
	} from '$lib/assets/js/utils';
	import { resultsStore } from '$lib/store/store';
	import ArrowOutward from './svg/ArrowOutward.svelte';
	// import Info from './Info.svelte';
	import FileCopy from './svg/FileCopy.svelte';
	import Fail from './svg/Fail.svelte';
	import Queue from './svg/Queue.svelte';
	import Testing from './svg/Testing.svelte';
	import Onnx from './svg/Onnx.svelte';
	import Tflite from './svg/Tflite.svelte';
	import Npy from './svg/Npy.svelte';
	import Pt from './svg/Pt.svelte';
	import Screenshot from './svg/Screenshot.svelte';
	import SortAscending from './svg/SortAscending.svelte';
	import SortDescending from './svg/SortDescending.svelte';

	/**
	 * @type {string[]}
	 */
	let selectedBackends;
	backendsStore.subscribe((value) => {
		selectedBackends = value;
	});

	/**
	 * @type {string[]}
	 */
	let results;
	resultsStore.subscribe((value) => {
		results = value;
	});

	/**
	 * @type {string[]}
	 */
	let testQueue;
	testQueueStore.subscribe((value) => {
		testQueue = value;
	});

	/**
	 * @type {number}
	 */
	let testQueueLength;

	testQueueLengthStore.subscribe((value) => {
		testQueueLength = value;
	});

	/**
	 * @type {string[]}
	 */
	let progress;
	modelDownloadProgressStore.subscribe((value) => {
		progress = value;
	});

	$: percentageTestQueue = (
		((testQueueLength - testQueue.length) * 100) /
		(testQueueLength * 1.0)
	).toFixed(2);

	$: getProgress = (model) => {
		let p = progress.find((item) => item.name === model);
		if (p) {
			return p.progress;
		} else {
			return 0;
		}
	};

	$: getLoaded = (model) => {
		let p = progress.find((item) => item.name === model);
		if (p) {
			return p.current;
		} else {
			return 0;
		}
	};

	/**
	 * @type {boolean}
	 */
	let sortId,
		/**
		 * @type {boolean}
		 */
		sortDataType,
		/**
		 * @type {boolean}
		 */
		sortModelType,
		/**
		 * @type {boolean}
		 */
		sortModelSize,
		/**
		 * @type {boolean}
		 */
		sortWasm1,
		/**
		 * @type {boolean}
		 */
		sortWasm4,
		/**
		 * @type {boolean}
		 */
		sortWebnnCpu1,
		/**
		 * @type {boolean}
		 */
		sortWebnnCpu4,
		/**
		 * @type {boolean}
		 */
		sortWebGl,
		/**
		 * @type {boolean}
		 */
		sortWebGpu,
		/**
		 * @type {boolean}
		 */
		sortWebnnGpu,
		/**
		 * @type {boolean}
		 */
		sortWebnnNpu = true;

	$: sortResult = (/** @type {string} */ value) => {
		if (value === 'id') {
			sortId = !sortId;
		} else if (value === 'datatype') {
			sortDataType = !sortDataType;
		} else if (value === 'modeltype') {
			sortModelType = !sortModelType;
		} else if (value === 'modelsize') {
			sortModelSize = !sortModelSize;
		} else if (value === 'wasm_1') {
			sortWasm1 = !sortWasm1;
		} else if (value === 'wasm_4') {
			sortWasm4 = !sortWasm4;
		} else if (value === 'webnn_cpu_1') {
			sortWebnnCpu1 = !sortWebnnCpu1;
		} else if (value === 'webnn_cpu_4') {
			sortWebnnCpu4 = !sortWebnnCpu4;
		} else if (value === 'webgl') {
			sortWebGl = !sortWebGl;
		} else if (value === 'webgpu') {
			sortWebGpu = !sortWebGpu;
		} else if (value === 'webnn_gpu') {
			sortWebnnGpu = !sortWebnnGpu;
		} else if (value === 'webnn_npu') {
			sortWebnnNpu = !sortWebnnNpu;
		}

		results = results.sort((a, b) => {
			let modelA, modelB;
			if (value === 'id') {
				modelA = a.model.toLowerCase();
				modelB = b.model.toLowerCase();
			} else if (value === 'datatype') {
				modelA = a.datatype.toLowerCase();
				modelB = b.datatype.toLowerCase();
			} else if (value === 'modeltype') {
				modelA = a.modeltype.toLowerCase();
				modelB = b.modeltype.toLowerCase();
			} else if (value === 'modelsize') {
				modelA = a.modelsize.toLowerCase();
				modelB = b.modelsize.toLowerCase();
			} else if (value === 'wasm_1') {
				modelA = a.wasm_1.inferencemedian;
				modelB = b.wasm_1.inferencemedian;
			} else if (value === 'wasm_4') {
				modelA = a.wasm_4.inferencemedian;
				modelB = b.wasm_4.inferencemedian;
			} else if (value === 'webnn_cpu_1') {
				modelA = a.webnn_cpu_1.inferencemedian;
				modelB = b.webnn_cpu_1.inferencemedian;
			} else if (value === 'webnn_cpu_4') {
				modelA = a.webnn_cpu_4.inferencemedian;
				modelB = b.webnn_cpu_4.inferencemedian;
			} else if (value === 'webgl') {
				modelA = a.webgl.inferencemedian;
				modelB = b.webgl.inferencemedian;
			} else if (value === 'webgpu') {
				modelA = a.webgpu.inferencemedian;
				modelB = b.webgpu.inferencemedian;
			} else if (value === 'webnn_gpu') {
				modelA = a.webnn_gpu.inferencemedian;
				modelB = b.webnn_gpu.inferencemedian;
			} else if (value === 'webnn_npu') {
				modelA = a.webnn_npu.inferencemedian;
				modelB = b.webnn_npu.inferencemedian;
			}

			if (modelA < modelB) {
				if (value === 'id') {
					return sortId ? -1 : 1;
				} else if (value === 'datatype') {
					return sortDataType ? -1 : 1;
				} else if (value === 'modeltype') {
					return sortModelType ? -1 : 1;
				} else if (value === 'modelsize') {
					return sortModelSize ? -1 : 1;
				} else if (value === 'wasm_1') {
					return sortWasm1 ? -1 : 1;
				} else if (value === 'wasm_4') {
					return sortWasm4 ? -1 : 1;
				} else if (value === 'webnn_cpu_1') {
					return sortWebnnCpu1 ? -1 : 1;
				} else if (value === 'webnn_cpu_4') {
					return sortWebnnCpu4 ? -1 : 1;
				} else if (value === 'webgl') {
					return sortWebGl ? -1 : 1;
				} else if (value === 'webgpu') {
					return sortWebGpu ? -1 : 1;
				} else if (value === 'webnn_gpu') {
					return sortWebnnGpu ? -1 : 1;
				} else if (value === 'webnn_npu') {
					return sortWebnnNpu ? -1 : 1;
				}
			} else if (modelA > modelB) {
				if (value === 'id') {
					return sortId ? 1 : -1;
				} else if (value === 'datatype') {
					return sortDataType ? 1 : -1;
				} else if (value === 'modeltype') {
					return sortModelType ? 1 : -1;
				} else if (value === 'modelsize') {
					return sortModelSize ? 1 : -1;
				} else if (value === 'wasm_1') {
					return sortWasm1 ? 1 : -1;
				} else if (value === 'wasm_4') {
					return sortWasm4 ? 1 : -1;
				} else if (value === 'webnn_cpu_1') {
					return sortWebnnCpu1 ? 1 : -1;
				} else if (value === 'webnn_cpu_4') {
					return sortWebnnCpu4 ? 1 : -1;
				} else if (value === 'webgl') {
					return sortWebGl ? 1 : -1;
				} else if (value === 'webgpu') {
					return sortWebGpu ? 1 : -1;
				} else if (value === 'webnn_gpu') {
					return sortWebnnGpu ? 1 : -1;
				} else if (value === 'webnn_npu') {
					return sortWebnnNpu ? 1 : -1;
				}
			} else {
				return 0;
			}
		});
	};

	/**
	 * @type {any}
	 */
	let resultOptions = {
		compilation: false,
		first: false,
		tofirst: false,
		average: true,
		median: false,
		throughput: false,
		ninety: false,
		best: false
	};

	const toggleIndex = (/** @type {string} */ id) => {
		resultOptions[id] = !resultOptions[id];
		if (
			resultOptions.compilation === false &&
			resultOptions.first === false &&
			resultOptions.tofirst === false &&
			resultOptions.average === false &&
			resultOptions.median === false &&
			resultOptions.throughput === false &&
			resultOptions.ninety === false &&
			resultOptions.best === false
		) {
			resultOptions.average = true;
		}
	};
</script>

<!-- <Info /> -->

<div id="result">
	{#if results.length > 0}
		<div class="rqtitle">
			<div class="title rq mt">Performance (ms)</div>
		</div>
		<div class="figure">
			<span
				class="compilation {resultOptions.compilation}"
				role="button"
				tabindex="0"
				on:keydown={() => {}}
				on:click={() => toggleIndex('compilation')}>Compilation</span
			>
			<span
				class="first {resultOptions.first}"
				role="button"
				tabindex="0"
				on:keydown={() => {}}
				on:click={() => toggleIndex('first')}>First Inference</span
			>
			<span
				title="Compile time + 1st inference time"
				class="tofirst {resultOptions.tofirst}"
				role="button"
				tabindex="0"
				on:keydown={() => {}}
				on:click={() => toggleIndex('tofirst')}>Time to First Inference</span
			>
			<span
				class="average {resultOptions.average}"
				role="button"
				tabindex="0"
				on:keydown={() => {}}
				on:click={() => toggleIndex('average')}>Average Inference</span
			>
			<span
				class="median {resultOptions.median}"
				title="50th Percentile"
				role="button"
				tabindex="0"
				on:keydown={() => {}}
				on:click={() => toggleIndex('median')}>Median Inference</span
			>
			<span
				class="ninety {resultOptions.ninety}"
				role="button"
				tabindex="0"
				on:keydown={() => {}}
				on:click={() => toggleIndex('ninety')}>90th Percentile Inference</span
			>
			<span
				class="best {resultOptions.best}"
				role="button"
				tabindex="0"
				on:keydown={() => {}}
				on:click={() => toggleIndex('best')}>Best Inference</span
			>
			<span
				class="throughput {resultOptions.throughput}"
				role="button"
				tabindex="0"
				on:keydown={() => {}}
				on:click={() => toggleIndex('throughput')}>Throughput</span
			>
		</div>
		<div class="result">
			<div class="q title _{selectedBackends.length}">
				<div class="m" title="Model Name">
					Model <button on:click={sortResult('id')} class="btn"
						>{#if !sortId}<SortAscending />{:else}<SortDescending />{/if}</button
					>
				</div>
				<div class="ms" title="Model Size">
					Size <button on:click={sortResult('modelsize')} class="btn"
						>{#if !sortModelSize}<SortAscending />{:else}<SortDescending />{/if}</button
					>
				</div>
				<div class="mt" title="Model Type">
					Type <button on:click={sortResult('modeltype')} class="btn"
						>{#if !sortModelType}<SortAscending />{:else}<SortDescending />{/if}</button
					>
				</div>
				<div class="dt" title="Operand Data Type">
					Data <button on:click={sortResult('datatype')} class="btn"
						>{#if !sortDataType}<SortAscending />{:else}<SortDescending />{/if}</button
					>
				</div>
				{#if results[0].wasm_1 && results[0].wasm_1.status !== 0}<div class="backend cpu">
						<span title="WebAssembly SIMD with 1 Thread on CPU"
							>Wasm 1T <button on:click={sortResult('wasm_1')} class="btn"
								>{#if !sortWasm1}<SortAscending />{:else}<SortDescending />{/if}</button
							></span
						>
					</div>{/if}
				{#if results[0].wasm_4 && results[0].wasm_4.status !== 0}<div class="backend cpu">
						<span title="WebAssembly SIMD with 4 Threads on CPU"
							>Wasm 4T <button on:click={sortResult('wasm_4')} class="btn"
								>{#if !sortWasm4}<SortAscending />{:else}<SortDescending />{/if}</button
							></span
						>
					</div>{/if}
				{#if results[0].webnn_cpu_1 && results[0].webnn_cpu_1.status !== 0}<div class="backend cpu">
						<span title="WebNN CPU with 1 Thread on CPU"
							><span class="hide">Web</span>NN CPU 1T
							<button on:click={sortResult('webnn_cpu_1')} class="btn"
								>{#if !sortWebnnCpu1}<SortAscending />{:else}<SortDescending />{/if}</button
							></span
						>
					</div>{/if}
				{#if results[0].webnn_cpu_4 && results[0].webnn_cpu_4.status !== 0}<div class="backend cpu">
						<span title="WebNN CPU with 4 Threads on CPU"
							><span class="hide">Web</span>NN CPU 4T
							<button on:click={sortResult('webnn_cpu_4')} class="btn"
								>{#if !sortWebnnCpu4}<SortAscending />{:else}<SortDescending />{/if}</button
							></span
						>
					</div>{/if}

				{#if results[0].webgl && results[0].webgl.status !== 0}<div class="backend gpu">
						<span title="WebGL on GPU"
							>WebGL <button on:click={sortResult('webgl')} class="btn"
								>{#if !sortWebGl}<SortAscending />{:else}<SortDescending />{/if}</button
							></span
						>
					</div>{/if}
				{#if results[0].webgpu && results[0].webgpu.status !== 0}<div class="backend gpu">
						<span title="WebGPU on GPU"
							>WebGPU <button on:click={sortResult('webgpu')} class="btn"
								>{#if !sortWebGpu}<SortAscending />{:else}<SortDescending />{/if}</button
							></span
						>
					</div>{/if}
				{#if results[0].webnn_gpu && results[0].webnn_gpu.status !== 0}<div class="backend gpu">
						<span title="WebNN GPU on GPU"
							><span class="hide">Web</span>NN GPU
							<button on:click={sortResult('webnn_gpu')} class="btn"
								>{#if !sortWebnnGpu}<SortAscending />{:else}<SortDescending />{/if}</button
							></span
						>
					</div>{/if}
				{#if results[0].webnn_npu && results[0].webnn_npu.status !== 0}<div class="backend npu">
						<span title="WebNN NPU on NPU"
							><span class="hide">Web</span>NN NPU
							<button on:click={sortResult('webnn_npu')} class="btn"
								>{#if !sortWebnnNpu}<SortAscending />{:else}<SortDescending />{/if}</button
							></span
						>
					</div>{/if}
			</div>

			<!-- style="background: linear-gradient(90deg, var(--green-01) 0%, rgba(255,255,255,1) {getProgress(
							key.model
						)}%);" -->

			{#each Object.entries(results) as [index, key]}
				<div class="q _{selectedBackends.length}">
					<div class="m">
						{#if getProgress(key.model) === '100.0'}
							<span title="{getModelNameById(key.model)} - {getModelDescriptionById(key.model)}"
								>{getModelNameById(key.model)}</span
							>
						{:else}
							{getModelNameById(key.model)}
						{/if}

						<a
							title="Check WebNN support status of {getModelNameById(key.model)}"
							href="https://ibelem.github.io/netron/?url={getModelHFUrlById(key.model)}"
							><ArrowOutward /></a
						>
					</div>

					<div class="ms">
						<!-- {#if getProgress(key.model) === '100.0'}
						<span title="{getModelNameById(key.model)} downloaded" class="download">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="24"
								viewBox="0 -960 960 960"
								width="24"
								><path
									d="M382-320 155-547l57-57 170 170 366-366 57 57-423 423ZM200-160v-80h560v80H200Z"
								/></svg
							>
						</span>
					{:else} -->
						{#if getLoaded(key.model)}
							{#if getProgress(key.model) === '100.0'}
								<span title="{getModelNameById(key.model)} downloaded"
									>{getLoaded(key.model)} MB</span
								>
							{/if}

							{#if getProgress(key.model) !== '100.0'}
								<svg
									class="downloading"
									xmlns="http://www.w3.org/2000/svg"
									height="24"
									viewBox="0 -960 960 960"
									width="24"
									><path
										d="M439-82q-76-8-141.5-42.5t-113.5-88Q136-266 108.5-335T81-481q0-155 102.5-268.5T440-880v80q-121 17-200 107.5T161-481q0 121 79 211.5T439-162v80Zm40-198L278-482l57-57 104 104v-245h80v245l103-103 57 58-200 200Zm40 198v-80q43-6 82.5-23t73.5-43l58 58q-47 37-101 59.5T519-82Zm158-652q-35-26-74.5-43T520-800v-80q59 6 113 28.5T733-792l-56 58Zm112 506-56-57q26-34 42-73.5t22-82.5h82q-8 59-30 113.5T789-228Zm8-293q-6-43-22-82.5T733-677l56-57q38 45 61 99.5T879-521h-82Z"
									/></svg
								>
								<span class="downloadprogress"
									>{getLoaded(key.model)} MB / {getProgress(key.model)}%</span
								>
							{/if}
						{:else}
							{key.modelsize}
						{/if}
					</div>

					{#if key.modeltype === 'onnx'}
						<div class={key.modeltype}>
							<Onnx />
						</div>
					{/if}

					{#if key.modeltype === 'tflite'}
						<div class={key.modeltype}>
							<Tflite />
						</div>
					{/if}

					{#if key.modeltype === 'npy'}
						<div class={key.modeltype}><Npy /></div>
					{/if}

					{#if key.modeltype === 'pt'}
						<div class={key.modeltype}><Pt /></div>
					{/if}

					<div class="{key.datatype} dt">{key.datatype}</div>

					{#if key.wasm_1 && key.wasm_1.status !== 0}
						{#if key.wasm_1.status === 1}
							<div class="status_{key.wasm_1.status} s">
								<Queue />
							</div>
						{/if}

						{#if key.wasm_1.status === 2}
							<div class="status_{key.wasm_1.status} s">
								<Testing />
							</div>
						{/if}

						{#if key.wasm_1.status === 3}
							<div
								class="status_{key.wasm_1.status} s backend"
								title="Compilation Time: {key.wasm_1.compilation.toString()} ms; First Inference Time: {key.wasm_1.warmup.toString()} ms; Time to First Inference: {key.wasm_1.timetofirstinference.toString()} ms; Inference Time (Median): {key
									.wasm_1.inferencemedian} ms; 90th Percentile Inference: {key.wasm_1
									.inferenceninety} ms; Inference Time (Average): {key.wasm_1
									.inferenceaverage} ms; Inference Time (Best): {key.wasm_1
									.inferencebest} ms; Throughput: {key.wasm_1.inferencethroughput}; Inference Times: [{key.wasm_1.inference
									.toString()
									.replace(',', ', ')}] ms"
							>
								<div
									class="data"
									role="button"
									tabindex="0"
									on:keydown={() => {}}
									on:click={() =>
										copyRawInference(
											`Compilation Time: ${key.wasm_1.compilation.toString()} ms; First Inference Time: ${key.wasm_1.warmup.toString()} ms; Time to First Inference: ${key.wasm_1.timetofirstinference.toString()} ms; Inference Time (Median): ${
												key.wasm_1.inferencemedian
											} ms; 90th Percentile Inference: ${
												key.wasm_1.inferenceninety
											} ms; Inference Time (Average): ${
												key.wasm_1.inferenceaverage
											} ms; Inference Time (Best): ${
												key.wasm_1.inferencebest
											} ms; Throughput: ${key.wasm_1.inferencethroughput}; Inference Times: [${key.wasm_1.inference
												.toString()
												.replace(',', ', ')}] ms`
										)}
								>
									{#if resultOptions.compilation}<span class="compilation"
											>{key.wasm_1.compilation.toFixed(2)}</span
										>{/if}
									{#if resultOptions.first}<span class="first">{key.wasm_1.warmup}</span>{/if}
									{#if resultOptions.tofirst}<span class="tofirst"
											>{key.wasm_1.timetofirstinference}</span
										>{/if}
									{#if resultOptions.average}<span class="average"
											>{key.wasm_1.inferenceaverage}</span
										>{/if}
									{#if resultOptions.median}<span class="median">{key.wasm_1.inferencemedian}</span
										>{/if}
									{#if resultOptions.ninety}<span class="ninety">{key.wasm_1.inferenceninety}</span
										>{/if}
									{#if resultOptions.best}<span class="best">{key.wasm_1.inferencebest}</span>{/if}
									{#if resultOptions.throughput}<span class="throughput">{key.wasm_1.inferencethroughput}</span>{/if}
								</div>
							</div>
						{/if}

						{#if key.wasm_1.status === 4}
							<div class="status_{key.wasm_1.status} s" title={key.wasm_1.error}>
								<Fail />
							</div>
						{/if}
					{/if}

					{#if key.wasm_4 && key.wasm_4.status !== 0}
						{#if key.wasm_4.status === 1}
							<div class="status_{key.wasm_4.status} s">
								<Queue />
							</div>
						{/if}

						{#if key.wasm_4.status === 2}
							<div class="status_{key.wasm_4.status} s">
								<Testing />
							</div>
						{/if}

						{#if key.wasm_4.status === 3}
							<div
								class="status_{key.wasm_4.status} s backend"
								title="Compilation Time: {key.wasm_4.compilation.toString()} ms; First Inference Time: {key.wasm_4.warmup.toString()} ms; Time to First Inference: {key.wasm_4.timetofirstinference.toString()} ms; Inference Time (Median): {key
									.wasm_4.inferencemedian} ms; 90th Percentile Inference: {key.wasm_4
									.inferenceninety} ms; Inference Time (Average): {key.wasm_4
									.inferenceaverage} ms; Inference Time (Best): {key.wasm_4
									.inferencebest} ms; Throughput: {key.wasm_4.inferencethroughput}; Inference Times: [{key.wasm_4.inference
									.toString()
									.replace(',', ', ')}] ms"
							>
								<div
									class="data"
									role="button"
									tabindex="0"
									on:keydown={() => {}}
									on:click={() =>
										copyRawInference(
											`Compilation Time: ${key.wasm_4.compilation.toString()} ms; First Inference Time: ${key.wasm_4.warmup.toString()} ms; Time to First Inference: ${key.wasm_4.timetofirstinference.toString()} ms; Inference Time (Median): ${
												key.wasm_4.inferencemedian
											} ms; 90th Percentile Inference: ${
												key.wasm_4.inferenceninety
											} ms; Inference Time (Average): ${
												key.wasm_4.inferenceaverage
											} ms; Inference Time (Best): ${
												key.wasm_4.inferencebest
											} ms; Throughput: ${key.wasm_4.inferencethroughput}; Inference Times: [${key.wasm_4.inference
												.toString()
												.replace(',', ', ')}] ms`
										)}
								>
									{#if resultOptions.compilation}<span class="compilation"
											>{key.wasm_4.compilation.toFixed(2)}</span
										>{/if}
									{#if resultOptions.first}<span class="first">{key.wasm_4.warmup}</span>{/if}
									{#if resultOptions.tofirst}<span class="tofirst"
											>{key.wasm_4.timetofirstinference}</span
										>{/if}
									{#if resultOptions.average}<span class="average"
											>{key.wasm_4.inferenceaverage}</span
										>{/if}
									{#if resultOptions.median}<span class="median">{key.wasm_4.inferencemedian}</span
										>{/if}
									{#if resultOptions.ninety}<span class="ninety">{key.wasm_4.inferenceninety}</span
										>{/if}
									{#if resultOptions.best}<span class="best">{key.wasm_4.inferencebest}</span>{/if}
									{#if resultOptions.throughput}<span class="throughput">{key.wasm_4.inferencethroughput}</span>{/if}
								</div>
							</div>
						{/if}

						{#if key.wasm_4.status === 4}
							<div class="status_{key.wasm_4.status} s" title={key.wasm_4.error}>
								<Fail />
							</div>
						{/if}
					{/if}

					{#if key.webnn_cpu_1 && key.webnn_cpu_1.status !== 0}
						{#if key.webnn_cpu_1.status === 1}
							<div class="status_{key.webnn_cpu_1.status} s">
								<Queue />
							</div>
						{/if}

						{#if key.webnn_cpu_1.status === 2}
							<div class="status_{key.webnn_cpu_1.status} s">
								<Testing />
							</div>
						{/if}

						{#if key.webnn_cpu_1.status === 3}
							<div
								class="status_{key.webnn_cpu_1.status} s backend"
								title="Compilation Time: {key.webnn_cpu_1.compilation.toString()} ms; First Inference Time: {key.webnn_cpu_1.warmup.toString()} ms; Time to First Inference: {key.webnn_cpu_1.timetofirstinference.toString()} ms; Inference Time (Median): {key
									.webnn_cpu_1.inferencemedian} ms; 90th Percentile Inference: {key.webnn_cpu_1
									.inferenceninety} ms; Inference Time (Average): {key.webnn_cpu_1
									.inferenceaverage} ms; Inference Time (Best): {key.webnn_cpu_1
									.inferencebest} ms; Throughput: {key.webnn_cpu_1.inferencethroughput}; Inference Times: [{key.webnn_cpu_1.inference
									.toString()
									.replace(',', ', ')}] ms"
							>
								<div
									class="data"
									role="button"
									tabindex="0"
									on:keydown={() => {}}
									on:click={() =>
										copyRawInference(
											`Compilation Time: ${key.webnn_cpu_1.compilation.toString()} ms; First Inference Time: ${key.webnn_cpu_1.warmup.toString()} ms; Time to First Inference: ${key.webnn_cpu_1.timetofirstinference.toString()} ms; Inference Time (Median): ${
												key.webnn_cpu_1.inferencemedian
											} ms; 90th Percentile Inference: ${
												key.webnn_cpu_1.inferenceninety
											} ms; Inference Time (Average): ${
												key.webnn_cpu_1.inferenceaverage
											} ms; Inference Time (Best): ${
												key.webnn_cpu_1.inferencebest
											} ms; Throughput: ${key.webnn_cpu_1.inferencethroughput}; Inference Times: [${key.webnn_cpu_1.inference
												.toString()
												.replace(',', ', ')}] ms`
										)}
								>
									{#if resultOptions.compilation}<span class="compilation"
											>{key.webnn_cpu_1.compilation.toFixed(2)}</span
										>{/if}
									{#if resultOptions.first}<span class="first">{key.webnn_cpu_1.warmup}</span>{/if}
									{#if resultOptions.tofirst}<span class="tofirst"
											>{key.webnn_cpu_1.timetofirstinference}</span
										>{/if}
									{#if resultOptions.average}<span class="average"
											>{key.webnn_cpu_1.inferenceaverage}</span
										>{/if}
									{#if resultOptions.median}<span class="median"
											>{key.webnn_cpu_1.inferencemedian}</span
										>{/if}
									{#if resultOptions.ninety}<span class="ninety"
											>{key.webnn_cpu_1.inferenceninety}</span
										>{/if}
									{#if resultOptions.best}<span class="best">{key.webnn_cpu_1.inferencebest}</span
										>{/if}
									{#if resultOptions.throughput}<span class="throughput">{key.webnn_cpu_1.inferencethroughput}</span>{/if}	
								</div>
							</div>
						{/if}

						{#if key.webnn_cpu_1.status === 4}
							<div class="status_{key.webnn_cpu_1.status} s" title={key.webnn_cpu_1.error}>
								<Fail />
							</div>
						{/if}
					{/if}

					{#if key.webnn_cpu_4 && key.webnn_cpu_4.status !== 0}
						{#if key.webnn_cpu_4.status === 1}
							<div class="status_{key.webnn_cpu_4.status} s">
								<Queue />
							</div>
						{/if}

						{#if key.webnn_cpu_4.status === 2}
							<div class="status_{key.webnn_cpu_4.status} s">
								<Testing />
							</div>
						{/if}

						{#if key.webnn_cpu_4.status === 3}
							<div
								class="status_{key.webnn_cpu_4.status} s backend"
								title="Compilation Time: {key.webnn_cpu_4.compilation.toString()} ms;  First Inference Time: {key.webnn_cpu_4.warmup.toString()} ms; Time to First Inference: {key.webnn_cpu_4.timetofirstinference.toString()} ms; Inference Time (Median): {key
									.webnn_cpu_4.inferencemedian} ms; 90th Percentile Inference: {key.webnn_cpu_4
									.inferenceninety} ms; Inference Time (Average): {key.webnn_cpu_4
									.inferenceaverage} ms; Inference Time (Best): {key.webnn_cpu_4
									.inferencebest} ms; Throughput: {key.webnn_cpu_4.inferencethroughput}; Inference Times: [{key.webnn_cpu_4.inference
									.toString()
									.replace(',', ', ')}] ms"
							>
								<div
									class="data"
									role="button"
									tabindex="0"
									on:keydown={() => {}}
									on:click={() =>
										copyRawInference(
											`Compilation Time: ${key.webnn_cpu_4.compilation.toString()} ms; First Inference Time: ${key.webnn_cpu_4.warmup.toString()} ms; Time to First Inference: ${key.webnn_cpu_4.timetofirstinference.toString()} ms; Inference Time (Median): ${
												key.webnn_cpu_4.inferencemedian
											} ms; 90th Percentile Inference: ${
												key.webnn_cpu_4.inferenceninety
											} ms; Inference Time (Average): ${
												key.webnn_cpu_4.inferenceaverage
											} ms; Inference Time (Best): ${
												key.webnn_cpu_4.inferencebest
											} ms; Throughput: ${key.webnn_cpu_4.inferencethroughput}; Inference Times: [${key.webnn_cpu_4.inference
												.toString()
												.replace(',', ', ')}] ms`
										)}
								>
									{#if resultOptions.compilation}<span class="compilation"
											>{key.webnn_cpu_4.compilation.toFixed(2)}</span
										>{/if}
									{#if resultOptions.first}<span class="first">{key.webnn_cpu_4.warmup}</span>{/if}
									{#if resultOptions.tofirst}<span class="tofirst"
											>{key.webnn_cpu_4.timetofirstinference}</span
										>{/if}
									{#if resultOptions.average}<span class="average"
											>{key.webnn_cpu_4.inferenceaverage}</span
										>{/if}
									{#if resultOptions.median}<span class="median"
											>{key.webnn_cpu_4.inferencemedian}</span
										>{/if}
									{#if resultOptions.ninety}<span class="ninety"
											>{key.webnn_cpu_4.inferenceninety}</span
										>{/if}
									{#if resultOptions.best}<span class="best">{key.webnn_cpu_4.inferencebest}</span
										>{/if}
										{#if resultOptions.throughput}<span class="throughput">{key.webnn_cpu_4.inferencethroughput}</span>{/if}	
								</div>
							</div>
						{/if}

						{#if key.webnn_cpu_4.status === 4}
							<div class="status_{key.webnn_cpu_4.status} s" title={key.webnn_cpu_4.error}>
								<Fail />
							</div>
						{/if}
					{/if}

					{#if key.webgl && key.webgl.status !== 0}
						{#if key.webgl.status === 1}
							<div class="status_{key.webgl.status} s">
								<Queue />
							</div>
						{/if}

						{#if key.webgl.status === 2}
							<div class="status_{key.webgl.status} s">
								<Testing />
							</div>
						{/if}

						{#if key.webgl.status === 3}
							<div
								class="status_{key.webgl.status} s backend"
								title="Compilation Time: {key.webgl.compilation.toString()} ms; First Inference Time: {key.webgl.warmup.toString()} ms; Time to First Inference: {key.webgl.timetofirstinference.toString()} ms; Inference Time (Median): {key
									.webgl.inferencemedian} ms; 90th Percentile Inference: {key.webgl
									.inferenceninety} ms; Inference Time (Average): {key.webgl
									.inferenceaverage} ms; Inference Time (Best): {key.webgl
									.inferencebest} ms; Throughput: {key.webgl.inferencethroughput}; Inference Times: [{key.webgl.inference
									.toString()
									.replace(',', ', ')}] ms"
							>
								<div
									class="data"
									role="button"
									tabindex="0"
									on:keydown={() => {}}
									on:click={() =>
										copyRawInference(
											`Compilation Time: ${key.webgl.compilation.toString()} ms; First Inference Time: ${key.webgl.warmup.toString()} ms; Time to First Inference: ${key.webgl.timetofirstinference.toString()} ms; Inference Time (Median): ${
												key.webgl.inferencemedian
											} ms; 90th Percentile Inference: ${
												key.webgl.inferenceninety
											} ms; Inference Time (Average): ${
												key.webgl.inferenceaverage
											} ms; Inference Time (Best): ${
												key.webgl.inferencebest
											} ms; Throughput: ${key.webgl.inferencethroughput}; Inference Times: [${key.webgl.inference
												.toString()
												.replace(',', ', ')}] ms`
										)}
								>
									{#if resultOptions.compilation}<span class="compilation"
											>{key.webgl.compilation.toFixed(2)}</span
										>{/if}
									{#if resultOptions.first}<span class="first">{key.webgl.warmup}</span>{/if}
									{#if resultOptions.tofirst}<span class="tofirst"
											>{key.webgl.timetofirstinference}</span
										>{/if}
									{#if resultOptions.average}<span class="average"
											>{key.webgl.inferenceaverage}</span
										>{/if}
									{#if resultOptions.median}<span class="median">{key.webgl.inferencemedian}</span
										>{/if}
									{#if resultOptions.ninety}<span class="ninety">{key.webgl.inferenceninety}</span
										>{/if}
									{#if resultOptions.best}<span class="best">{key.webgl.inferencebest}</span>{/if}
									{#if resultOptions.throughput}<span class="throughput">{key.webgl.inferencethroughput}</span>{/if}
								</div>
							</div>
						{/if}

						{#if key.webgl.status === 4}
							<div class="status_{key.webgl.status} s" title={key.webgl.error}>
								<Fail />
							</div>
						{/if}
					{/if}

					{#if key.webgpu && key.webgpu.status !== 0}
						{#if key.webgpu.status === 1}
							<div class="status_{key.webgpu.status} s">
								<Queue />
							</div>
						{/if}

						{#if key.webgpu.status === 2}
							<div class="status_{key.webgpu.status} s">
								<Testing />
							</div>
						{/if}

						{#if key.webgpu.status === 3}
							<div
								class="status_{key.webgpu.status} s backend"
								title="Compilation Time: {key.webgpu.compilation.toString()} ms; First Inference Time: {key.webgpu.warmup.toString()} ms; Time to First Inference: {key.webgpu.timetofirstinference.toString()} ms; Inference Time (Median): {key
									.webgpu.inferencemedian} ms; 90th Percentile Inference: {key.webgpu
									.inferenceninety} ms; Inference Time (Average): {key.webgpu
									.inferenceaverage} ms; Inference Time (Best): {key.webgpu
									.inferencebest} ms; Throughput: {key.webgpu.inferencethroughput}; Inference Times: [{key.webgpu.inference
									.toString()
									.replace(',', ', ')}] ms"
							>
								<div
									class="data"
									role="button"
									tabindex="0"
									on:keydown={() => {}}
									on:click={() =>
										copyRawInference(
											`Compilation Time: ${key.webgpu.compilation.toString()} ms; First Inference Time: ${key.webgpu.warmup.toString()} ms; Time to First Inference: ${key.webgpu.timetofirstinference.toString()} ms; Inference Time (Median): ${
												key.webgpu.inferencemedian
											} ms; 90th Percentile Inference: ${
												key.webgpu.inferenceninety
											} ms; Inference Time (Average): ${
												key.webgpu.inferenceaverage
											} ms; Inference Time (Best): ${
												key.webgpu.inferencebest
											} ms; Throughput: ${key.webgpu.inferencethroughput}; Inference Times: [${key.webgpu.inference
												.toString()
												.replace(',', ', ')}] ms`
										)}
								>
									{#if resultOptions.compilation}<span class="compilation"
											>{key.webgpu.compilation.toFixed(2)}</span
										>{/if}
									{#if resultOptions.first}<span class="first">{key.webgpu.warmup}</span>{/if}
									{#if resultOptions.tofirst}<span class="tofirst"
											>{key.webgpu.timetofirstinference}</span
										>{/if}
									{#if resultOptions.average}<span class="average"
											>{key.webgpu.inferenceaverage}</span
										>{/if}
									{#if resultOptions.median}<span class="median">{key.webgpu.inferencemedian}</span
										>{/if}
									{#if resultOptions.ninety}<span class="ninety">{key.webgpu.inferenceninety}</span
										>{/if}
									{#if resultOptions.best}<span class="best">{key.webgpu.inferencebest}</span>{/if}
									{#if resultOptions.throughput}<span class="throughput">{key.webgpu.inferencethroughput}</span>{/if}
								</div>
							</div>
						{/if}

						{#if key.webgpu.status === 4}
							<div class="status_{key.webgpu.status} s" title={key.webgpu.error}>
								<Fail />
							</div>
						{/if}
					{/if}

					{#if key.webnn_gpu && key.webnn_gpu.status !== 0}
						{#if key.webnn_gpu.status === 1}
							<div class="status_{key.webnn_gpu.status} s">
								<Queue />
							</div>
						{/if}

						{#if key.webnn_gpu.status === 2}
							<div class="status_{key.webnn_gpu.status} s">
								<Testing />
							</div>
						{/if}

						{#if key.webnn_gpu.status === 3}
							<div
								class="status_{key.webnn_gpu.status} s backend"
								title="Compilation Time: {key.webnn_gpu.compilation.toString()} ms; First Inference Time: {key.webnn_gpu.warmup.toString()} ms; Time to First Inference: {key.webnn_gpu.timetofirstinference.toString()} ms; Inference Time (Median): {key
									.webnn_gpu.inferencemedian} ms; 90th Percentile Inference: {key.webnn_gpu
									.inferenceninety} ms; Inference Time (Average): {key.webnn_gpu
									.inferenceaverage} ms; Inference Time (Best): {key.webnn_gpu
									.inferencebest} ms; Throughput: {key.webnn_gpu.inferencethroughput}; Inference Times: [{key.webnn_gpu.inference
									.toString()
									.replace(',', ', ')}] ms"
							>
								<div
									class="data"
									role="button"
									tabindex="0"
									on:keydown={() => {}}
									on:click={() =>
										copyRawInference(
											`Compilation Time: ${key.webnn_gpu.compilation.toString()} ms; First Inference Time: ${key.webnn_gpu.warmup.toString()} ms; Time to First Inference: ${key.webnn_gpu.timetofirstinference.toString()} ms; Inference Time (Median): ${
												key.webnn_gpu.inferencemedian
											} ms; 90th Percentile Inference: ${
												key.webnn_gpu.inferenceninety
											} ms; Inference Time (Average): ${
												key.webnn_gpu.inferenceaverage
											} ms; Inference Time (Best): ${
												key.webnn_gpu.inferencebest
											} ms; Throughput: ${key.webnn_gpu.inferencethroughput}; Inference Times: [${key.webnn_gpu.inference
												.toString()
												.replace(',', ', ')}] ms`
										)}
								>
									{#if resultOptions.compilation}<span class="compilation"
											>{key.webnn_gpu.compilation.toFixed(2)}</span
										>{/if}
									{#if resultOptions.first}<span class="first">{key.webnn_gpu.warmup}</span>{/if}
									{#if resultOptions.tofirst}<span class="tofirst"
											>{key.webnn_gpu.timetofirstinference}</span
										>{/if}
									{#if resultOptions.average}<span class="average"
											>{key.webnn_gpu.inferenceaverage}</span
										>{/if}
									{#if resultOptions.median}<span class="median"
											>{key.webnn_gpu.inferencemedian}</span
										>{/if}
									{#if resultOptions.ninety}<span class="ninety"
											>{key.webnn_gpu.inferenceninety}</span
										>{/if}
									{#if resultOptions.best}<span class="best">{key.webnn_gpu.inferencebest}</span
										>{/if}
										{#if resultOptions.throughput}<span class="throughput">{key.webnn_gpu.inferencethroughput}</span>{/if}	
								</div>
							</div>
						{/if}

						{#if key.webnn_gpu.status === 4}
							<div class="status_{key.webnn_gpu.status} s" title={key.webnn_gpu.error}>
								<Fail />
							</div>
						{/if}
					{/if}

					{#if key.webnn_npu && key.webnn_npu.status !== 0}
						{#if key.webnn_npu.status === 1}
							<div class="status_{key.webnn_npu.status} s">
								<Queue />
							</div>
						{/if}

						{#if key.webnn_npu.status === 2}
							<div class="status_{key.webnn_npu.status} s">
								<Testing />
							</div>
						{/if}

						{#if key.webnn_npu.status === 3}
							<div
								class="status_{key.webnn_npu.status} s backend"
								title="Compilation Time: {key.webnn_npu.compilation.toString()} ms; First Inference Time: {key.webnn_npu.warmup.toString()} ms; Time to First Inference: {key.webnn_npu.timetofirstinference.toString()} ms; Inference Time (Median): {key
									.webnn_npu.inferencemedian} ms; 90th Percentile Inference: {key.webnn_npu
									.inferenceninety} ms; Inference Time (Average): {key.webnn_npu
									.inferenceaverage} ms; Inference Time (Best): {key.webnn_npu
									.inferencebest} ms; Throughput: {key.webnn_npu.inferencethroughput}; Inference Times: [{key.webnn_npu.inference
									.toString()
									.replace(',', ', ')}] ms"
							>
								<div
									class="data"
									role="button"
									tabindex="0"
									on:keydown={() => {}}
									on:click={() =>
										copyRawInference(
											`Compilation Time: ${key.webnn_npu.compilation.toString()} ms; First Inference Time: ${key.webnn_npu.warmup.toString()} ms; Time to First Inference: ${key.webnn_npu.timetofirstinference.toString()} ms; Inference Time (Median): ${
												key.webnn_npu.inferencemedian
											} ms; 90th Percentile Inference: ${
												key.webnn_npu.inferenceninety
											} ms; Inference Time (Average): ${
												key.webnn_npu.inferenceaverage
											} ms; Inference Time (Best): ${
												key.webnn_npu.inferencebest
											} ms; Throughput: ${key.webnn_npu.inferencethroughput}; Inference Times: [${key.webnn_npu.inference
												.toString()
												.replace(',', ', ')}] ms`
										)}
								>
									{#if resultOptions.compilation}<span class="compilation"
											>{key.webnn_npu.compilation.toFixed(2)}</span
										>{/if}
									{#if resultOptions.first}<span class="first">{key.webnn_npu.warmup}</span>{/if}
									{#if resultOptions.tofirst}<span class="tofirst"
											>{key.webnn_npu.timetofirstinference}</span
										>{/if}
									{#if resultOptions.average}<span class="average"
											>{key.webnn_npu.inferenceaverage}</span
										>{/if}
									{#if resultOptions.median}<span class="median"
											>{key.webnn_npu.inferencemedian}</span
										>{/if}
									{#if resultOptions.ninety}<span class="ninety"
											>{key.webnn_npu.inferenceninety}</span
										>{/if}
									{#if resultOptions.best}<span class="best">{key.webnn_npu.inferencebest}</span
										>{/if}
										{#if resultOptions.throughput}<span class="throughput">{key.webnn_npu.inferencethroughput}</span>{/if}	
								</div>
							</div>
						{/if}

						{#if key.webnn_npu.status === 4}
							<div class="status_{key.webnn_npu.status} s" title={key.webnn_npu.error}>
								<Fail />
							</div>
						{/if}
					{/if}
				</div>
			{/each}
		</div>
		<div class="q copy">
			<div>
				<span>
					{testQueueLength - testQueue.length}/{testQueueLength}
					{percentageTestQueue}%</span
				>
				{#if testQueue.length === 0}
					<button title="Download screenshot of test results" on:click={() => downloadScreenshot()}>
						<Screenshot />
					</button>
					<button title="Copy full test results" on:click={() => copyResults()}>
						<FileCopy />
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
