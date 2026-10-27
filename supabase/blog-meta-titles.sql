       -- Shorten four blog <title> tags that Google truncates.
       -- Run in the Supabase SQL Editor against the production project (fzrnezhbfyrpvudlsqny).
       --
       -- Why this is data and not code: seoSnapshot.ts resolves the tag as
       -- `post.meta_title || post.title`, so setting meta_title fixes the rendered title without
       -- touching the headline shown on the article itself. These four posts have no meta_title, so
       -- the full editorial headline is being used, and it is 93 to 112 characters against the ~60
       -- Google renders.
       --
       -- An automatic rule was considered and rejected. Cutting each title at its first ":" or "|"
       -- produces a short, readable title, but it drops the terms after the break -- "Energy Storage
       -- Systems", "EV Battery Packs", "Bulk Battery Assembly". Google truncates a long title for
       -- display while still indexing all of it, so a mechanical cut would remove those words from
       -- the title tag for real rather than just from the preview. Each replacement below keeps the
       -- commercially important terms inside the visible window instead.
       --
       -- The article headlines (blog_posts.title) are deliberately left alone: they read well on the
       -- page, and only the search-results line is too long.
       
       begin;
       
       -- 102 chars. Keeps purity, low-grade and ESS.
       update public.blog_posts
       set meta_title = 'Nickel Purity: Why Low-Grade Strip Fails in ESS Packs'
       where slug = 'why-nickel-purity-matters';
       
       -- 112 chars, the worst of the four. Keeps manufacturer and UK battery industry, which is what
       -- the post is positioned for; the EV and "pure nickel" repetitions were padding.
       update public.blog_posts
       set meta_title = 'Nickel Strip Manufacturer for the UK Battery Industry'
       where slug = 'nickel-strip-manufacturer-uk-battery-industry';
       
       -- 93 chars. Keeps every term that mattered: nickel strips, EV, lithium-ion, battery packs.
       update public.blog_posts
       set meta_title = 'Nickel Strips for EV Lithium-Ion Battery Packs'
       where slug = 'nickel-strips-for-electric-vehicles';
       
       -- 94 chars. Keeps sourcing, custom stamped, nickel busbars and bulk.
       update public.blog_posts
       set meta_title = 'Sourcing Custom Stamped Nickel Busbars in Bulk'
       where slug = 'sourcing-custom-stamped-nickel-busbars';
       
       commit;
       
       -- Verification. Every row should show a meta_title of 60 characters or fewer, and the four
       -- slugs above should all be present.
       select slug,
              length(coalesce(meta_title, title)) as rendered_title_length,
              coalesce(meta_title, title)          as rendered_title
       from public.blog_posts
       where status = 'published'
       order by rendered_title_length desc
       limit 12;
