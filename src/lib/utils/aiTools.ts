/** @file src/lib/utils/tools.ts  */
import type { ChatCompletionTool } from "openai/resources/index.mjs";

export const availableTools: ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'get_batch_details',
            description: 'Get detailed deterministic information for a specific batch (yield, cost, scheme) using its human-readable batch number (e.g., 662).',
            parameters: {
                type: 'object',
                properties: {
                    batch_number: {
                        type: 'integer',
                        description: 'The human-readable number for the batch, e.g., 662, 663'
                    }
                },
                required: ['batch_number']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_total_weight_by_scheme',
            description: 'Calculate the total cold weight killed for a specific scheme.',
            parameters: {
                type: 'object',
                properties: {
                    scheme: {
                        type: 'string',
                        description: "The name of the scheme, e.g., 'Angus Scheme', 'Native Breed'"
                    }
                },
                required: ['scheme']
            }
        }
    },
    {
        // Semantic search
        type: 'function',
        function: {
            name: 'search_operational_notes',
            description: 'Semantically search through unstructured operational notes, issues, or vet comments to find relevant batches based on a vague description.',
            parameters: {
                type: 'object',
                properties: {
                    search_query: {
                        type: 'string',
                        description: "The semantic topic to search for, e.g., 'contamination issues', 'high fat content'"
                    }
                },
                required: ['search_query']
            }
        }
    }
];