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

ALTER TABLE public.workspace_model ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Enable select workspace_model based on user access"
ON public.workspace_model
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM workspace_access
        WHERE
            public.workspace_access.user_id = auth.uid()
            AND public.workspace_access.workspace_id = public.workspace_model.workspace_id
    )
);
