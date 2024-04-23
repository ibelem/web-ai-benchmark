<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Environment from '$lib/components/Environment.svelte';
</script>

<Header />

<div class="page">
	<div class="tqtitle subtitle">
		<div class="title tq">WebNN Installation Guides for the AI PC</div>
	</div>

	<div id='install-guides' class="">
		WebNN requires a compatible browser to run, and Windows* 11 v21H2 (DML 1.6.0) or higher.
		<ol>
			<li>Download the latest <a href="https://google.com/chrome/canary" title="Download Google Chrome Canary">Google Chrome Canary</a> or <a href="https://www.microsoft.com/edge/download/insider" title="Download Microsoft Edge Canary">Microsoft Edge Canary</a> browser</li>
			<li>To enable WebNN, in your browser address bar, enter <code>chrome://flags</code>, and then press <code>Enter</code>. An Experiments page opens</li>
			<li>In the Search flags box, enter <code>webnn</code>. Enables WebNN API appears</li>
			<li>In the drop-down menu, select <code>Enabled</code></li>
			<li>Relaunch your browser</li>
		</ol>
	</div>
</div>

<Environment />

<Footer />

<style>
	.page {
		margin: 0 6px;
	}
	div {
		margin-bottom: 20px;
	}

	.red {
		color: var(--red);
	}

	.title {
		text-align: center;
		color: var(--red);
	}

	a {
		margin: 1px auto;
		background-color: var(--red-01);
		display: inline-block;
		padding: 0px 6px;
		border-radius: 3px;
	}

	a:hover {
		background-color: var(--red);
		color: var(--white);
	}

	code {
		margin: 1px auto;
		background-color: var(--green-01);
		display: inline-block;
		padding: 0px 6px;
		border-radius: 3px;
	}

	code:hover {
		background-color: var(--green);
		color: var(--white);
	}
</style>
