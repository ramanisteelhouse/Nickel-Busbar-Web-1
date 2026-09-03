# SEO audit follow-up — actions outside the codebase

Tracks the SEOptimer audit of 27 August 2026 (overall grade B−). Everything that could be fixed
in code has been; what follows needs DNS access, a Google/Meta account, or ongoing off-site
work, and cannot be done from this repository.

## 1. Add an SPF record (audit: "Add an SPF Mail Record")

DNS is at GoDaddy (`ns45.domaincontrol.com` / `ns46.domaincontrol.com`). Add one TXT record on
the apex `nickelbusbar.com`:

```
v=spf1 include:_spf.google.com ~all
```

`include:_spf.google.com` covers Google Workspace. The site also sends enquiry notifications
through whatever SMTP host is configured in `SMTP_HOST` — if that is **not** Google, add its
published include or IP to the same record. There must be exactly one SPF record on the domain;
two is a permanent error that fails every check.

## 2. Add a DMARC record (audit: "Add a DMARC Mail Record")

Add a TXT record on `_dmarc.nickelbusbar.com`. Start in monitor-only so nothing legitimate is
rejected while you confirm what is sending on your behalf:

```
v=DMARC1; p=none; rua=mailto:dmarc@ramanisteel.com; fo=1
```

Read the aggregate reports for two to four weeks. Once every legitimate sender passes, tighten
to `p=quarantine`, then `p=reject`. Do not start at `p=reject` — quotation emails to customers
will start bouncing before you know which sender was missing from SPF.

Both records are about email deliverability and spoofing, not rankings; they matter because
quotations that land in spam cost more than a ranking position does.

## 3. Link a YouTube channel (audit: "Create and link an associated YouTube Channel")

There is already a factory-tour video on the homepage (`Hero-section.mp4`, served from Supabase
storage). Publishing it on a YouTube channel and linking that channel would:

- satisfy this audit item;
- move 10.8MB of video off your own hosting;
- give the video its own indexable surface.

Once the channel exists, add its URL to the `sameAs` array in **both** `index.html` (the
`@graph` block) and `src/components/Footer.tsx`, which are the two places social profiles are
listed.

## 4. Execute a link-building strategy (audit: High priority, "Links" grade A+ but weak backlinks)

This is the audit's only high-priority item and the one with the most upside. The current
profile is 24 backlinks from 22 referring domains, and **every one of them is spam** — domain
listing generators, URL shorteners and "domain report" pages (`bitcoinmix.biz`, `ejjii.com`,
`quero.party`, `drjack.world` and similar), 16 of them from Finnish IPs. There are zero
editorial links.

These are almost certainly not something you built; auto-generated directory scrapers link to
domains indiscriminately. They are unlikely to be actively harmful and Google generally ignores
them, so **do not rush to a disavow file** — disavowing is easy to get wrong and hard to undo.
The fix is dilution: earn real links so the spam becomes a rounding error.

Realistic sources for an industrial manufacturer:

- **Trade directories with editorial review** — IndiaMART, TradeIndia, ExportersIndia, Zauba.
  Not high-authority, but they are the citations B2B buyers and Google both expect to see.
- **Industry bodies** — India Energy Storage Alliance, ACMA, and the relevant Maharashtra
  chambers of commerce. Membership pages carry genuine editorial links.
- **Customer and distributor pages** — battery pack makers who list approved material
  suppliers. Ask; most will link on request.
- **The technical content already on the site** — the blog posts on strip selection, thickness
  and pricing are the kind of reference an EV or battery forum links to unprompted. Those are
  the pages worth promoting, not the homepage.

## 5. Set the GA4 measurement ID (audit: "Implement an Analytics Tracking Tool")

The loader is built and wired (`src/components/Analytics.tsx`) but inert until the ID is set.
Create a GA4 property, then in the Vercel project settings add:

