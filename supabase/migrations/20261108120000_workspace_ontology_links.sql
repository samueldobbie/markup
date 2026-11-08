DELETE FROM public.workspace_ontology a
USING public.workspace_ontology b
WHERE a.workspace_id = b.workspace_id
  AND a.ontology_id = b.ontology_id
  AND (a.created_at, a.id) > (b.created_at, b.id);

ALTER TABLE public.workspace_ontology
    ADD CONSTRAINT workspace_ontology_workspace_id_ontology_id_key UNIQUE (workspace_id, ontology_id);

CREATE INDEX IF NOT EXISTS ontology_concept_ontology_id_name_idx
    ON public.ontology_concept (ontology_id, name, id);
