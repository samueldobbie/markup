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
        NEW.workspace_id := OLD.workspace_id;
        NEW.document_id := OLD.document_id;
    END IF;

    RETURN NEW;
END;
$$;
