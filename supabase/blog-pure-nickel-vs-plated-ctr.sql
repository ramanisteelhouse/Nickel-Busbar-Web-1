-- Snippet fix for /blog/pure-nickel-strip-vs-nickel-plated-steel-strip.
--
-- Why this exists: in Search Console the page takes ~719 impressions for ~2 clicks (0.28%).
-- That is not a ranking problem. On 2026-10-26 it sat at #2 for "pure nickel strip vs nickel
-- plated steel strip" and around #6 for "nickel strip vs nickel plated steel for battery pack",
-- which should return a CTR an order of magnitude higher. Two things in the stored copy explain
-- the gap:
--
--  1. meta_title is "Pure Nickel Strip vs Nickel Plated Steel Strip  Ramani Steel House" - two
--     literal spaces where the "|" separator should be. It is the only one of the 28 published
--     posts with a collapsed separator; every other title uses "Subject | Hook". At 66 chars
--     Google truncates it back to the bare query phrase, so the result says nothing the searcher
--     did not already type.
--  2. meta_description lists the article's topics instead of answering the question. Every
--     competing result on that page answers it in the snippet ("approximately four times higher
--     resistance", "4x less resistance", "heats more and performs much worse"); this one is the
--     only snippet that promises an answer further in. The post's own key_answer column already
--     holds the verdict - it just never reached the <meta> tag.
--
-- The new description is drawn from key_answer and from the article's own "Complete Comparison
-- Table" heading, so it promises nothing the page does not deliver. No figure is quoted because
-- the article does not state a resistance multiple.
--
-- Also repairs the same stripped-separator damage inside the body: a resistivity line renders as
-- "0.068 \micro\Omega\cdot m" to readers, raw LaTeX on a page written for pack engineers, and
-- every em dash in the article was swallowed the way the title's "|" was, leaving 23 bare double
-- spaces mid-sentence ("Excellent corrosion resistance  reduces risk of galvanic reactions",
-- "<h3>Pure nickel strip  recommended</h3>", the author line at the foot of the page).
--
-- Run it in the Supabase project the site reads, fzrnezhbfyrpvudlsqny:
--   https://supabase.com/dashboard/project/fzrnezhbfyrpvudlsqny/sql/new
--
-- Scoped to the one slug and safe to run twice: the second run matches nothing.

update public.blog_posts
set
  meta_title = 'Pure Nickel vs Nickel Plated Steel Strip | Which Is Better',
  meta_description = 'Pure nickel has lower resistance, welds more consistently and resists corrosion better. Plated steel costs less. Which to use for your pack, with a spec table.',
  updated_at = now()
where slug = 'pure-nickel-strip-vs-nickel-plated-steel-strip'
  and meta_title <> 'Pure Nickel vs Nickel Plated Steel Strip | Which Is Better';

-- Raw LaTeX left in the body by the same import that ate the title separator.
update public.blog_posts
set
  content = replace(content, '\micro\Omega\cdot m', 'µΩ·m'),
  updated_at = now()
where slug = 'pure-nickel-strip-vs-nickel-plated-steel-strip'
  -- strpos, not LIKE: backslash is LIKE's default escape character, so '%\micro%' would look
  -- for a literal "micro" and never match the text that is actually stored.
  and strpos(content, '\micro\Omega\cdot m') > 0;

-- Em dashes the same import swallowed, restored. All 23 gaps are exactly two spaces, every one
-- sits after a word character and none after a full stop, so none of them is legacy sentence
-- spacing - they are all a lost "X — Y" dash. The em dash is this blog's own punctuation: across
-- ten other posts it appears 43 times and the en dash never.
--
-- ' {2,}' rather than a literal two spaces so a longer run could never leave a new gap behind,
-- and no tag or attribute in this article contains a double space, so markup is untouched.
-- Idempotent: afterwards no run of two spaces remains for it to match.
update public.blog_posts
set
  content = regexp_replace(content, ' {2,}', ' — ', 'g'),
  updated_at = now()
where slug = 'pure-nickel-strip-vs-nickel-plated-steel-strip'
  and content ~ ' {2,}';
