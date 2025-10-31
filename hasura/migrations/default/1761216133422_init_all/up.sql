SET check_function_bodies = false;
CREATE TABLE public.batch_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    batch_id uuid,
    note_content text NOT NULL,
    embedding public.vector(1536)
);
CREATE FUNCTION public.search_batch_notes(query_vector public.vector, match_threshold text, match_count integer) RETURNS SETOF public.batch_notes
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM batch_notes
  WHERE 1 - (batch_notes.embedding <=> query_vector) > match_threshold::float8
  ORDER BY batch_notes.embedding <=> query_vector
  LIMIT match_count;
END;
$$;
CREATE TABLE public.batches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    batch_number integer NOT NULL,
    scheme text NOT NULL,
    kill_date date NOT NULL,
    cost_per_kg numeric(10,2),
    cold_weight_kg numeric(10,2),
    yield_percentage numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE ONLY public.batch_notes
    ADD CONSTRAINT batch_notes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.batch_notes
    ADD CONSTRAINT batch_notes_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id);
