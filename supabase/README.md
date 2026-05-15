# Supabase Database Setup

1. Open your Supabase project dashboard.
2. Go to `SQL Editor`.
3. Run the SQL in `supabase/setup.sql`.
4. Verify data:
   - `select * from public.categories;`
   - `select * from public.products;`
   - `select id, title, slug, status from public.blog_posts order by created_at desc;`

This script creates all project tables and seeds the current product catalog from this codebase.
