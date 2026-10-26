-- New post: nickel strip for 32700 / 32650 LiFePO4 packs.
--
-- Why this topic. Checked against the 28 published posts on 2026-10-26: "32700" appears 9 times
-- and "32650" 17, but always in passing inside the e-rickshaw, MOQ and 18650-vs-21700 articles -
-- no post owns the format. "LiFePO4" appears once in the entire blog, "inverter" never, "solar"
-- twice. Meanwhile the catalogue has sold strip for these cells all along.
--
-- Why it should rank. The SERP for "nickel strip for 32700 lifepo4 battery pack" is Amazon and
-- Flipkart hobby listings at Rs 29-581, most of them nickel-PLATED steel, plus two Chinese
-- suppliers. No Indian manufacturer is on page one. Google's own AI Overview for that query
-- already answers it as "H-shape or 2P pure nickel strips, 0.15 mm to 0.20 mm" - which describes
-- ni-32650-2p-h-type and ni-fuse-type-32700-2p-zig-zag-honeycomb exactly.
--
-- Facts come from the site's own constants rather than from the draft: 99.8% purity
-- (NICKEL_PURITY_RANGE in src/lib/productSpecs.ts), and the 5 kg minimum and 7-day despatch
-- already published elsewhere. No current rating or resistance multiple is quoted - those belong
-- to the current-carrying-capacity guide, which the post links to instead. The FAQ lives in
-- faq_items only, never also in the body, which is the duplication just cleaned off the
-- pure-vs-plated post.
--
-- Two things to apply alongside it:
--   1. src/lib/blogProducts.ts - ARTICLE_PRODUCTS gains this slug, so the post renders its
--      "Products covered in this article" block.
--   2. scripts/sync-blog-covers.ts - run it after publishing so the post gets a local cover at
--      /img/blog-covers/, instead of falling back to a product photo.
--
-- Run it in the Supabase project the site reads, fzrnezhbfyrpvudlsqny:
--   https://supabase.com/dashboard/project/fzrnezhbfyrpvudlsqny/sql/new
--
-- Safe to run twice: the insert is guarded on the slug and does nothing the second time.

-- blog_posts.id is an identity column, so the sequence has to be caught up before an insert, or
-- it collides with rows that were loaded with explicit ids.
select setval(
  pg_get_serial_sequence('public.blog_posts', 'id'),
  greatest((select coalesce(max(id), 1) from public.blog_posts), 1)
);

insert into public.blog_posts (
  title, slug, excerpt, content, author_name, status,
  meta_title, meta_description, key_answer, faq_items, published_at, updated_at
)
select
  'Nickel Strip for 32700 and 32650 LiFePO4 Packs: What to Order',
  'nickel-strip-32700-32650-lifepo4-battery-pack',
  '32700 and 32650 packs draw steadily for hours, not in bursts. What that means for the thickness, the pattern and the pitch you order.',
$html$
<p>A 32700 or 32650 pack is not a scaled-up 18650 pack. The cells are almost always LiFePO4, chosen for cycle life rather than energy density, and the things built from them — solar storage, home inverters, e-rickshaws — draw steadily for hours instead of in bursts.</p>

<p>That changes what the interconnect has to do. It is also why strip bought off a marketplace listing tends to disappoint a few months in rather than on the day it is welded.</p>

<h2>Start with the pitch, not the thickness</h2>

<p>Both formats are 32 mm across: 32650 is 32 × 65 mm, 32700 is 32 × 70 mm. Stamped strip is cut to a fixed cell pitch, so strip made for an 18650 array will not sit on a 32 mm array, and neither will 21700 strip — the openings do not line up with the caps. <a href="/blog/18650-vs-21700-nickel-strip-cell-format">What changes when you switch cell format</a> covers why that is not something you can adjust on the bench.</p>

<p>Your pitch comes from your own layout, because the holder and the clearance you leave decide it, not the cell diameter alone. Measure it and state it when you order. It is the single dimension that makes a batch of strip either usable or scrap, and it is the one most enquiries arrive without.</p>

<h2>0.15 mm or 0.20 mm</h2>

<p>Across the 32 mm formats, 0.15 mm suits lighter builds and 0.20 mm is the usual choice where the pack draws continuously — which, on solar and inverter duty, it does. An LFP pack is bought for long life, and strip that runs warm on every cycle works against the reason you chose the chemistry.</p>

<p>Thickness on its own is not the answer. The length of the current path between welds and the cross-section at its narrowest point both matter, and thicker strip needs a welder that can actually deliver the energy. Work it out from your continuous current rather than copying another build: <a href="/blog/nickel-strip-current-carrying-capacity">nickel strip current carrying capacity</a> and the <a href="/blog/nickel-strip-thickness-guide">thickness guide</a> set out the method.</p>

