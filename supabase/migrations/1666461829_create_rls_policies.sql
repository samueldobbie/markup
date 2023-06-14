CREATE POLICY "Enable all workspace_access actions based on user_id" ON public.workspace_access AS PERMISSIVE FOR ALL TO public USING (
  auth.uid() = user_id
  or public.workspace_access.is_demo = true
) WITH CHECK (true);

CREATE POLICY "Enable select for workspaces based on user access" ON public.workspace AS PERMISSIVE FOR
SELECT
  TO public USING (
    EXISTS (
      SELECT
        1
      FROM
        workspace_access
      WHERE
        (
          public.workspace_access.user_id = auth.uid()
          AND public.workspace_access.workspace_id = public.workspace.id
        )
        OR public.workspace_access.is_demo = true
    )
  );

CREATE POLICY "Enable update for workspaces based on user access" ON public.workspace AS PERMISSIVE FOR
UPDATE
  TO public USING (
    EXISTS (
      SELECT
        1
      FROM
        workspace_access
      WHERE
        (
          public.workspace_access.user_id = auth.uid()
          AND public.workspace_access.workspace_id = public.workspace.id
        )
    )
  ) WITH CHECK (true);

CREATE POLICY "Enable delete for workspaces based on user access" ON public.workspace AS PERMISSIVE FOR DELETE TO public USING (
  EXISTS (
    SELECT
      1
    FROM
      workspace_access
    WHERE
      (
        public.workspace_access.user_id = auth.uid()
        AND public.workspace_access.workspace_id = public.workspace.id
      )
  )
);

CREATE POLICY "Enable insert for authenticated users" ON public.workspace AS PERMISSIVE FOR
INSERT
  TO public WITH CHECK (true);

CREATE POLICY "Enable all workspace_document actions based on user_id" ON public.workspace_document AS PERMISSIVE FOR ALL TO public USING (
  EXISTS (
    SELECT
      1
    FROM
      workspace_access
    WHERE
      (
        public.workspace_access.user_id = auth.uid()
        AND public.workspace_access.workspace_id = public.workspace_document.workspace_id
      )
      OR public.workspace_access.is_demo = true
  )
) WITH CHECK (true);

CREATE POLICY "Enable all workspace_ontology actions based on user_id" ON public.workspace_ontology AS PERMISSIVE FOR ALL TO public USING (
  EXISTS (
    SELECT
      1
    FROM
      workspace_access
    WHERE
      (
        public.workspace_access.user_id = auth.uid()
        AND public.workspace_access.workspace_id = public.workspace_ontology.workspace_id
      )
      OR public.workspace_access.is_demo = true
  )
) WITH CHECK (true);

-- Workspace Config
CREATE POLICY "Enable all workspace_config actions based on user_id" ON public.workspace_config AS PERMISSIVE FOR ALL TO public USING (
  EXISTS (
    SELECT
      1
    FROM
      workspace_access
    WHERE
      (
        public.workspace_access.user_id = auth.uid()
        AND public.workspace_access.workspace_id = public.workspace_config.workspace_id
      )
      OR public.workspace_access.is_demo = true
  )
) WITH CHECK (true);

CREATE POLICY "Enable all workspace_annotation actions based on user_id" ON public.workspace_annotation AS PERMISSIVE FOR ALL TO public USING (
  EXISTS (
    SELECT
      1
    FROM
      workspace_access
    WHERE
      (
        public.workspace_access.user_id = auth.uid()
        AND public.workspace_access.workspace_id = public.workspace_annotation.workspace_id
      )
      OR public.workspace_access.is_demo = true
  )
) WITH CHECK (true);

CREATE POLICY "Enable all workspace_guideline actions based on user_id" ON public.workspace_guideline AS PERMISSIVE FOR ALL TO public USING (
  EXISTS (
    SELECT
      1
    FROM
      workspace_access
    WHERE
      (
        public.workspace_access.user_id = auth.uid()
        AND public.workspace_access.workspace_id = public.workspace_guideline.workspace_id
      )
      OR public.workspace_access.is_demo = true
  )
) WITH CHECK (true);

CREATE POLICY "Enable all ontology_access actions based on user_id" ON public.ontology_access AS PERMISSIVE FOR ALL TO public USING (
  auth.uid() = user_id
  OR public.ontology_access.is_demo = true
) WITH CHECK (true);

CREATE POLICY "Enable select for ontologies based on user access" ON public.ontology AS PERMISSIVE FOR
SELECT
  TO public USING (
    EXISTS (
      SELECT
        1
      FROM
        ontology_access
      WHERE
        (
          public.ontology_access.user_id = auth.uid()
          AND public.ontology_access.ontology_id = public.ontology.id
        )
        OR public.ontology_access.is_demo = true
    )
  );

CREATE POLICY "Enable update for ontologies based on user access" ON public.ontology AS PERMISSIVE FOR
UPDATE
  TO public USING (
    EXISTS (
      SELECT
        1
      FROM
        ontology_access
      WHERE
        (
          public.ontology_access.user_id = auth.uid()
          AND public.ontology_access.ontology_id = public.ontology.id
        )
    )
  ) WITH CHECK (true);

CREATE POLICY "Enable delete for ontologies based on user access" ON public.ontology AS PERMISSIVE FOR DELETE TO public USING (
  EXISTS (
    SELECT
      1
    FROM
      ontology_access
    WHERE
      (
        public.ontology_access.user_id = auth.uid()
        AND public.ontology_access.ontology_id = public.ontology.id
      )
  )
);

CREATE POLICY "Enable insert for authenticated users" ON public.ontology AS PERMISSIVE FOR
INSERT
  TO public WITH CHECK (true);

CREATE POLICY "Enable all ontology_concept actions based on user_id" ON public.ontology_concept AS PERMISSIVE FOR ALL TO public USING (
  EXISTS (
    SELECT
      1
    FROM
      ontology_access
    WHERE
      (
        public.ontology_access.user_id = auth.uid()
        AND public.ontology_access.ontology_id = public.ontology_concept.ontology_id
      )
      OR public.ontology_access.is_demo = true
  )
) WITH CHECK (true);
