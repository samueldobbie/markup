drop extension if exists "pg_net";

alter table "public"."ontology" enable row level security;

alter table "public"."ontology_access" enable row level security;

alter table "public"."ontology_concept" enable row level security;

alter table "public"."user" enable row level security;

alter table "public"."workspace" enable row level security;

alter table "public"."workspace_access" enable row level security;

alter table "public"."workspace_annotation" enable row level security;

alter table "public"."workspace_config" enable row level security;

alter table "public"."workspace_document" enable row level security;

alter table "public"."workspace_guideline" enable row level security;

alter table "public"."workspace_ontology" enable row level security;

grant delete on table "public"."user" to "service_role";

grant insert on table "public"."user" to "service_role";

grant select on table "public"."user" to "service_role";

grant update on table "public"."user" to "service_role";


