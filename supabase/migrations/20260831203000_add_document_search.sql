ALTER TABLE public.workspace_document
    ADD COLUMN IF NOT EXISTS content_tsv tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(content, ''))
    ) STORED;

CREATE INDEX IF NOT EXISTS workspace_document_content_tsv_idx
    ON public.workspace_document
    USING GIN (content_tsv);

DROP FUNCTION IF EXISTS public.search_workspace_documents(uuid, text, integer);
DROP FUNCTION IF EXISTS public.search_workspace_documents(uuid, text, text[], integer);

CREATE OR REPLACE FUNCTION public.search_workspace_documents(
    p_workspace_id uuid,
    p_query text,
    p_keywords text[] DEFAULT NULL,
    p_limit integer DEFAULT 50
)
RETURNS TABLE (
    id uuid,
    name character varying,
    content text,
    snippet text,
    rank real
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    combined tsquery;
    keyword_query tsquery;
    keyword text;
    result_limit integer;
BEGIN
    combined := websearch_to_tsquery('english', coalesce(p_query, ''));

    IF p_keywords IS NOT NULL THEN
        FOREACH keyword IN ARRAY p_keywords LOOP
            IF keyword IS NULL OR btrim(keyword) = '' THEN
                CONTINUE;
            END IF;

            keyword_query := plainto_tsquery('english', left(keyword, 80));

            IF keyword_query = ''::tsquery THEN
                CONTINUE;
            END IF;

            IF combined = ''::tsquery THEN
                combined := keyword_query;
            ELSE
                combined := combined || keyword_query;
            END IF;
        END LOOP;
    END IF;

    IF combined = ''::tsquery THEN
        RETURN;
    END IF;

    result_limit := GREATEST(1, LEAST(coalesce(p_limit, 50), 100));

    RETURN QUERY
    SELECT
        d.id,
        d.name,
        d.content,
        ts_headline(
            'english',
            d.content,
            combined,
            'MaxWords=35, MinWords=15, StartSel=[[, StopSel=]]'
        ) AS snippet,
        ts_rank(d.content_tsv, combined) AS rank
    FROM public.workspace_document d
    WHERE d.workspace_id = p_workspace_id
      AND d.content_tsv @@ combined
    ORDER BY ts_rank(d.content_tsv, combined) DESC
    LIMIT result_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.search_workspace_documents(uuid, text, text[], integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.search_workspace_documents(uuid, text, text[], integer) FROM anon;
REVOKE ALL ON FUNCTION public.search_workspace_documents(uuid, text, text[], integer) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.search_workspace_documents(uuid, text, text[], integer) TO postgres;
GRANT EXECUTE ON FUNCTION public.search_workspace_documents(uuid, text, text[], integer) TO service_role;

NOTIFY pgrst, 'reload schema';
