# ViewOps - Micro-MVP

Functional prototype (folowing [the spec](https://early-fine-bb3.notion.site/ViewOps-Careers-2842fec967b180a69c81e66784ae4d5f)) demonstrating the core concept of the ViewOps project: an AI interface that connects internal operational data to large language models for safe, accurate, and role-aware querying.

The guiding principle, as understood from the initial brief, is that **the AI does not invent answers - it finds them.**

This is achieved through a hybrid approach:
1.  **Deterministic Routing (MVP):** For known, structured questions (e.g., "Show details for batch 662"), the AI acts as a "smart router." It analyses the user's intent and selects a predefined, our vetted GraphQL query, passing only the necessary parameters. This guarantees 100% accuracy, as the AI never touches the data directly.
2.  **Semantic Search (RAG):** For vague, unstructured questions (e.g., "Find notes about contamination issues"), the AI acts as a "research assistant." It generates a vector embedding of the query and uses `pgvector` to find the most semantically relevant unstructured data (like operator notes). This provides contextually accurate starting points for investigation without the risk of hallucination.

This demo implements **Step 1** and showcases the foundation for **Steps 2 & 4** of the project's roadmap, proving the viability of the core architecture.

## Examples

### Example 1:  The deterministic query

In the top part, I am asking one of the three demo questions: "Show me details for batch 662". When I ask for details on a specific batch, the AI acts as a smart router.

![Batch details](static/demo/batch_details.png)

In the black middle part, we can see the audit trail. OpenAI API (gpt-4o-mini) has identified the correct "get_batch_details" tool and has extracted the parameter "batch_number" 662.​  It doesn't touch the data itself.

Finally, the bottom white background area is the raw JSON response from the GraphQL API via a predefined, safe GraphQL query. This is 100% accurate and fulfils the 'AI must not fail' requirement for known questions.

### Example 2: The same deterministic pattern for more complex questions (aggregations)

Here, the AI correctly chose the "get_total_weight_by_scheme" tool. And again, the calculation is done safely inside the database, not by the AI, giving us a trustworthy summary of the total weight and count for that scheme.

![Total weight](static/demo/total_weight.png)

### Example 3: The semantic search

In this example, I demo how the real power comes when we have vague, unstructured information. Let's say I don't know a batch number, but I've heard about a contamination issue. In the "AI Router Audit" box this time, the AI is smart enough to know this isn't a simple lookup. The cheap model selects correctly the "search_operational_notes" tool. 

![Contamination issues](static/demo/contamination_issues.png)

And at the bottom, you can see the result. On the backend, created a vector embedding of my query and used pgvector to find the most semantically similar note in the database. It found the note about 'bacterial contamination' and, through the database relationship, it automatically joined and displayed the full, structured data for the associated batch, Batch 662. So successfully was a vague human concern was connected directly to a hard, actionable data record."

Demo data that was used:

![Hasura](static/demo/hasura.png)

### Tech Stack

-   **Frontend:** SvelteKit (wouldn't do it that fast with Next), TypeScript, Tailwind
-   **Backend API:** Node (can use LAravel as it was my go to framework before I switched to Node and TS years ago)
-   **AI:** OpenAI GPT-4o-mini for tool selection and embedding generation
-   **Database:** PostgreSQL with the `pgvector`
-   **Data Layer:** Hasura GraphQL API engine

## Local Setup

### Prerequisites

-   Node.js
-   Docker & Docker compose
-   OpenAI API Key

### 1. Initial configuration

First, clone and setup env for the front:

```bash
git clone https://github.com/kasparpalgi/view-ops.git
npm install
cp .env.example .env
```

Update the `.env` and add your `OPENAI_API_KEY` and come up with a cecure password for Hasura.

### 2. Launch PostgreSQL & Hasura

```bash
cd hasura
cp .env.example .env
```

In the `hasura/.env` create `POSTGRES_PASSWORD` and add the same Hasura admin pass you added to the root `.env`. Now start the container: `docker-compose up -d`

You can now run Hasura console by: `hasura console` command (manage tables, relations, functions, run example queries via GraphiQL, etc.)

### 3. Apply DB schema

Apply the initial DB schema, Hasura metadata & seeds (create the `batches` and `batch_notes` tables and the `search_batch_notes` function + some demo content for testing):
- `hasura migrate apply --all-databases`
- `hasura metadata apply`
- `hasura seed apply`

### 4. Seed the vector DB

Semantic search functionality requires also some demo data to search against. I jave created some thow-away code and created one-time script for sameple notes and to generate their corresponding vector embeddings using the OpenAI API.

```bash
npm run db:seed
```

This script will:
1.  Read the sample notes.
2.  Call the OpenAI API to generate a vector embedding for each note.
3.  Insert the note content and its embedding into the `batch_notes` table via a Hasura mutation.

You should see a success message in your terminal for each note processed.

### 5. Start the app

```bash
npm run dev
```

The app can be tested now at `http://localhost:5173`.