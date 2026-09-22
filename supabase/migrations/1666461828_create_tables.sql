CREATE TABLE IF NOT EXISTS public.user (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

REVOKE ALL ON public.user FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user TO service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
    INSERT INTO public.user (id, email) VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.ontology (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    collaborators integer NOT NULL DEFAULT 0,
    is_default boolean NOT NULL DEFAULT false,
    CONSTRAINT ontology_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.ontology OWNER to postgres;
GRANT ALL ON TABLE public.ontology TO anon;
GRANT ALL ON TABLE public.ontology TO authenticated;
GRANT ALL ON TABLE public.ontology TO postgres;
GRANT ALL ON TABLE public.ontology TO service_role;

CREATE TABLE IF NOT EXISTS public.ontology_access (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    ontology_id uuid NOT NULL,
    is_owner boolean NOT NULL DEFAULT false,
    is_demo boolean NOT NULL DEFAULT false,
    CONSTRAINT ontology_access_pkey PRIMARY KEY (id),
    CONSTRAINT ontology_access_user_id_ontology_id_key UNIQUE (user_id, ontology_id),
    CONSTRAINT ontology_access_ontology_id_fkey FOREIGN KEY (ontology_id) REFERENCES public.ontology (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.ontology_access OWNER to postgres;
GRANT ALL ON TABLE public.ontology_access TO anon;
GRANT ALL ON TABLE public.ontology_access TO authenticated;
GRANT ALL ON TABLE public.ontology_access TO postgres;
GRANT ALL ON TABLE public.ontology_access TO service_role;

CREATE INDEX IF NOT EXISTS ontology_access_ontology_id_user_id_idx
    ON public.ontology_access (ontology_id, user_id);

CREATE TABLE IF NOT EXISTS public.ontology_concept (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    ontology_id uuid NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    code character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT ontology_concept_pkey PRIMARY KEY (id),
    CONSTRAINT ontology_concept_ontology_id_fkey FOREIGN KEY (ontology_id) REFERENCES public.ontology (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.ontology_concept OWNER to postgres;
GRANT ALL ON TABLE public.ontology_concept TO anon;
GRANT ALL ON TABLE public.ontology_concept TO authenticated;
GRANT ALL ON TABLE public.ontology_concept TO postgres;
GRANT ALL ON TABLE public.ontology_concept TO service_role;

CREATE TABLE IF NOT EXISTS public.workspace (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    collaborators integer NOT NULL DEFAULT 0,
    CONSTRAINT workspace_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.workspace OWNER to postgres;
GRANT ALL ON TABLE public.workspace TO anon;
GRANT ALL ON TABLE public.workspace TO authenticated;
GRANT ALL ON TABLE public.workspace TO postgres;
GRANT ALL ON TABLE public.workspace TO service_role;

CREATE TABLE IF NOT EXISTS public.workspace_access (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    is_owner boolean NOT NULL DEFAULT false,
    is_demo boolean NOT NULL DEFAULT false,
    CONSTRAINT workspace_access_pkey PRIMARY KEY (id),
    CONSTRAINT workspace_access_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.workspace_access OWNER to postgres;
GRANT ALL ON TABLE public.workspace_access TO anon;
GRANT ALL ON TABLE public.workspace_access TO authenticated;
GRANT ALL ON TABLE public.workspace_access TO postgres;
GRANT ALL ON TABLE public.workspace_access TO service_role;

CREATE INDEX IF NOT EXISTS workspace_access_workspace_id_user_id_idx
    ON public.workspace_access (workspace_id, user_id);

CREATE INDEX IF NOT EXISTS workspace_access_demo_workspace_id_idx
    ON public.workspace_access (workspace_id)
    WHERE is_demo = true;

CREATE TABLE IF NOT EXISTS public.workspace_document (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    workspace_id uuid NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    content_tsv tsvector GENERATED ALWAYS AS (
        to_tsvector('english', left(coalesce(name, '') || ' ' || coalesce(content, ''), 500000))
    ) STORED,
    CONSTRAINT workspace_document_pkey PRIMARY KEY (id),
    CONSTRAINT workspace_document_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.workspace_document OWNER to postgres;
GRANT ALL ON TABLE public.workspace_document TO anon;
GRANT ALL ON TABLE public.workspace_document TO authenticated;
GRANT ALL ON TABLE public.workspace_document TO postgres;
GRANT ALL ON TABLE public.workspace_document TO service_role;

CREATE INDEX IF NOT EXISTS workspace_document_content_tsv_idx
    ON public.workspace_document
    USING GIN (content_tsv);

CREATE INDEX IF NOT EXISTS workspace_document_workspace_id_idx
    ON public.workspace_document (workspace_id);

CREATE TABLE IF NOT EXISTS public.workspace_config (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    workspace_id uuid NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT workspace_config_pkey PRIMARY KEY (id),
    CONSTRAINT workspace_config_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.workspace_config OWNER to postgres;
GRANT ALL ON TABLE public.workspace_config TO anon;
GRANT ALL ON TABLE public.workspace_config TO authenticated;
GRANT ALL ON TABLE public.workspace_config TO postgres;
GRANT ALL ON TABLE public.workspace_config TO service_role;

CREATE TABLE IF NOT EXISTS public.workspace_guideline (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    workspace_id uuid NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT workspace_guideline_pkey PRIMARY KEY (id),
    CONSTRAINT workspace_guideline_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.workspace_guideline OWNER to postgres;
GRANT ALL ON TABLE public.workspace_guideline TO anon;
GRANT ALL ON TABLE public.workspace_guideline TO authenticated;
GRANT ALL ON TABLE public.workspace_guideline TO postgres;
GRANT ALL ON TABLE public.workspace_guideline TO service_role;

CREATE TABLE IF NOT EXISTS public.workspace_annotation (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    workspace_id uuid NOT NULL,
    document_id uuid NOT NULL,
    entity character varying(50) COLLATE pg_catalog."default" NOT NULL,
    start_index integer NOT NULL,
    end_index integer NOT NULL,
    attributes jsonb NOT NULL DEFAULT '{}' :: jsonb,
    text text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT workspace_annotation_pkey PRIMARY KEY (id),
    CONSTRAINT workspace_annotation_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT workspace_annotation_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.workspace_document (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.workspace_annotation OWNER to postgres;
GRANT ALL ON TABLE public.workspace_annotation TO anon;
GRANT ALL ON TABLE public.workspace_annotation TO authenticated;
GRANT ALL ON TABLE public.workspace_annotation TO postgres;
GRANT ALL ON TABLE public.workspace_annotation TO service_role;

CREATE INDEX IF NOT EXISTS workspace_annotation_document_id_idx
    ON public.workspace_annotation (document_id);

CREATE INDEX IF NOT EXISTS workspace_annotation_workspace_id_idx
    ON public.workspace_annotation (workspace_id);

CREATE TABLE IF NOT EXISTS public.workspace_ontology (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    workspace_id uuid NOT NULL,
    ontology_id uuid NOT NULL,
    CONSTRAINT workspace_ontology_pkey PRIMARY KEY (id),
    CONSTRAINT workspace_ontology_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT workspace_ontology_ontology_id_fkey FOREIGN KEY (ontology_id) REFERENCES public.ontology (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.workspace_ontology OWNER to postgres;
GRANT ALL ON TABLE public.workspace_ontology TO anon;
GRANT ALL ON TABLE public.workspace_ontology TO authenticated;
GRANT ALL ON TABLE public.workspace_ontology TO postgres;
GRANT ALL ON TABLE public.workspace_ontology TO service_role;

CREATE INDEX IF NOT EXISTS workspace_ontology_ontology_id_idx
    ON public.workspace_ontology (ontology_id);

CREATE TABLE IF NOT EXISTS public.workspace_model (
    workspace_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    base_url text NOT NULL,
    model text NOT NULL,
    api_key_ciphertext text NOT NULL,
    api_key_last4 character varying(4) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT workspace_model_pkey PRIMARY KEY (workspace_id),
    CONSTRAINT workspace_model_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
);

ALTER TABLE IF EXISTS public.workspace_model OWNER to postgres;

GRANT ALL ON TABLE public.workspace_model TO postgres;
GRANT ALL ON TABLE public.workspace_model TO service_role;

REVOKE ALL ON TABLE public.workspace_model FROM anon;
REVOKE ALL ON TABLE public.workspace_model FROM authenticated;

GRANT SELECT (
    workspace_id,
    created_at,
    updated_at,
    base_url,
    model,
    api_key_last4
) ON public.workspace_model TO authenticated;

CREATE TABLE IF NOT EXISTS public.workspace_annotation_feedback (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    workspace_id uuid NOT NULL,
    document_id uuid NOT NULL,
    user_id uuid,
    action text NOT NULL,
    source text NOT NULL DEFAULT 'document_suggest',
    suggestion_id uuid,
    annotation_id uuid,
    suggested jsonb NOT NULL,
    accepted jsonb,
    model text,
    model_base_url text,
    CONSTRAINT workspace_annotation_feedback_pkey PRIMARY KEY (id),
    CONSTRAINT workspace_annotation_feedback_action_check CHECK (action IN ('accept', 'reject', 'edit')),
    CONSTRAINT workspace_annotation_feedback_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT workspace_annotation_feedback_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.workspace_document (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT workspace_annotation_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE SET NULL,
    CONSTRAINT workspace_annotation_feedback_annotation_id_fkey FOREIGN KEY (annotation_id) REFERENCES public.workspace_annotation (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE SET NULL
);

ALTER TABLE IF EXISTS public.workspace_annotation_feedback OWNER to postgres;

GRANT ALL ON TABLE public.workspace_annotation_feedback TO postgres;
GRANT ALL ON TABLE public.workspace_annotation_feedback TO service_role;
GRANT ALL ON TABLE public.workspace_annotation_feedback TO anon;
GRANT ALL ON TABLE public.workspace_annotation_feedback TO authenticated;

CREATE INDEX IF NOT EXISTS workspace_annotation_feedback_workspace_id_created_at_idx
    ON public.workspace_annotation_feedback (workspace_id, created_at);

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
