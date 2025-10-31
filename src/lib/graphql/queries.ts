/** @file src/lib/graphql/queries.ts  */
import { BATCH_FRAGMENT } from './fragments/batch';
import { gql } from 'graphql-request';

export const GET_BATCH_BY_NUMBER = gql`
	query GetBatchByNumber($batch_number: Int!) {
		batches(where: { batch_number: { _eq: $batch_number } }) {
			...BatchFragment
		}
	}
	${BATCH_FRAGMENT}
`;

export const GET_WEIGHT_BY_SCHEME = gql`
	query GetWeightByScheme($scheme: String!) {
		batches_aggregate(where: { scheme: { _ilike: $scheme } }) {
			aggregate {
				sum {
					cold_weight_kg
				}
				count
			}
		}
	}
`;

export const SEARCH_NOTES = gql`
	query SearchNotes($query_vector: vector!, $match_threshold: String!, $match_count: Int!) {
		search_batch_notes(
			args: {
				query_vector: $query_vector
				match_threshold: $match_threshold
				match_count: $match_count
			}
		) {
			note_content
			batch {
				...BatchFragment
			}
		}
	}
	${BATCH_FRAGMENT}
`;
