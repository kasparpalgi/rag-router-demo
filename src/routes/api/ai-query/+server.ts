/** @file src/routes/api/ai-query/+server.ts  */
import { GET_BATCH_BY_NUMBER, GET_WEIGHT_BY_SCHEME, SEARCH_NOTES } from '$lib/graphql/queries';
import { json, type RequestHandler } from '@sveltejs/kit';
import { executeHasuraQuery, generateEmbedding, openai } from '$lib/server/api';
import { availableTools } from '$lib/utils/aiTools';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { prompt } = await request.json();

		if (!prompt) return json({ error: 'Prompt is required' }, { status: 400 });

		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini', // TODO: can comprare here eg. gtp-5-mini & switch to AI SDK to easy switch between models / have more tools out of the box
			temperature: 0,
			messages: [
				{
					role: 'system',
					content: `You are ViewOps, an intelligent interface for operational data. 
                    Analyze the user prompt and select the appropriate tool. 
                    Do not guess parameters; extract them precisely from the prompt.`
				},
				{ role: 'user', content: prompt }
			],
			tools: availableTools,
			tool_choice: 'required'
		});

		const toolCall = response.choices[0].message.tool_calls?.[0];

		if (!toolCall) {
			return json(
				{ error: "I couldn't determine which operational tool to use for that request." },
				{ status: 400 }
			);
		}

		if (toolCall.type !== 'function') {
			return json({ error: `Unsupported tool type: ${toolCall.type}` }, { status: 400 });
		}
		const toolName = toolCall.function.name;
		const args = JSON.parse(toolCall.function.arguments);
		let data;

		switch (toolName) {
			case 'get_batch_details':
				data = await executeHasuraQuery(GET_BATCH_BY_NUMBER, {
					batch_number: args.batch_number
				});
				break;

			case 'get_total_weight_by_scheme':
				data = await executeHasuraQuery(GET_WEIGHT_BY_SCHEME, {
					scheme: `%${args.scheme}%`
				});
				break;

			case 'search_operational_notes':
				const embedding = await generateEmbedding(args.search_query);
				const vectorString = JSON.stringify(embedding);

				const variables = {
					query_vector: vectorString,
					match_threshold: '0.3', // TODO: test'n'try - bring to UI settings
					match_count: 3
				};

				data = await executeHasuraQuery(SEARCH_NOTES, variables);
				break;

			default:
				return json(
					{ error: `Tool '${toolName}' is not implemented internally.` },
					{ status: 501 }
				);
		}

		return json({
			success: true,
			intent: {
				toolUsed: toolName,
				parameters: args
			},
			data: data
		});
	} catch (err) {
		console.error('API Error:', err);
		const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
		return json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
	}
};
