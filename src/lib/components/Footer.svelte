<script>
	import { siteTitle, siteURL } from '$lib/config';
	let webnn = false;
	import { onMount } from 'svelte';

	const checkWebNN = async () => {
		const context = await navigator.ml?.createContext();
		if (context) {
			try {
				const builder = new MLGraphBuilder(context);
				if (builder) {
					webnn = true;
				} else {
					webnn = false;
				}
			} catch (ex) {
				webnn = false;
			}
		} else {
			webnn = false;
		}
	};

	onMount(async () => {
		await checkWebNN();
	});
</script>

<footer>
	<span class="copyright">&copy;</span>{new Date().getFullYear()}

	{#if siteURL}
		<a href="https://{siteURL}">{siteTitle}</a>
	{:else}
		{siteTitle}
	{/if}
	<span class="alpha">alpha</span>
	<div class="badge">
		<span class="title {webnn}">WebNN</span><span class="status {webnn}"
			><a
				href="https://webmachinelearning.github.io/webnn-status/"
				title="Implementation Status of WebNN Operations"
				>{#if webnn}Supported{:else}Not Supported{/if}</a
			></span
		><span class="status {webnn}"
		><a
			href="../install"
			title="WebNN Installation Guide for the AI PC"
			>Install Guide</a
		></span>
		<!-- <span class="status {webnn}"
		><a
			href="https://microsoft.github.io/onnxruntime-web-demo/"
			title="ONNX Runtime Web - WebNN Demos"
			>Demos</a
		></span> -->
	</div>
</footer>

<style>
	footer {
		margin: 20px 10px 20px 10px;
		text-align: center;
	}

	footer .alpha {
		position: relative;
		top: -1px;
		right: 0px;
		font-size: 0.6rem;
		background-color: var(--red);
		color: var(--white);
		padding: 1px 6px;
		border-radius: 999px;
	}

	.badge {
		display: inline-block;
		margin-left: 10px;
	}

	.badge span {
		display: inline-block;
		padding: 0px 10px 0px 10px;
	}

	.badge .title.true {
		border: 1px solid var(--red);
		background-color: var(--red);
		color: #fff;
	}

	.badge .status.true {
		border: 1px solid var(--red);
		color: var(--red);
		border-left: 0px solid transparent;
	}

	.badge .status.true:hover {
		color: var(--white);
		background-color: var(--red);
	}

	.badge .status.true a {
		color: var(--red);
	}

	.badge .status.true:hover a {
		color: var(--white);
	}

	.badge .title.false {
		border: 1px solid var(--grey-02);
		background-color: transparent;
		background-color: var(--grey-02);
	}

	.badge .status.false {
		border: 1px solid var(--grey-02);
		border-left: 0px solid transparent;
	}

	@media (max-width: 512px) {
		footer {
			margin: 0 10px 30px 10px;
		}

		.badge {
			display: block;
			margin: 10px 0 0 0;
		}
	}
</style>
