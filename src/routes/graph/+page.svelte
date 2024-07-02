<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Environment from '$lib/components/Environment.svelte';
	import { onMount } from 'svelte';
	import { loadScript } from '$lib/assets/js/utils.js';
	import FullscreenSVG from '$lib/components/svg/FullscreenSVG.svelte';
	import Fullscreen from 'svelte-fullscreen';
	import Upload from '$lib/components/svg/Upload.svelte';

	let bar, loadingBar, border, text, mynetwork;
	let search = '',
		show = false,
		msg = '';
	let full = false,
		showloadingbar = false;

	const exitHandler = () => {
		if (!document.fullscreenElement) {
			full = false;
		}
	};

	onMount(async () => {
		showloadingbar = false;
		await loadScript(
			'vis',
			'https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.2/dist/vis-network.min.js'
		);

		document.addEventListener('fullscreenchange', exitHandler);
	});

	let network;
	let UniqueNodes = [];

	const handleFileInput = async (event) => {
		const file = event.target.files[0];
		if (file) {
			try {
				const fileContent = await readFile(file);
				showloadingbar = true;
				let edges;
				let nodes;
				let allNodes;
				let allEdges;
				let nodeColors;
				let data;

				const drawGraph = () => {
					let nodesFromJson = JSON.parse(fileContent).nodes.map((node) => ({
						color: '#97c2fc',
						id: node.name,
						label: node.name,
						shape: 'box'
					}));

					if (nodesFromJson.length > 0) {
						nodesFromJson = nodesFromJson.map((item) => ({
							...item,
							color: item.id.startsWith('Input_') ? '#97fcc2' : item.color
						}));

						nodesFromJson.forEach((node) => {
							if (node.id === 'Input_0') {
								node.color = 'rgba(106, 198, 0, 0.95)';
							}
						});

						nodesFromJson.forEach((node) => {
							if (node.id === 'Output_0') {
								node.color = 'rgba(226, 69, 124, 0.95)';
							}
						});

						UniqueNodes = [...new Set([...JSON.parse(fileContent).nodes.map((node) => node.name)])];
					}

					nodes = new vis.DataSet(nodesFromJson);

					let edgesFromJson = JSON.parse(fileContent).edges.map((edge) => ({
						from: edge.FromNode,
						to: edge.ToNode
					}));

					edges = new vis.DataSet(edgesFromJson);

					nodeColors = {};
					allNodes = nodes.get({ returnType: 'Object' });
					for (let nodeId in allNodes) {
						nodeColors[nodeId] = allNodes[nodeId].color;
					}
					allEdges = edges.get({ returnType: 'Object' });
					data = { nodes: nodes, edges: edges };

					let options = {
						layout: { hierarchical: false },
						edges: { arrows: { to: { enabled: true } } }
					};

					network = new vis.Network(mynetwork, data, options);

					network.on('stabilizationProgress', function (params) {
						loadingBar.removeAttribute('style');
						let maxWidth = 496;
						let minWidth = 20;
						let widthFactor = params.iterations / params.total;
						let width = Math.max(minWidth, maxWidth * widthFactor);
						bar.style.width = width + 'px';
						text.innerHTML = Math.round(widthFactor * 100) + '%';
					});

					network.once('stabilizationIterationsDone', function () {
						text.innerHTML = '100%';
						bar.style.width = '496px';
						loadingBar.style.opacity = 0;
						// really clean the dom element
						setTimeout(function () {
							loadingBar.style.display = 'none';
						}, 100);
					});

					network.on('selectNode', function (params) {
						if (params.nodes.length == 1) {
							let obj = {};
							obj.clicked_id = params.nodes[0];
							let options = {
								color: {
									background: 'rgba(0, 79, 255, 0.95)',
									border: 'rgba(0, 79, 255, 1)'
								},
								font: { color: 'rgba(255, 255, 255, 1)' }
							};

							if (params.nodes[0].toLowerCase().startsWith('input_')) {
								options = {
									color: {
										background: 'rgba(3, 192, 74, 0.95)',
										border: 'rgba(3, 192, 74, 1)'
									},
									font: { color: 'rgba(255, 255, 255, 1)' }
								};

								network.clustering.updateEdge(params.edges[0], {
									color: 'rgba(3, 192, 74, 1)',
									borderWidthSelected: 3
								});
							}

							if (params.nodes[0].toLowerCase().startsWith('output_')) {
								options = {
									color: {
										background: 'rgba(226, 69, 124, 0.95)',
										border: 'rgba(226, 69, 124, 1)'
									},
									font: { color: 'rgba(255, 255, 255, 1)' }
								};

								network.clustering.updateEdge(params.edges[0], {
									color: 'rgba(226, 69, 124, 1)',
									borderWidthSelected: 3
								});
							}

							network.clustering.updateClusteredNode(params.nodes[0], options);
						}
					});

					network.on('selectEdge', function (params) {
						if (params.edges.length == 1) {
							// Single edge selected
							let obj = {};
							obj.clicked_id = params.edges[0];
							network.clustering.updateEdge(params.edges[0], {
								borderWidthSelected: 3
							});
							// obj.base_edge = network.clustering.getBaseEdge(params.edges[0]);
							// obj.all_clustered_edges = network.clustering.getClusteredEdges(params.edges[0]);
						}
					});
					show = true;
					return network;
				};
				drawGraph();
			} catch (error) {
				show = false;
				console.error('Error reading or parsing the file:', error);
			}
		}
	};

	const capitalizeFirstLetter = (str) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	const findNode = async (event) => {
		msg = '';
		if (event.key === 'Enter') {
			if (!network) {
				return;
			}
			let options = {
				color: {
					background: 'rgba(0, 19, 130, 0.95)',
					border: 'rgba(0, 19, 130, 1)'
				},
				font: { color: 'rgba(255, 255, 255, 1)' }
			};

			if (search.toLowerCase().startsWith('inp')) {
				search = capitalizeFirstLetter(search);
			} else {
				search = search.toUpperCase();
			}

			try {
				network.clustering.updateClusteredNode(search, options);
			} catch (err) {
				msg = err.message;
			}
		}
	};

	function readFile(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event) => {
				resolve(event.target.result);
			};

			reader.onerror = (error) => {
				reject(error);
			};

			reader.readAsText(file);
		});
	}
