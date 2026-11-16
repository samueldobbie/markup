ALTER TABLE public.workspace
    ADD COLUMN IF NOT EXISTS blind_annotation boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION private.guard_workspace_blind_annotation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.blind_annotation IS DISTINCT FROM OLD.blind_annotation
       AND coalesce(auth.role(), '') IN ('anon', 'authenticated')
       AND NOT private.is_workspace_owner(OLD.id) THEN
        RAISE EXCEPTION 'Only the workspace owner can change blind annotation'
            USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workspace_guard_blind_annotation ON public.workspace;

CREATE TRIGGER workspace_guard_blind_annotation
BEFORE UPDATE ON public.workspace
FOR EACH ROW EXECUTE FUNCTION private.guard_workspace_blind_annotation();

NOTIFY pgrst, 'reload schema';
