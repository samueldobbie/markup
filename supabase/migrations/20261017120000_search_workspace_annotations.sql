CREATE OR REPLACE FUNCTION public.search_workspace_annotations(
    p_workspace_id uuid,
    p_all text[] DEFAULT '{}',
    p_none text[] DEFAULT '{}',
    p_limit integer DEFAULT 50
)
RETURNS TABLE (
    id uuid,
    name text,
    content text,
    match_count bigint,
    annotations jsonb
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    all_paths jsonpath[];
    none_paths jsonpath[];
    result_limit integer;
BEGIN
    all_paths := coalesce(p_all, '{}')::jsonpath[];
    none_paths := coalesce(p_none, '{}')::jsonpath[];

    IF cardinality(all_paths) = 0 AND cardinality(none_paths) = 0 THEN
        RETURN;
    END IF;

    result_limit := GREATEST(1, LEAST(coalesce(p_limit, 50), 100));

    RETURN QUERY
    WITH annotation AS (
        SELECT
            a.id,
            a.document_id,
            a.entity,
            a.text,
            a.start_index,
            a.end_index,
            a.attributes,
            jsonb_build_object('entity', a.entity, 'text', a.text, 'attributes', a.attributes) AS item
        FROM public.workspace_annotation a
        WHERE a.workspace_id = p_workspace_id
    ),
    matched AS (
        SELECT
            an.document_id,
            jsonb_agg(
                jsonb_build_object(
                    'id', an.id,
                    'entity', an.entity,
                    'text', an.text,
                    'start', an.start_index,
                    'end', an.end_index,
                    'attributes', an.attributes
                )
                ORDER BY an.start_index
            ) AS annotations,
            count(*) AS match_count
        FROM annotation an
        WHERE EXISTS (
            SELECT 1 FROM unnest(all_paths) q WHERE jsonb_path_exists(an.item, q, '{}', true)
        )
        GROUP BY an.document_id
    )
    SELECT
        d.id,
        d.name,
        d.content,
        coalesce(m.match_count, 0) AS match_count,
        coalesce(m.annotations, '[]'::jsonb) AS annotations
    FROM public.workspace_document d
    LEFT JOIN matched m ON m.document_id = d.id
    WHERE d.workspace_id = p_workspace_id
      AND NOT EXISTS (
          SELECT 1
          FROM unnest(all_paths) q
          WHERE NOT EXISTS (
              SELECT 1
              FROM annotation an
              WHERE an.document_id = d.id
                AND jsonb_path_exists(an.item, q, '{}', true)
          )
      )
      AND NOT EXISTS (
          SELECT 1
          FROM annotation an, unnest(none_paths) q
          WHERE an.document_id = d.id
            AND jsonb_path_exists(an.item, q, '{}', true)
      )
    ORDER BY coalesce(m.match_count, 0) DESC, d.name
    LIMIT result_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.search_workspace_annotations(uuid, text[], text[], integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.search_workspace_annotations(uuid, text[], text[], integer) FROM anon;
REVOKE ALL ON FUNCTION public.search_workspace_annotations(uuid, text[], text[], integer) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.search_workspace_annotations(uuid, text[], text[], integer) TO postgres;
GRANT EXECUTE ON FUNCTION public.search_workspace_annotations(uuid, text[], text[], integer) TO service_role;
