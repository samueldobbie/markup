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

CREATE INDEX IF NOT EXISTS workspace_annotation_feedback_workspace_id_created_at_idx
    ON public.workspace_annotation_feedback (workspace_id, created_at);

ALTER TABLE public.workspace_annotation_feedback ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.workspace_annotation_feedback TO postgres;
GRANT ALL ON TABLE public.workspace_annotation_feedback TO service_role;
GRANT ALL ON TABLE public.workspace_annotation_feedback TO anon;
GRANT ALL ON TABLE public.workspace_annotation_feedback TO authenticated;

CREATE POLICY "Enable all workspace_annotation_feedback actions based on user_id"
ON public.workspace_annotation_feedback
AS PERMISSIVE FOR ALL
TO public
USING (
    EXISTS (
        SELECT 1
        FROM workspace_access
        WHERE
            (
                public.workspace_access.user_id = auth.uid()
                AND public.workspace_access.workspace_id = public.workspace_annotation_feedback.workspace_id
            )
            OR public.workspace_access.is_demo = true
    )
)
WITH CHECK (true);
