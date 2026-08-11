-- Row Level Security remediation.
-- Run this in the Supabase SQL Editor against the production project.
--
-- Problem it fixes:
--   Supabase grants the `anon` and `authenticated` roles SELECT on every table in
--   `public` by default. With RLS switched off, anyone holding the publishable key
--   (which ships in browsers by design) could read every row of every table over
--   PostgREST, including `users`, `quote_requests`, `product_enquiries`,
--   `visitor_logs` and `call_clicks` - i.e. customer email, phone, GST number,
--   PIN code and password hashes.
--
-- Why this is safe for the app:
--   Nothing in this codebase talks to PostgREST. `@supabase/supabase-js` is listed
--   in package.json but never imported, and the built bundle contains no reference
--   to the publishable key. All reads and writes go through apiApp.ts -> db.ts,
--   which connects over `pg` as the `postgres` role. `postgres` owns these tables,
--   and table owners are exempt from RLS unless FORCE ROW LEVEL SECURITY is set.
--   Enabling RLS therefore blocks the public key and leaves the API untouched.
--
--   Do NOT add `force row level security`. That would subject the owner connection
--   to these (deliberately empty) policies and take the whole site down.

begin;

-- Enable RLS on every table in `public`, including any added after this was written.
-- No policies are created, so RLS resolves to deny-all for `anon` and
-- `authenticated` while the owner connection used by the API is unaffected.
do $$
declare
  t record;
begin
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

commit;

-- Verification. Every row must show rowsecurity = true.
select
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- If you later add client-side reads with the publishable key, do not disable RLS.
-- Grant the narrowest read instead, e.g. published blog posts only:
--
--   create policy "public reads published posts"
--     on public.blog_posts for select
--     to anon
--     using (status = 'published');
--
-- Never write such a policy for users, quote_requests, product_enquiries,
-- cart_items, orders, order_items, quote_request_items, user_preferences,
-- visitor_logs or call_clicks. Those hold personal data and must stay deny-all.
