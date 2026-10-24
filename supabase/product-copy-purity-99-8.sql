-- Product copy that still says 99.2% purity, corrected to the site's current figure (99.8%).
--
-- Why this exists: in September the purity was confirmed as 99.2% and the product descriptions
-- were rewritten with it. On 2026-09-26 the owner restated it as 99.8%, and the spec tables, the
-- Product structured data, the homepage and llms.txt all moved (they read src/lib/productSpecs.ts).
-- The description text lives in the database, so it did not: on every nickel product page the spec
-- table says 99.8% and the paragraph above it says 99.2%.
--
-- Run it in the Supabase project the site reads, fzrnezhbfyrpvudlsqny:
--   https://supabase.com/dashboard/project/fzrnezhbfyrpvudlsqny/sql/new
--
-- It only replaces the literal text "99.2%" with "99.8%" in the four copy columns, and only on rows
-- that contain it. A null array stays null. Safe to run twice (the second run matches nothing).

update public.products
set
  description          = replace(description, '99.2%', '99.8%'),
  seo_meta_description = replace(seo_meta_description, '99.2%', '99.8%'),
  seo_paragraphs       = case when seo_paragraphs is null then null
                              else array(select replace(p, '99.2%', '99.8%') from unnest(seo_paragraphs) as p) end,
  seo_keywords         = case when seo_keywords is null then null
                              else array(select replace(k, '99.2%', '99.8%') from unnest(seo_keywords) as k) end
where (
  coalesce(description, '') || ' ' ||
  coalesce(seo_meta_description, '') || ' ' ||
  coalesce(array_to_string(seo_paragraphs, ' '), '') || ' ' ||
  coalesce(array_to_string(seo_keywords, ' '), '')
) like '%99.2%';

-- Check: nothing should still say 99.2%.
select count(*) as products_still_saying_99_2
from public.products
where (
  coalesce(description, '') || ' ' ||
  coalesce(seo_meta_description, '') || ' ' ||
  coalesce(array_to_string(seo_paragraphs, ' '), '') || ' ' ||
  coalesce(array_to_string(seo_keywords, ' '), '')
) like '%99.2%';
-- Expected: 0.
