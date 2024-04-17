<script>
	import { base } from '$app/paths';
	// import { page } from '$app/stores';
	// import { getModelIdfromPath } from '$lib/assets/js/utils';
	import { onMount } from 'svelte';

	// $: url = base;
	// $: search = '';
	// $: fullSearch = search;

	// const homeUrl = () => {
	// 	search = $page.url.search;

	// 	if ($page.url.pathname.indexOf('/run/') > -1 && search.indexOf('model=') <= -1) {
	// 		if (search.indexOf('?') > -1) {
	// 			let id = getModelIdfromPath();
	// 			fullSearch = search + `&model=${id}`;
	// 		} else {
	// 			fullSearch = search;
	// 		}
	// 	} else {
	// 		fullSearch = search;
	// 	}

	// 	let host = $page.url.protocol + '//' + $page.url.hostname;
	// 	let port = $page.url.port;
	// 	if (port) {
	// 		host = host + ':' + port;
	// 	}
	// 	if ($page.url.pathname.indexOf('web-ai-benchmark') > -1) {
	// 		host = host + '/web-ai-benchmark';
	// 	}

	// 	if (
	// 		$page.url.pathname.indexOf('fallback') > -1 ||
	// 		$page.url.pathname.indexOf('conformance') > -1 ||
	// 		$page.url.pathname.indexOf('about') > -1
	// 	) {
	// 		fullSearch = '';
	// 	}

	// 	url = `${host}${fullSearch}`;
	// };

	onMount(() => {});
</script>

<nav>
	<div id="togg">
		<input type="checkbox" />
		<span></span>
		<span></span>
		<span></span>

		<ul id="menu">
			<a href="{base}/"><li>Home</li></a>
			<a href="{base}/tests"><li>Benchmark</li></a>
			<a href="{base}/fallback"><li>Fallback</li></a>
			<a href="{base}/graph"><li>Graph</li></a>
			<a href="{base}/conformance"><li>Conformance</li></a>
			<a href="{base}/about"><li>About</li></a>
		</ul>
	</div>
</nav>

<style>
	#togg input {
		display: block;
		width: 33px;
		height: 33px;
		position: absolute;
		top: 10px;
		right: 20px;
		cursor: pointer;
		opacity: 0;
		z-index: 10;
		-webkit-touch-callout: none;
	}

	ul#menu {
		margin-top: 10px;
	}

	ul#menu li {
		list-style: none;
	}

	@media (max-width: 768px) {
		nav {
			position: absolute;
			top: 0px;
			right: 0px;
			z-index: 1;
		}

		#togg {
			display: block;
			z-index: 1;
			-webkit-user-select: none;
			user-select: none;
			padding: 20px 20px 0 0;
		}

		#togg a {
			text-decoration: none;
			color: #232323;
			transition: color 0.3s ease;
		}

		#togg a:hover {
			color: tomato;
		}

		#togg span {
			display: block;
			width: 33px;
			height: 4px;
			margin-bottom: 5px;
			position: relative;
			background: #cdcdcd;
			border-radius: 3px;
			z-index: 10;
			transform-origin: 4px 0px;
			transition:
				transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1),
				background 0.5s cubic-bezier(0.77, 0.2, 0.05, 1),
				opacity 0.55s ease;
		}

		#togg span:first-child {
			transform-origin: 0% 0%;
		}

		#togg span:nth-last-child(2) {
			transform-origin: 0% 100%;
		}

		#togg input:checked ~ span {
			opacity: 1;
			transform: rotate(45deg) translate(-2px, -1px);
			background: var(--white);
		}

		#togg input:checked ~ span:nth-last-child(3) {
			opacity: 0;
			transform: rotate(0deg) scale(0.2, 0.2);
		}

		#togg input:checked ~ span:nth-last-child(2) {
			transform: rotate(-45deg) translate(0, -1px);
		}

		#menu {
			position: absolute;
			width: 100vw;
			height: 100vh;
			top: 0px;
			padding: 40px 0;
			right: 0px;
			margin: 0px;
			background: var(--red);
			list-style-type: none;
			-webkit-font-smoothing: antialiased;
			transform-origin: 0% 0%;
			transform: translate(-100%, 0%);
			transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1);
		}

		nav a {
			text-decoration: none;
			border-bottom: 0px solid var(--white);
			color: var(--white);
		}

		ul#menu {
			margin-top: 0px;
		}

		#menu a {
			display: block;
			background: var(--red);
			color: var(--white);
			padding: 10px 40px 10px 40px;
		}

		#menu li {
			font-size: 22px;
			color: var(--white);
		}

		#togg input:checked ~ ul {
			transform: none;
		}
	}
</style>