</script>

<Header />

<div class="page {full} ">
	<div class="tqtitle subtitle">
		<div class="title tq">WebNN DirectML Graph Before Compilation</div>
	</div>

	<div class="mb-2 network" style="width: 100%">
		<Fullscreen let:onToggle>
			<div id="mynetwork" bind:this={mynetwork}></div>
			<div class="q copy">
				<div>
					<button
						id="btnfull"
						title="Enter fullscreen"
						on:click={() => {
							full = true;
							onToggle();
						}}
					>
						<FullscreenSVG />
					</button>
				</div>
			</div>
		</Fullscreen>
	</div>

	<div id="searchzone" class="s {show}">
		{#if UniqueNodes.length > 0}
			<div class="tags">
				{#each UniqueNodes as node}
					<button
						on:click={() => {
							search = node;
							findNode({ key: 'Enter' });
						}}
					>
						{node}
					</button>
				{/each}
			</div>
		{/if}

		<input
			id="search"
			bind:value={search}
			placeholder="Search nodes or edges"
			on:keydown={findNode}
		/>
		<div id="message">{msg}</div>
	</div>

	<div id="loadingBar" bind:this={loadingBar} class="i {showloadingbar}">
		<div class="outerBorder">
			<div id="text" bind:this={text}>0%</div>
			<div id="border" bind:this={border}>
				<div id="bar" bind:this={bar}></div>
			</div>
		</div>
	</div>

	<div class="jsonfile">
		<label>
			<input type="file" accept=".json" on:change={handleFileInput} hidden />
			<span><Upload />Select .json file</span>
		</label>
	</div>
</div>

<Environment />

<Footer />

<style>
	.page .false {
		display: none !important;
	}

	.page .true {
		display: block;
	}

	.page .true#searchzone {
		display: block;
		margin: 10px auto;
		width: 100%;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.page.true .true#searchzone {
		position: absolute;
		top: 20px;
		right: 20px;
		z-index: 10000;
	}

	.tags button {
		font-size: 10px;
		padding: 3px 4px;
		border-radius: 3px;
		border: 1px solid var(--grey-08) !important;
		color: var(--grey-08);
		margin: 2px;
		cursor: pointer;
		background-color: var(--grey-01);
	}

	.tags button:hover {
		border: 1px solid var(--b2) !important;
		color: var(--b2);
	}

	.tqtitle {
		margin-top: 0px;
	}

	#search {
		border: 1px solid var(--grey-04);
		outline: none;
		margin: 10px auto 0 auto;
		max-width: 50vw;
		width: 40vw;
		height: 32px;
		font-size: 1.2em;
		border-radius: 4px;
		padding: 4px 8px;
		color: var(--b2);
		font-family: 'JetBrains Mono', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	#search:hover {
		border: 1px solid var(--b2);
	}

	#message {
		margin-top: 10px;
		color: var(--red);
	}

	.jsonfile {
		margin: 0px auto 10px 0;
		text-align: center;
		font-family: 'JetBrains Mono', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	.jsonfile input {
		font-family: 'JetBrains Mono', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background-color: transparent;
	}

	#mynetwork {
		width: 100%;
		height: auto;
		min-height: 40vh;
		resize: both;
		background-color: white;
		border: 1px solid var(--grey-02);
		outline: none;
	}

	.q div {
		border: 1px solid var(--grey-02);
		border-bottom-left-radius: 5px;
		border-bottom-right-radius: 5px;
		border-top: 0px;
		margin-right: -2px;
	}

	#mynetwork:hover,
	.q div:hover {
		border: 1px solid var(--grey-04);
	}

	.q div:hover {
		border-top: 0px;
	}

	.network button {
		background: transparent;
		border: 0px;
	}

	#loadingBar {
		position: absolute;
		top: 16px;
		left: 50%;
		transform: translateX(-50%);
		transition: all 0.5s ease;
		z-index: 1;
	}

	#bar {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 10px;
		height: 10px;
		margin: auto auto auto auto;
		border-radius: 11px;
		border: 2px solid rgba(30, 30, 30, 0.05);
		background: rgb(0, 173, 246);
	}

	#border {
		position: absolute;
		top: 5px;
		left: 10px;
		width: 560px;
		height: 13px;
		margin: auto auto auto auto;
		border-radius: 10px;
	}

	#text {
		position: absolute;
		top: 3px;
		left: 566px;
		width: 30px;
		height: 20px;
		margin: auto auto auto auto;
		font-size: 12px;
	}

	div.outerBorder {
		position: relative;
		width: 600px;
		height: 24px;
		margin: 0 auto;
		background: rgb(252, 252, 252);
		border-radius: 24px;
	}

	.page {
		margin: 0 6px;
	}

	.red {
		color: var(--red);
	}

	.title {
		text-align: center;
		color: var(--red);
	}

	@media (max-width: 768px) {
		.tqtitle {
			margin-top: 20px;
		}
	}
</style>