```
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

Redeploy. It is a build-time variable, so a redeploy is required — setting it alone does
nothing. Analytics only loads after a visitor accepts cookies; before that, and on decline,
nothing is requested from googletagmanager.com at all.

## 6. Facebook Pixel (audit: "Install a Facebook Pixel") — deliberately not built

A pixel is only worth its privacy cost if you intend to run Meta ads and retarget. Nothing was
added for it. If that changes, it should follow the same consent-gated, env-var pattern as
`Analytics.tsx` rather than being pasted into `index.html`.

## 7. Address — resolved, with one value still approximate

**Street address: fixed.** `POSTAL_ADDRESS` in `src/lib/contact.ts` previously held "Marine
Lines East", a locality rather than a street address — which is why the audit's Local SEO check
could not identify an address on the page at all. The company's own 4-page brochure gives the
real one, and it is now published:

```
65/73, C.P. Tank Road, Mumbai - 400 004, Maharashtra, India
```

It propagates from that one constant to the footer microdata, the `@graph` in `index.html`, and
every crawler snapshot.

**`geo` coordinates: still approximate.** `index.html` now carries `18.9512, 72.8268`, which is
the C.P. Tank area rather than a surveyed point for the premises. Replace it with the exact
pin from the Google Business Profile when that is set up.

## 8. Two discrepancies the brochure surfaced — need a decision

Neither is a bug, and neither has been changed unilaterally: both are statements about the
business that only the company can settle.

**Positioning.** `public/llms.txt` — the file AI assistants read to describe this company —
says Ramani Steel House is:

> "a primary manufacturer **(not a reseller or distributor)** of nickel strips"

The brochure says:

> "India's leading **importer and stockholder** of Nickel & Nickel Alloys, Stainless Steel,
> Titanium & Titanium alloys, Duplex, Super Duplex and High-Performance Stainless Steel"

Both can be true — nickel strip manufactured in-house, the wider alloy range imported and
stocked — but the parenthetical is an exclusive claim the brochure contradicts, on the one file
written specifically to tell language models what this company is. Decide which is accurate and
edit `scripts/generate-llms-txt.ts` (the committed `public/llms.txt` is generated from it).

**Contact details missing from the site.** The brochure publishes a landline and a general
mailbox that appear nowhere on nickelbusbar.com:

- `+91 (22) 2242 1388` / `+91 (22) 6636 2224`
- `info@ramanisteel.com`

A landline is a stronger local-search signal than a mobile, so adding at least one to
`PHONE_NUMBERS` in `src/lib/contact.ts` would strengthen the LocalBusiness entity. The four
named contacts and their personal mobiles are also in the brochure; whether those belong in
public structured data is a separate call.

## 9. Point Merchant Center at the generated product feed

Merchant Center reported `Missing value: gtin` and `Missing value: brand` on every item in the
**PRODUCTS SOURCE 2** feed. Neither was a fault on the website — the product pages already
publish `brand` in their Product structured data — so the errors came from the uploaded feed
file, which is maintained inside Merchant Center and had no such columns.

The site now generates a correct feed from the live catalogue:

```
https://www.nickelbusbar.com/merchant-feed.xml
```

In Merchant Center: **Data sources → Add product source → Scheduled fetch**, give it that URL,
and set a daily fetch. Then **delete or disable PRODUCTS SOURCE 2** — leaving both active means
two sources fighting over the same `id` values.

What the feed fixes, and why:

- **`g:brand`** — `Ramani Steel House`. These are own-manufactured goods, so the brand is ours.
- **`g:identifier_exists`** — `no`. This is what clears the GTIN error. Nickel strip is slit to
  order and carries no GS1 barcode, and Google's rule for a manufacturer that has never been
  assigned a GTIN is to declare that rather than invent a number. **If GS1 barcodes are ever
  purchased, add `g:gtin` and remove this** — see `src/lib/merchantFeed.ts`.
- **`g:mpn`** — the product slug, already used as `sku` in the structured data and in the URL.

Two things the feed deliberately does not do:

- **Enquiry-only products are omitted.** Merchant Center rejects a row with a missing or zero
  price, so a product with no rate is left out rather than sent at zero.
- **No `g:shipping`.** Freight on industrial coil is quoted per order. Set shipping at account
  level in Merchant Center (**Shipping and returns**); India requires shipping to be configured
  somewhere, and the account setting is the honest place for it.

