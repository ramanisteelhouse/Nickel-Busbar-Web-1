-- New post: nickel strip for solar and home inverter battery packs (BESS).
--
-- Why this topic, and why it is scoped the way it is. The coverage gap is real - "inverter"
-- appears zero times across the 28 published posts and "solar" twice - but two SERP checks on
-- 2026-10-26 showed the obvious framing would have cannibalised two posts rather than adding one:
--
--   "nickel strip for solar battery storage pack 48v inverter" returns the same marketplace
--   cluster as the 32700 query - the identical 32650/32700 plated-steel listings at Rs 39-581.
--   An application post pitched at strip selection would simply compete with the new
--   32700/32650 article for the same results.
--
--   "diy powerwall nickel strip or busbar continuous current" is already won: the existing
--   nickel-strip-vs-copper-busbar post sits at #1. Re-arguing strip against busbar would put
--   this post in front of a page that is already working.
--
-- So the spine is what neither neighbour covers, confirmed against all 28 posts: "48V", "48 V"
-- and "16S" appear ZERO times anywhere, "calendar life" once, "C-rate" twice, "stationary"
-- twice. The post is built on the 48 V / 16S architecture, the low-C-rate-but-continuous duty
-- cycle, and the ten-year calendar-life horizon. Where it reaches the strip-vs-busbar question
-- it links to the #1 post instead of restating it, and format and pitch detail is left to the
-- 32700 article.
--
-- Facts come from the site's own constants: 99.8% purity (NICKEL_PURITY_RANGE in
-- src/lib/productSpecs.ts), 5 kg minimum, 7-day despatch. No ampacity figure is quoted - that
-- belongs to the current-carrying-capacity guide, which the post links to. The FAQ lives in
-- faq_items only, never also in the body.
--
-- This post links to /blog/nickel-strip-32700-32650-lifepo4-battery-pack, which went live on
-- 2026-10-26 - so that dependency is already satisfied. It would be a dead link without it.
--
-- Also apply src/lib/blogProducts.ts (ARTICLE_PRODUCTS gains this slug) and run
-- scripts/sync-blog-covers.ts after publishing so the post gets a local cover.
--
-- The blogProducts.ts entry is not optional decoration. The SSR snapshot builds its own
-- "Products covered in this article" block by token-matching the title against product names
-- (seoSnapshot.ts), but the hydrated React page reads ARTICLE_PRODUCTS instead - so without a
-- mapping the block renders for a crawler and then vanishes the moment the bundle runs. That is
-- what the 32700 post does today, and why both posts carry their product links inline in the
-- closing section as well.
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
  'Nickel Strip for Solar and Home Inverter Battery Packs',
  'nickel-strip-solar-inverter-bess-battery-packs',
  'A storage pack runs for hours at low C-rate and is expected to last ten years. What that duty cycle means for the strip and the series links.',
$html$
<p>A home inverter or solar storage pack is the least dramatic battery you will ever build, and the most awkward one to get wrong. It sits in a utility room or on a wall, draws modestly, and is expected to still be doing that in ten years. Nothing about it is a burst.</p>

<p>That duty cycle is the opposite of a vehicle pack, and it changes which interconnect decisions actually matter.</p>

<h2>48 V means long series strings, and strings concentrate current</h2>

<p>Most home inverter packs in India are built around 48 V nominal, which for LiFePO4 means a 16S string — sixteen cells at 3.2 V. Capacity comes from paralleling, so a typical pack is 16S with several cells in each parallel group.</p>

<p>The interconnect does two different jobs in that layout. Inside a parallel group the current is shared and modest. At the series links, every amp the inverter pulls passes through one joint. They are not the same part, and sizing both from the same number is how a pack ends up with one warm spot that nobody designed.</p>

<h2>A low C-rate is not a low current</h2>

<p>A 5 kWh pack feeding a 3 kW inverter sits well under 1C, which looks comfortable on paper. But it sits there for hours at a stretch, every evening, and heat accumulates. A vehicle pack cools between trips. A storage pack in a sealed enclosure through an Indian summer often does not.</p>

<p>Size from your continuous current and the temperature the enclosure actually reaches, rather than from the cell's datasheet rating. <a href="/blog/nickel-strip-current-carrying-capacity">Nickel strip current carrying capacity</a> and the <a href="/blog/nickel-strip-thickness-guide">thickness guide</a> set out the method.</p>

<h2>Where strip stops and busbar starts</h2>

<p>This is the structural difference between a storage pack and a vehicle pack. The series links in a 48 V pack carry the full load current, and they are the obvious candidate for a bolted joint rather than a welded strip — while the cell caps still need something that welds cleanly to them. Most well-built storage packs use both, and the full comparison is in <a href="/blog/nickel-strip-vs-copper-busbar-battery-interconnects">nickel strip vs copper busbar</a>.</p>

<h2>Build for calendar life, not cycle life</h2>

