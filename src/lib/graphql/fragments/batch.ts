/** @file src/lib/graphql/fragments/batch.ts */
import { gql } from 'graphql-request';

export const BATCH_FRAGMENT = gql`
    fragment BatchFragment on batches {
        id
        batch_number
        scheme
        kill_date
        cost_per_kg
        cold_weight_kg
        yield_percentage
    }
`;
