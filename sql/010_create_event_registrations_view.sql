-- 010_create_event_registrations_view.sql
-- Minimal, non-destructive view for convenience: event + registration + profile
-- SAFE: This only creates a VIEW and does not ALTER or DROP any existing functions/tables.
-- Run in Supabase SQL editor or psql. Test in staging first.

CREATE OR REPLACE VIEW public.event_registrations_detail AS
SELECT
  r.id                        AS id,
  r.event_id                  AS event_id,
  r.user_id                   AS user_id,
  -- alias to match frontend expectations
  r.role                      AS type,
  r.volunteer_type            AS volunteer_type,
  r.status                    AS status,
  r.full_name                 AS full_name,
  r.email                     AS email,
  r.phone                     AS phone,
  r.notes                     AS notes,
  r.created_at                AS created_at,
  -- event fields (alias to what frontend reads)
  e.title                     AS event_title,
  e.date_time                 AS event_date,
  e.location                  AS event_location,
  e.image_url                 AS event_image_url,
  e.category                  AS category,
  e.max_participants          AS max_participants,
  -- profile fields
  p.name                      AS user_name,
  p.email                     AS user_email,
  p.phone                     AS user_phone
FROM public.registrations r
JOIN public.events e   ON e.id = r.event_id
JOIN public.profiles p ON p.id = r.user_id;

-- OPTIONAL: Row Level Security and policies for the view.
-- By default the view will honor the RLS on underlying tables when accessed
-- through PostgREST/Supabase, but if you need explicit policies for the view
-- you can enable them. Below are example policy statements (commented).

-- -- Enable RLS on the view (optional)
-- ALTER TABLE public.event_registrations_detail ENABLE ROW LEVEL SECURITY;
--
-- -- Admins can view everything in the view
-- DROP POLICY IF EXISTS "Admins can view event registrations" ON public.event_registrations_detail;
-- CREATE POLICY "Admins can view event registrations" ON public.event_registrations_detail
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
--     )
--   );
--
-- -- Users can view their own registrations
-- DROP POLICY IF EXISTS "Users can view own event registrations" ON public.event_registrations_detail;
-- CREATE POLICY "Users can view own event registrations" ON public.event_registrations_detail
--   FOR SELECT USING ( user_id = auth.uid() );

-- Notes:
-- - This view only reads data; it does not change existing functions/triggers/policies.
-- - If you run this and still see 404 from PostgREST, re-run the "NOTIFY pgrst, 'reload schema';" or
--   refresh the PostgREST / Supabase schema cache so the new view is exposed at /rest/v1/event_registrations_detail
--   (Supabase UI usually refreshes automatically).
-- - If you prefer different column names to match frontend expectations, tell me the exact names
--   and I can update the aliases accordingly before you run it.