<h2>What the marketplace listings are actually selling</h2>

<p>Search for 32700 nickel strip and most of what comes back is nickel-<em>plated</em> steel, sold by the metre. It welds. It looks right. On a low-current build it may well be fine.</p>

<p>In a pack that runs continuously it is a worse trade than the price suggests. The core is steel, which raises resistance exactly where you do not want it, and the plating makes weld quality less repeatable — so the problem shows up as heat, and as cells drifting apart over cycles, long after the build. If the budget only stretches to plated steel, size it more generously and test the welds harder. The comparison is in <a href="/blog/pure-nickel-strip-vs-nickel-plated-steel-strip">pure nickel vs nickel-plated steel strip</a>.</p>

<h2>H-type or fuse-type</h2>

<p>H-type is the compact, lower-cost pattern and keeps the full cross-section between cells. A fuse-type strip narrows on purpose, so a cell drawing fault current is isolated from the rest of the array — worth taking seriously in a stationary pack sitting inside a house, except that the fuse neck costs ampacity, which is what a continuous-draw pack needs most. Decide it against your current rather than by habit: <a href="/blog/fuse-type-vs-plain-nickel-strip">fuse-type vs plain nickel strip</a>.</p>

<h2>Buying it</h2>

<p>Ramani Steel House supplies <strong>99.8% pure nickel strip</strong> from a <strong>5 kg minimum order</strong>, with material test certificates on request and despatch typically within 7 days, PAN India. For the 32 mm formats that means the <a href="/product/ni-32650-2p-h-type">Ni 32650 2P H-type</a> at 0.15 mm and the <a href="/product/ni-fuse-type-32700-2p-zig-zag-honeycomb">Ni Fuse Type 32700</a> at 0.20 mm, or <a href="/product/Plain-Nickel-Strips">plain strip from 0.1 mm to 1.0 mm</a> if you cut your own pattern.</p>

<p>Order a few metres and weld it before committing to a batch — <a href="/blog/nickel-strip-sample-before-bulk-order">test before you buy in bulk</a> sets out what to check. Patterns cut to a layout you have designed yourself are made to drawing. <a href="/contact">Send your cell layout</a> with the pack's continuous current and your measured pitch, and we will recommend a size.</p>
$html$,
  'Ramani Steel House',
  'published',
  'Nickel Strip for 32700 & 32650 LiFePO4 Packs | What to Order',
  'Pure nickel strip for 32700 and 32650 LiFePO4 packs: 0.15 mm or 0.20 mm, H-type or fuse-type, and why plated steel costs more than it saves.',
  'For 32700 and 32650 LiFePO4 packs, use pure nickel strip stamped to your measured cell pitch — 0.15 mm for lighter builds, 0.20 mm where the pack draws continuously, as solar and inverter packs do. Most strip sold for these cells online is nickel-plated steel, whose steel core raises resistance in a pack that already runs warm.',
$json$[
  {
    "question": "What thickness nickel strip should I use for a 32700 LiFePO4 pack?",
    "answer": "0.15 mm suits lighter builds and 0.20 mm is the usual choice where the pack draws continuously, which solar and inverter packs do. Size it from your continuous current and the length of the current path between welds, not from another builder's pack."
  },
  {
    "question": "Can I use 18650 or 21700 nickel strip on 32650 and 32700 cells?",
    "answer": "No. Stamped strip is cut to a fixed cell pitch, and 32650 and 32700 cells are 32 mm across against 18 mm and 21 mm, so the openings do not line up with the cell caps. The strip has to be made for the format."
  },
  {
    "question": "What cell pitch do I order 32700 strip at?",
    "answer": "It comes from your own layout rather than the cell diameter alone, because the holder and the clearance you leave between cells decide it. Measure the centre distance on your array and state it with the order."
  },
  {
    "question": "Is nickel-plated steel strip good enough for a 32700 solar pack?",
    "answer": "It welds and costs less, but the steel core raises resistance and the plating makes welds less repeatable, which tells in a pack running continuously for hours. If you use it, size it more generously and test the welds harder."
  },
  {
    "question": "What is the minimum order for 32650 or 32700 nickel strip?",
    "answer": "5 kg across the catalogue, with material test certificates on request and despatch typically within 7 days, PAN India. That suits a workshop building a few dozen packs a month rather than a mill minimum."
  },
  {
    "question": "Can I get 32700 strip cut to my own pattern?",
    "answer": "Yes. Patterns outside the standard range are made to drawing, with tooling developed where a new pattern needs it. Send the cell layout, the pitch and the pack's continuous current."
  }
]$json$::jsonb,
  now(),
  now()
where not exists (
  select 1 from public.blog_posts
  where slug = 'nickel-strip-32700-32650-lifepo4-battery-pack'
);
