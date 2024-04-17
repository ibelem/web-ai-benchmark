<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Environment from '$lib/components/Environment.svelte';
	import Onnx from '$lib/components/svg/Onnx.svelte';
</script>

<Header />

<div class="page">
	<div class="tqtitle subtitle">
		<div class="title tq">Demo</div>
	</div>

	<div class="tq benchmark">
		<div class="q tests" title="">
			<div class="onnx"><Onnx /></div>
			<a href="../">Stable Diffusion · UNet 1.5</a>
		</div>
	</div>
</div>

<Environment />

<Footer />

<style>
	.page {
		margin: 0 6px;
	}

	.onnx {
		margin-bottom: 4px;
	}

	.tq .tests {
		display: flex;
		align-items: center;
		padding: 4px 10px;
	}

	.title {
		text-align: center;
		color: var(--red);
	}
</style>
