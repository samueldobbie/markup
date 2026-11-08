WITH owners AS (
    SELECT DISTINCT ON (wa.workspace_id) wa.workspace_id, wa.user_id
    FROM public.workspace_access wa
    JOIN public."user" u ON u.id = wa.user_id
    WHERE wa.is_owner = true
    ORDER BY wa.workspace_id, wa.created_at, wa.id
)
UPDATE public.workspace_annotation a
SET user_id = owners.user_id
FROM owners
WHERE owners.workspace_id = a.workspace_id
  AND a.user_id IS NULL;
