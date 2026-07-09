# Supabase Database Setup

1. Open your Supabase project dashboard.
2. Go to `SQL Editor`.
3. Run the SQL in `supabase/setup.sql`.
4. Verify data:
   - `select * from public.categories;`
   - `select * from public.products;`
   - `select id, title, slug, status from public.blog_posts order by created_at desc;`

This script creates all project tables and seeds the current product catalog from this codebase.

## Blog post structured data (JSON-LD)

`blog_posts` has two columns that drive the JSON-LD emitted by `BlogPostPage.tsx`:

- `cover_image_alt` (text, optional) — SEO alt text for the cover image. Leave null to fall back to an auto-generated alt. Upload the cover image at **1000x1000px**.
- `faq_items` (jsonb, optional) — an array of `{"question": "...", "answer": "..."}`. When present, the page renders a visible FAQ accordion **and** a matching `FAQPage` JSON-LD script; when null/empty, no FAQ schema is emitted. Google requires FAQ answers to be visible on the page, not just in the JSON-LD, so keep this as the single source of truth for both.

The `Article` JSON-LD (headline, description, image, author, publisher/logo, `datePublished`/`dateModified`) is generated automatically from the post's existing columns — there is nothing extra to store for it.

Example insert (matches the pattern of the pasted FAQPage/Article JSON-LD):

```sql
update public.blog_posts
set
  cover_image_alt = 'Pure nickel strip coil next to nickel-plated steel strip samples for EV battery interconnects',
  faq_items = '[
    {"question": "Is pure nickel better than nickel plated steel for EV batteries?", "answer": "Yes, for EV traction applications, pure nickel is generally preferred due to lower resistance, better welding consistency, and superior corrosion and thermal performance."},
    {"question": "Can I spot weld nickel plated steel to battery tabs?", "answer": "It is possible but more challenging. Plating affects weld energy and nugget formation; extensive process development and quality control are required to avoid weak welds or plating delamination."},
    {"question": "How do I test whether a strip is pure nickel?", "answer": "Use a combination of magnet testing, microsection inspection, and four-wire resistance measurement. Request material certificates and sample test reports from the supplier."},
    {"question": "Does nickel plated steel corrode inside a battery pack?", "answer": "If the plating is compromised by forming or welding, the exposed steel can corrode, especially in humid or chemically active environments, accelerating electrical degradation."},
    {"question": "What thicknesses of pure nickel strip do you supply?", "answer": "Ramani Steel House maintains ready stock in multiple dimensions and offers custom thicknesses to drawing specifications. Contact us with required dimensions for availability."},
    {"question": "Which is lighter: nickel or plated steel?", "answer": "Density differences are small; weight depends on strip thickness and geometry. For equal cross-section, pure nickel may be slightly heavier than some steels, but electrical performance usually justifies the tradeoff."},
    {"question": "Can nickel strips be laser cut?", "answer": "Yes, pure nickel and nickel busbars are commonly laser cut for precision shapes. Proper settings reduce burrs and thermal damage."},
    {"question": "Are nickel strips recyclable?", "answer": "Yes. Pure nickel has established recycling routes. Plated steels are also recyclable but require separation and processing for mixed metals."},
    {"question": "How much more expensive is pure nickel?", "answer": "Material price fluctuates with commodity markets. Pure nickel typically costs more per kg than plated steel, but the total cost of ownership (including manufacturing yield and lifetime performance) often favours pure nickel for critical battery applications."},
    {"question": "Do you provide custom battery interconnect manufacturing?", "answer": "Yes. Ramani Steel House offers custom nickel strips, H-type, fuse type, laser cut busbars and stamped interconnects per customer drawings with testing and export support."}
  ]'::jsonb
where slug = 'pure-nickel-strip-vs-nickel-plated-steel-strip';
```

### Why the Rich Results error happened

The `Article`/`Organization` JSON-LD you pasted pointed `publisher.logo.url` at `https://nickelbusbar.com/logo.png`, which 404s — the real asset is served at `https://www.nickelbusbar.com/img/logo.png`. Google's Rich Results Test flags an unreachable/missing logo image. The generated JSON-LD in `BlogPostPage.tsx` now always points at the correct, existing logo path, so this can't drift per-post.
