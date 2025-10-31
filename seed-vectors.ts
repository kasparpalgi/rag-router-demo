// TODO: remove (needed just to seed the demo data)
import { generateEmbedding, executeHasuraQuery } from './script-api';
import { gql } from 'graphql-request';

const notesToSeed = [
	{
		batch_id: '1a4f09f6-125d-48ee-a5a2-d1e13f035d5c', // Batch 662
		content:
			'Quality control flagged a potential bacterial contamination issue during the boning process for this batch.'
	},
	{
		batch_id: '2b5f09f6-125d-48ee-a5a2-d1e13f035d5d', // Batch 663
		content:
			'The overall yield was slightly lower than expected due to higher than average fat content on the carcasses.'
	},
	{
		batch_id: '3c6f09f6-125d-48ee-a5a2-d1e13f035d5e', // Batch 664
		content:
			'Vet report indicates several animals had minor liver fluke, but all were cleared for processing.'
	}
];

const INSERT_NOTE_MUTATION = gql`
	mutation InsertBatchNote($batch_id: uuid!, $content: String!, $embedding: vector!) {
		insert_batch_notes_one(
			object: { batch_id: $batch_id, note_content: $content, embedding: $embedding }
		) {
			id
		}
	}
`;

async function seedDatabase() {
	for (const note of notesToSeed) {
		console.log(`note/batch: ${note.batch_id}`);
		const embedding = await generateEmbedding(note.content);
		const vectorString = JSON.stringify(embedding);

		try {
			await executeHasuraQuery(INSERT_NOTE_MUTATION, {
				batch_id: note.batch_id,
				content: note.content,
				embedding: vectorString
			});
		} catch (error) {
			console.error(error);
		}
	}

	console.log('done');
}

seedDatabase();
