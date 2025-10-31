<!-- @file src/routes/+page.svelte -->
<script lang="ts">
	import { fade, fly } from 'svelte/transition';
    import type { AiResponse } from '$lib/types/ai';

	let prompt = '';
	let isLoading = false;
	let result: AiResponse | null = null;
	let error: string | null = null;

	const samplePrompts = [
		"Show me details for batch 662",
		"What is the total weight for Angus Scheme?",
		"Find batches mentioned in notes about contamination issues"
	];

	async function handleSubmit() {
		if (!prompt.trim()) return;
		isLoading = true;
		error = null;
		result = null;

		try {
			const response = await fetch('/api/ai-query', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt })
			});

			const data = await response.json();

			if (response.ok) {
				result = data;
			} else {
				error = data.error || 'An unknown error occurred.';
			}
		} catch (e) {
			error = 'Failed to connect to the server.';
		} finally {
			isLoading = false;
		}
	}

	function setPrompt(p: string) {
		prompt = p;
	}
</script>

<div class="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 flex flex-col items-center">
	<div class="w-full max-w-3xl space-y-8">
		<div class="text-center space-y-2">
			<div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-2">
				ViewOps Micro-MVP
			</div>
			<h1 class="text-4xl font-bold tracking-tight text-slate-900">Operational Intelligence</h1>
			<p class="text-slate-500 text-lg">
				Query structured data and semantic notes safely. AI routes, Database answers.
			</p>
		</div>

		<div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6 space-y-4">
			<form onsubmit={handleSubmit} class="flex gap-2">
				<input
					type="text"
					bind:value={prompt}
					placeholder="Ask about batches, yields, or search notes..."
					class="flex-1 block w-full rounded-md border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border outline-none transition-all focus:ring-2"
				/>
				<button
					type="submit"
					disabled={isLoading || !prompt.trim()}
					class="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{#if isLoading}
						<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Routing...
					{:else}
						Ask ViewOps
					{/if}
				</button>
			</form>

			<div class="flex flex-wrap gap-2">
				{#each samplePrompts as sample}
					<button 
						onclick={() => setPrompt(sample)}
						class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-md transition-colors cursor-pointer border border-slate-200"
					>
						{sample}
					</button>
				{/each}
			</div>
		</div>

		{#if isLoading}
			<div class="flex justify-center py-12" in:fade>
				<div class="flex items-center space-x-2 text-slate-400 animate-pulse">
					<div class="w-2 h-2 bg-current rounded-full"></div>
					<div class="w-2 h-2 bg-current rounded-full animation-delay-200"></div>
					<div class="w-2 h-2 bg-current rounded-full animation-delay-400"></div>
					<span class="text-sm font-medium ml-2">Selecting tool & querying DB...</span>
				</div>
			</div>
		{:else if result}
			<div class="space-y-4" in:fly={{ y: 20, duration: 400 }}>
				
				<div class="bg-slate-800 rounded-lg p-4 text-slate-200 text-sm font-mono border border-slate-700 shadow-sm relative overflow-hidden group">
					<div class="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-bl uppercase font-bold tracking-wider opacity-75">AI Router Audit</div>
					<div class="grid grid-cols-[120px_1fr] gap-2">
						<span class="text-slate-400">Tool Selected:</span>
						<span class="text-green-400 font-semibold">{result.intent.toolUsed}</span>
						
						<span class="text-slate-400">Parameters:</span>
						<span>{JSON.stringify(result.intent.parameters)}</span>
					</div>
				</div>

				<div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
					<div class="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
						<h3 class="text-sm font-semibold text-slate-700">Database Response (Gold Layer)</h3>
						<span class="text-xs text-slate-500">Source: PostgreSQL</span>
					</div>
					<div class="p-4 bg-slate-50/50 overflow-x-auto">
						<pre class="text-sm text-slate-800 font-mono whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
					</div>
				</div>
			</div>
		{/if}

		{#if error}
			<div class="rounded-md bg-red-50 p-4 border border-red-200" in:fade>
				<div class="flex">
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">Request Failed</h3>
						<div class="mt-2 text-sm text-red-700">
							<p>{error}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.animation-delay-200 { animation-delay: 0.2s; }
	.animation-delay-400 { animation-delay: 0.4s; }
</style>