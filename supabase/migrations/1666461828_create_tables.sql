CREATE TABLE IF NOT EXISTS public.user (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

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

CREATE TABLE IF NOT EXISTS public.workspace_document (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    workspace_id uuid NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT workspace_document_pkey PRIMARY KEY (id),
    CONSTRAINT workspace_document_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.workspace_document OWNER to postgres;
GRANT ALL ON TABLE public.workspace_document TO anon;
GRANT ALL ON TABLE public.workspace_document TO authenticated;
GRANT ALL ON TABLE public.workspace_document TO postgres;
GRANT ALL ON TABLE public.workspace_document TO service_role;

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

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
    INSERT INTO public.user (id, email) VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

REVOKE ALL ON public.user FROM anon, authenticated;
