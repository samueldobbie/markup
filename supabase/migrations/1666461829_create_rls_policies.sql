ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ontology ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ontology_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ontology_concept ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_document ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_guideline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_annotation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_ontology ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_model ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_annotation_feedback ENABLE ROW LEVEL SECURITY;

CREATE SCHEMA IF NOT EXISTS private;

GRANT USAGE ON SCHEMA private TO anon, authenticated;

CREATE OR REPLACE FUNCTION private.readable_workspace_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT workspace_id
    FROM public.workspace_access
    WHERE user_id = auth.uid()
       OR is_demo = true
$$;

CREATE OR REPLACE FUNCTION private.member_workspace_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT workspace_id
    FROM public.workspace_access
    WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION private.owned_workspace_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT workspace_id
    FROM public.workspace_access
    WHERE user_id = auth.uid()
      AND is_owner = true
$$;

CREATE OR REPLACE FUNCTION private.is_workspace_member(p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_access
        WHERE workspace_id = p_workspace_id
          AND user_id = auth.uid()
    )
$$;

CREATE OR REPLACE FUNCTION private.is_workspace_owner(p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_access
        WHERE workspace_id = p_workspace_id
          AND user_id = auth.uid()
          AND is_owner = true
    )
$$;

CREATE OR REPLACE FUNCTION private.is_demo_workspace(p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_access
        WHERE workspace_id = p_workspace_id
          AND is_demo = true
    )
$$;

CREATE OR REPLACE FUNCTION private.workspace_has_access(p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_access
        WHERE workspace_id = p_workspace_id
    )
$$;

CREATE OR REPLACE FUNCTION private.can_read_workspace(p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT private.is_workspace_member(p_workspace_id)
        OR private.is_demo_workspace(p_workspace_id)
$$;

CREATE OR REPLACE FUNCTION private.is_ontology_owner(p_ontology_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.ontology_access
        WHERE ontology_id = p_ontology_id
          AND user_id = auth.uid()
          AND is_owner = true
    )
$$;

CREATE OR REPLACE FUNCTION private.ontology_has_access(p_ontology_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.ontology_access
        WHERE ontology_id = p_ontology_id
    )
$$;

CREATE OR REPLACE FUNCTION private.is_default_ontology(p_ontology_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.ontology
        WHERE id = p_ontology_id
          AND is_default = true
    )
$$;

CREATE OR REPLACE FUNCTION private.can_read_ontology(p_ontology_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.ontology_access
        WHERE ontology_id = p_ontology_id
          AND (user_id = auth.uid() OR is_demo = true)
    )
    OR private.is_default_ontology(p_ontology_id)
    OR EXISTS (
        SELECT 1
        FROM public.workspace_ontology
        WHERE ontology_id = p_ontology_id
          AND private.can_read_workspace(workspace_id)
    )
$$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO anon, authenticated;

CREATE POLICY "workspace_select" ON public.workspace
FOR SELECT TO public
USING (id IN (SELECT private.readable_workspace_ids()));

CREATE POLICY "workspace_insert" ON public.workspace
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "workspace_update" ON public.workspace
FOR UPDATE TO authenticated
USING (id IN (SELECT private.member_workspace_ids()))
WITH CHECK (private.is_workspace_member(id));

CREATE POLICY "workspace_delete" ON public.workspace
FOR DELETE TO authenticated
USING (id IN (SELECT private.owned_workspace_ids()));

CREATE POLICY "workspace_access_select" ON public.workspace_access
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "workspace_access_insert_owner" ON public.workspace_access
FOR INSERT TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND is_owner = true
    AND is_demo = false
    AND NOT private.workspace_has_access(workspace_id)
);

CREATE POLICY "workspace_document_select" ON public.workspace_document
FOR SELECT TO public
USING (workspace_id IN (SELECT private.readable_workspace_ids()));

CREATE POLICY "workspace_document_insert" ON public.workspace_document
FOR INSERT TO authenticated
WITH CHECK (private.is_workspace_member(workspace_id));

CREATE POLICY "workspace_document_update" ON public.workspace_document
FOR UPDATE TO authenticated
USING (workspace_id IN (SELECT private.member_workspace_ids()))
WITH CHECK (private.is_workspace_member(workspace_id));

CREATE POLICY "workspace_document_delete" ON public.workspace_document
FOR DELETE TO authenticated
USING (workspace_id IN (SELECT private.member_workspace_ids()));

CREATE POLICY "workspace_config_select" ON public.workspace_config
FOR SELECT TO public
USING (workspace_id IN (SELECT private.readable_workspace_ids()));

CREATE POLICY "workspace_config_insert" ON public.workspace_config
FOR INSERT TO authenticated
WITH CHECK (private.is_workspace_member(workspace_id));

