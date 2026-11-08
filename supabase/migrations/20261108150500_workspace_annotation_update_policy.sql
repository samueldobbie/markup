DROP POLICY IF EXISTS "workspace_annotation_update" ON public.workspace_annotation;

CREATE POLICY "workspace_annotation_update" ON public.workspace_annotation
FOR UPDATE TO public
USING (workspace_id IN (SELECT private.readable_workspace_ids()))
WITH CHECK (
    private.can_read_workspace(workspace_id)
    AND EXISTS (
        SELECT 1
        FROM public.workspace_document
        WHERE public.workspace_document.id = document_id
          AND public.workspace_document.workspace_id = public.workspace_annotation.workspace_id
    )
);
