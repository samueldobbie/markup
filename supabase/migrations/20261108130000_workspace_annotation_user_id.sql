ALTER TABLE public.workspace_annotation
    ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE public.workspace_annotation
    DROP CONSTRAINT IF EXISTS workspace_annotation_user_id_fkey;

ALTER TABLE public.workspace_annotation
    ADD CONSTRAINT workspace_annotation_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS workspace_annotation_workspace_id_user_id_idx
    ON public.workspace_annotation (workspace_id, user_id);

CREATE OR REPLACE FUNCTION private.set_workspace_annotation_user_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF coalesce(auth.role(), '') NOT IN ('anon', 'authenticated') THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        NEW.user_id := auth.uid();
    ELSE
        NEW.user_id := OLD.user_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workspace_annotation_set_user_id ON public.workspace_annotation;

CREATE TRIGGER workspace_annotation_set_user_id
BEFORE INSERT OR UPDATE ON public.workspace_annotation
FOR EACH ROW EXECUTE FUNCTION private.set_workspace_annotation_user_id();

NOTIFY pgrst, 'reload schema';