CREATE POLICY "workspace_config_update" ON public.workspace_config
FOR UPDATE TO authenticated
USING (workspace_id IN (SELECT private.member_workspace_ids()))
WITH CHECK (private.is_workspace_member(workspace_id));

CREATE POLICY "workspace_config_delete" ON public.workspace_config
FOR DELETE TO authenticated
USING (workspace_id IN (SELECT private.member_workspace_ids()));

CREATE POLICY "workspace_guideline_select" ON public.workspace_guideline
FOR SELECT TO public
USING (workspace_id IN (SELECT private.readable_workspace_ids()));

CREATE POLICY "workspace_guideline_insert" ON public.workspace_guideline
FOR INSERT TO authenticated
WITH CHECK (private.is_workspace_member(workspace_id));

CREATE POLICY "workspace_guideline_update" ON public.workspace_guideline
FOR UPDATE TO authenticated
USING (workspace_id IN (SELECT private.member_workspace_ids()))
WITH CHECK (private.is_workspace_member(workspace_id));

CREATE POLICY "workspace_guideline_delete" ON public.workspace_guideline
FOR DELETE TO authenticated
USING (workspace_id IN (SELECT private.member_workspace_ids()));

CREATE POLICY "workspace_ontology_select" ON public.workspace_ontology
FOR SELECT TO public
USING (workspace_id IN (SELECT private.readable_workspace_ids()));

CREATE POLICY "workspace_ontology_insert" ON public.workspace_ontology
FOR INSERT TO authenticated
WITH CHECK (
    private.is_workspace_member(workspace_id)
    AND private.can_read_ontology(ontology_id)
);

CREATE POLICY "workspace_ontology_delete" ON public.workspace_ontology
FOR DELETE TO authenticated
USING (workspace_id IN (SELECT private.member_workspace_ids()));

CREATE POLICY "workspace_annotation_select" ON public.workspace_annotation
FOR SELECT TO public
USING (workspace_id IN (SELECT private.readable_workspace_ids()));

CREATE POLICY "workspace_annotation_insert" ON public.workspace_annotation
FOR INSERT TO public
WITH CHECK (
    private.can_read_workspace(workspace_id)
    AND EXISTS (
        SELECT 1
        FROM public.workspace_document
        WHERE public.workspace_document.id = document_id
          AND public.workspace_document.workspace_id = public.workspace_annotation.workspace_id
    )
);

CREATE POLICY "workspace_annotation_update" ON public.workspace_annotation
FOR UPDATE TO authenticated
USING (workspace_id IN (SELECT private.member_workspace_ids()))
WITH CHECK (private.is_workspace_member(workspace_id));

CREATE POLICY "workspace_annotation_delete" ON public.workspace_annotation
FOR DELETE TO public
USING (workspace_id IN (SELECT private.readable_workspace_ids()));

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

CREATE POLICY "workspace_annotation_feedback_select" ON public.workspace_annotation_feedback
FOR SELECT TO authenticated
USING (workspace_id IN (SELECT private.member_workspace_ids()));

CREATE POLICY "ontology_select" ON public.ontology
FOR SELECT TO public
USING (private.can_read_ontology(id));

CREATE POLICY "ontology_insert" ON public.ontology
FOR INSERT TO authenticated
WITH CHECK (is_default = false);

CREATE POLICY "ontology_update" ON public.ontology
FOR UPDATE TO authenticated
USING (private.is_ontology_owner(id))
WITH CHECK (private.is_ontology_owner(id) AND is_default = false);

CREATE POLICY "ontology_delete" ON public.ontology
FOR DELETE TO authenticated
USING (private.is_ontology_owner(id));

CREATE POLICY "ontology_access_select" ON public.ontology_access
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "ontology_access_insert" ON public.ontology_access
FOR INSERT TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND is_demo = false
    AND (
        (is_owner = true AND NOT private.ontology_has_access(ontology_id))
        OR (is_owner = false AND private.is_default_ontology(ontology_id))
    )
);

CREATE POLICY "ontology_access_delete" ON public.ontology_access
FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "ontology_concept_select" ON public.ontology_concept
FOR SELECT TO public
USING (private.can_read_ontology(ontology_id));

CREATE POLICY "ontology_concept_insert" ON public.ontology_concept
FOR INSERT TO authenticated
WITH CHECK (private.is_ontology_owner(ontology_id));

CREATE POLICY "ontology_concept_update" ON public.ontology_concept
FOR UPDATE TO authenticated
USING (private.is_ontology_owner(ontology_id))
WITH CHECK (private.is_ontology_owner(ontology_id));

CREATE POLICY "ontology_concept_delete" ON public.ontology_concept
FOR DELETE TO authenticated
USING (private.is_ontology_owner(ontology_id));
