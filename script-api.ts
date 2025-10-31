// TODO: delete client for seeding
import { GraphQLClient } from 'graphql-request';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

if (!OPENAI_API_KEY || !HASURA_ENDPOINT || !HASURA_ADMIN_SECRET) {
	throw new Error('Missing envs');
}

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const client = new GraphQLClient(HASURA_ENDPOINT, {
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
		console.error(error);
		throw new Error('DB fetch error');
	}
}

export async function generateEmbedding(text: string): Promise<number[]> {
	const response = await openai.embeddings.create({
		model: 'text-embedding-3-small',
		input: text,
		encoding_format: 'float'
	});
	return response.data[0].embedding;
}
