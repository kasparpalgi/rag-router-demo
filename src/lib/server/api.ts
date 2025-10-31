/** @file src/lib/server/api.ts  */
import { HASURA_ADMIN_SECRET, HASURA_ENDPOINT_DEV, OPENAI_API_KEY } from '$env/static/private';
import { GraphQLClient } from 'graphql-request';
import OpenAI from 'openai';

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const client = new GraphQLClient(HASURA_ENDPOINT_DEV, {
	headers: {
		'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
		'Content-Type': 'application/json'
	}
});

export async function executeHasuraQuery<T>(
	query: string,
	variables?: Record<string, any>
): Promise<T> {
	try {
		return await client.request<T>(query, variables);
	} catch (error) {
		console.error('Hasura Query Error:', error);
		throw new Error('Failed to fetch data from operational database.');
	}
}

// for vector search
export async function generateEmbedding(text: string): Promise<number[]> {
	const response = await openai.embeddings.create({
		model: 'text-embedding-3-small',
		input: text,
		encoding_format: 'float'
	});
	return response.data[0].embedding;
}
