-- Removes the duplicated FAQ from /blog/pure-nickel-strip-vs-nickel-plated-steel-strip.
--
-- Why this exists: the post renders its ten FAQ questions twice, back to back. Once from a
-- "Frequently Asked Questions (FAQ)" block with numbered <h3>s that lives inside the stored
-- content, and immediately again from BlogFaqSection, which renders the faq_items column (see
-- src/pages/BlogPostPage.tsx). faq_items is also what feeds the FAQPage structured data, so it
-- is the copy that has to stay.
--
-- Nothing is lost. The two copies were compared question by question on 2026-10-26: same ten
-- questions in the same order, and answers identical to the character, except that the in-body
-- copy spells three of them with a non-breaking hyphen (U+2011) where faq_items uses a plain
-- one - "four-wire", "cross-section", "H-type".
--
-- This post is the only one of the 28 published that duplicates its FAQ, the only one whose
-- meta_title lost its "|" separator, and the only one carrying raw LaTeX in the body. All of it
-- traces to how this single article was imported.
--
-- Run it in the Supabase project the site reads, fzrnezhbfyrpvudlsqny:
--   https://supabase.com/dashboard/project/fzrnezhbfyrpvudlsqny/sql/new
--
-- Cuts from the FAQ heading up to (not including) the "Call to Action" heading that follows it:
-- 2541 characters, 21772 down to 19231, eleven headings, and the <div class="faq"> wrapper
-- opened and closed inside that range, so every tag stays balanced. Both markers occur exactly
-- once. Safe to run twice - the second run finds no FAQ heading and matches nothing.

update public.blog_posts
set
  content = left(content, strpos(content, '<h2>Frequently Asked Questions (FAQ)</h2>') - 1)
            || substring(content from strpos(content, '<h2>Call to Action</h2>')),
  updated_at = now()
where slug = 'pure-nickel-strip-vs-nickel-plated-steel-strip'
  and strpos(content, '<h2>Frequently Asked Questions (FAQ)</h2>') > 0
  -- Guards the splice: without both markers present, and in this order, left()/substring()
  -- would silently truncate the article instead of cutting one block out of it.
  and strpos(content, '<h2>Call to Action</h2>')
      > strpos(content, '<h2>Frequently Asked Questions (FAQ)</h2>');