<p>A storage pack is specified in years. At roughly one cycle a day it will not wear out by cycling — it will age. Anything that corrodes, creeps or works loose has a decade in which to do it.</p>

<p>That is the argument against nickel-plated steel in this application specifically. Plating nicked during forming or welding exposes the steel underneath, and a joint quietly corroding in a warm cupboard gives no warning until a cell group starts drifting away from the others. The comparison is in <a href="/blog/pure-nickel-strip-vs-nickel-plated-steel-strip">pure nickel vs nickel-plated steel strip</a>.</p>

<h2>A fixed installation changes the pattern choice</h2>

<p>A pack bolted to a wall never sees the vibration an e-rickshaw pack lives with, so the compliance that justifies zig-zag's extra width buys you nothing here. H-type is the compact, lower-cost pattern and it is the sensible default for a fixed install — see <a href="/blog/zig-zag-vs-h-type-nickel-strip">zig-zag vs H-type</a>.</p>

<p>Fusing runs the other way. In a pack installed inside a house, a fuse-type strip that isolates a cell drawing fault current is worth more than the ampacity it costs, provided the rest of the path is sized to absorb that loss. <a href="/blog/fuse-type-vs-plain-nickel-strip">Fuse-type vs plain nickel strip</a> covers the trade.</p>

<h2>Buying it</h2>

<p>Home storage packs in India are usually built on the 32 mm LFP formats, and what to order for those is set out in <a href="/blog/nickel-strip-32700-32650-lifepo4-battery-pack">nickel strip for 32700 and 32650 packs</a>. Ramani Steel House supplies <strong>99.8% pure nickel strip</strong> from a <strong>5 kg minimum order</strong>, with material test certificates on request and despatch typically within 7 days, PAN India — the <a href="/product/ni-32650-2p-h-type">Ni 32650 2P H-type</a>, <a href="/product/Plain-Nickel-Strips">plain strip from 0.1 mm to 1.0 mm</a>, and <a href="/product/Copper-Busbar">copper busbar</a> for the series links.</p>

<p>Weld a sample before committing to a batch — <a href="/blog/nickel-strip-sample-before-bulk-order">test before you buy in bulk</a> explains what to check on a pack meant to last. <a href="/contact">Send your cell layout</a> with the pack's continuous current, the series configuration and your measured pitch, and we will recommend a size.</p>
$html$,
  'Ramani Steel House',
  'published',
  'Nickel Strip for Solar & Home Inverter Packs (BESS)',
  'Nickel strip for solar and home inverter battery packs: sizing a 48V LFP pack for continuous current, calendar life, and where busbar takes over.',
  'A solar or home inverter pack runs at a low C-rate for hours and is specified in years, so size the interconnect for continuous current at the temperature the enclosure reaches, not for peak. Use nickel strip across the parallel groups, busbar on the 48 V series links, and H-type rather than zig-zag in a fixed install.',
$json$[
  {
    "question": "What nickel strip thickness should a 48V solar battery pack use?",
    "answer": "Size it from the continuous current the inverter draws and the temperature inside the enclosure, not from the cell's datasheet rating. A storage pack runs for hours at a time without the cooling break a vehicle pack gets, so the same current needs more cross-section than it would in an EV pack."
  },
  {
    "question": "Should I use nickel strip or copper busbar in a home storage pack?",
    "answer": "Usually both. Strip welds cleanly to the cell caps across each parallel group, while the series links carry the full load current and suit a bolted busbar joint. The split matters more in a 48V pack than in a small pack because every amp passes through those series links."
  },
  {
    "question": "Is nickel-plated steel strip suitable for a solar storage pack?",
    "answer": "It is the weakest choice for this application. A storage pack is specified in years rather than cycles, and plating nicked during forming or welding exposes steel that corrodes slowly in a warm enclosure. The failure shows up as a cell group drifting, long after the build."
  },
  {
    "question": "H-type or zig-zag nickel strip for a wall-mounted pack?",
    "answer": "H-type. Zig-zag earns its extra width by flexing under vibration, which a fixed installation never sees, so in a wall-mounted or rack pack you are paying for compliance you do not need."
  },
  {
    "question": "Do I need fuse-type strip in a pack installed inside a house?",
    "answer": "It is worth serious consideration. A fuse neck isolates a cell drawing fault current from the rest of the array, which matters more in an occupied building than the ampacity it costs — provided you size the remaining current path to absorb that loss."
  },
  {
    "question": "What is the minimum order for nickel strip for a solar pack?",
    "answer": "5 kg across the catalogue, with material test certificates on request and despatch typically within 7 days, PAN India. That covers a single home pack build or a small batch without a mill minimum."
  }
]$json$::jsonb,
  now(),
  now()
where not exists (
  select 1 from public.blog_posts
  where slug = 'nickel-strip-solar-inverter-bess-battery-packs'
);
