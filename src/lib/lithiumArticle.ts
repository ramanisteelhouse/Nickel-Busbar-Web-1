/**
 * The article at /blog/nickel-strips-lithium-batteries, kept in code like the guides.
 *
 * It was four paragraphs and about 130 words, and every one of them was about us ("Why
 * Manufacturers Choose Us") rather than about the strip. That is the thinnest page on the site
 * and the one with the most general title, so it is now a buyer's article: why nickel is the
 * standard cell interconnect, what to put in a specification, and how to qualify a supplier.
 * It lives here rather than in the blog table because it has always been a page in the code
 * (BlogNickelStripsLithiumPage), and one definition lets the React page and the crawler snapshot
 * say the same thing.
 *
 * Every figure is a constant the rest of the site already publishes (purity, thickness and width
 * ranges, minimum order, despatch time, cell formats, grade and standard) or the density and
 * resistivity the guides use. Nothing here is a new claim about the company.
 *
 * Plain data, no React, `.js` on relative imports: the Node serverless function loads this.
 */
import { DELIVERY_TIME, MINIMUM_ORDER_QUANTITY, NICKEL_PURITY_RANGE } from './productSpecs.js';
import { CELL_FORMATS, STANDARD_THICKNESSES_MM, THICKNESS_RANGE_MM, WIDTH_RANGE_MM } from './stripSizes.js';
import { authorJsonLd } from './author.js';
import { YEARS_IN_BUSINESS } from './heritage.js';
import type { Guide } from './guides.js';

export const LITHIUM_ARTICLE_PATH = '/blog/nickel-strips-lithium-batteries';

const cellFormats = CELL_FORMATS.filter((cell) => /^\d/.test(cell)).join(', ');

const THICKNESS_TEXT = `${THICKNESS_RANGE_MM.min.toFixed(2)} mm to ${THICKNESS_RANGE_MM.max.toFixed(2)} mm`;

/** Shaped like a Guide so the same renderers and structured data can be reused. Not in GUIDES. */
export const LITHIUM_ARTICLE: Guide = {
  slug: 'nickel-strips-lithium-batteries',
  title: 'Nickel Strips for Lithium-Ion Batteries: What to Specify and How to Buy',
  metaTitle: 'Nickel Strips for Lithium-Ion Batteries | Buyer Guide',
  description:
    'Why nickel strip is the standard cell interconnect in lithium-ion packs, what to put in a specification, and how to qualify a supplier before you scale.',
  excerpt:
    'Why nickel is the standard cell interconnect in lithium-ion packs, what to put in a specification, and how to qualify a supplier.',
  keyAnswer: `Lithium-ion packs join their cells with pure nickel strip because it spot welds cleanly onto the cell can, resists corrosion and carries enough current at the thickness and width a pack is built for. A purchase specification names the grade (Nickel 201, UNS N02201), the purity, the thickness and width, the pattern and the form, and asks for a material test certificate with each batch.`,
  coverImage: '/img/products/ni-18650-2p-h-type-nickel-strip.webp',
  coverAlt: 'H-type pure nickel strip for lithium-ion 18650 battery packs, cut to the cell pitch',
  datePublished: '2026-05-14',
  dateModified: '2026-10-27',
  productSlugs: ['ni-18650-2p-h-type', 'ni-21700-2p-h-type-v3', 'Plain-Nickel-Strips'],
  faqs: [
    {
      question: 'Why is nickel used to connect lithium-ion cells instead of copper?',
      answer:
        'Because it can be resistance spot welded directly onto the cell. Nickel resists corrosion and its resistivity and low thermal conductivity keep the heat at the weld interface, so a clean weld forms in milliseconds. Copper conducts heat away so quickly that it is bolted or laser-welded instead. Nickel is more resistive than copper, so packs that carry heavy current often use copper busbar between modules and nickel strip at the cells.',
    },
    {
      question: 'What purity of nickel strip should a lithium-ion pack use?',
      answer: `Pure nickel, not nickel-plated steel. Ramani Steel House supplies ${NICKEL_PURITY_RANGE} strip, Nickel 201 to UNS N02201 under ASTM B162, with a material test certificate on request. Nickel-plated steel is cheaper but has substantially higher resistance, so the two are not interchangeable where conductivity matters.`,
    },
    {
      question: 'What thickness of nickel strip is used on 18650 cells?',
      answer:
        '0.15 mm is the most common gauge for 18650 pack assembly, because it welds cleanly on a mid-range resistance welder. Higher-current packs and larger cells such as 21700 and 32700 often step up to 0.20 mm or more. The right thickness is set by the current each cell connection carries and by your welder, so a trial lot of each candidate is the reliable way to decide.',
    },
    {
      question: 'Can nickel strip be made to our drawing instead of a standard size?',
      answer: `Yes. Width, thickness, pitch and hole pattern are made to your drawing, with tooling developed for new pack layouts. The minimum order is ${MINIMUM_ORDER_QUANTITY}.`,
    },
  ],
  html: `<h2>Why lithium-ion packs use nickel strip</h2>
<p>A lithium-ion pack is a lot of small cells joined into one battery. The joints carry the whole pack current, are made thousands of times on a production line, and have to stay low-resistance for the life of the pack. Pure nickel strip is the standard answer for three reasons.</p>
<ul>
<li><strong>It spot-welds cleanly.</strong> Nickel's resistivity and low thermal conductivity (roughly 70 W/m&middot;K for Nickel 200) keep heat at the weld, so the weld nugget forms between the strip and the cell can in milliseconds and the heat stays local to the joint. Copper's very low resistivity and high thermal conductivity carry that heat away, which is why copper is bolted or laser-welded rather than spot welded.</li>
<li><strong>It resists corrosion.</strong> A joint that slowly oxidises slowly gains resistance, and the extra resistance becomes heat. Nickel stays stable in the conditions a pack sees.</li>
<li><strong>It is ductile.</strong> Strip can be slit to width, stamped into H-type, zig-zag and fuse patterns, and formed around a pack layout without cracking.</li>
</ul>
<p>The trade-off is conductivity. Nickel 200 is roughly five and a half times more resistive than annealed copper, so nickel does the weldable work at the cell and copper busbar carries the heavy current between modules. <a href="/blog/nickel-strip-vs-copper-busbar-battery-interconnects">Nickel strip vs copper busbar</a> works through where the line falls.</p>

<h2>What to put in a nickel strip specification</h2>
<p>A specification that names only a thickness leaves the rest to the supplier. These are the lines that make two quotations comparable.</p>
<table>
<thead><tr><th>Line</th><th>What to write</th></tr></thead>
<tbody>
<tr><td>Material</td><td>Pure nickel, Nickel 201, UNS N02201 (DIN 2.4068), ASTM B162</td></tr>
<tr><td>Purity</td><td>${NICKEL_PURITY_RANGE}</td></tr>
<tr><td>Thickness</td><td>${THICKNESS_TEXT}; standard gauges ${STANDARD_THICKNESSES_MM.join(', ')} mm, other thicknesses to order</td></tr>
<tr><td>Width</td><td>${WIDTH_RANGE_MM.min} mm to ${WIDTH_RANGE_MM.max} mm, slit to your drawing</td></tr>
<tr><td>Cell format</td><td>${cellFormats} and custom pack layouts</td></tr>
<tr><td>Pattern</td><td>Plain, H-type (2P, 3P, 4P), zig-zag, or fuse-type with honeycomb or fuse necks</td></tr>
<tr><td>Form</td><td>Coil, cut lengths or pre-formed pattern</td></tr>
<tr><td>Quantity</td><td>From ${MINIMUM_ORDER_QUANTITY}; despatch in ${DELIVERY_TIME}</td></tr>
<tr><td>Paperwork</td><td>Material test certificate with each batch, on request</td></tr>
</tbody>
</table>
<p>Two of these lines decide more than the rest. <strong>Pure nickel, not nickel-plated steel:</strong> the plated strip is cheaper, but its resistance is substantially higher, and on a pack carrying real current that becomes heat. And <strong>thickness and width together:</strong> the cross-section is what carries the current, so a thin strip that is wide enough can match a thicker, narrower one. The guide to <a href="/guides/how-to-size-nickel-strip-for-battery-pack">sizing nickel strip for a battery pack</a> shows the method step by step.</p>

<h2>Choosing the pattern</h2>
<p>A plain strip is the simplest and the cheapest per kilogram. A pattern earns its place when it solves a layout problem. H-type strip joins a group of parallel cells in one piece, and <a href="/blog/2p-vs-3p-vs-4p-nickel-strip-interconnect-design">how the parallel count changes the design</a> is worth reading before you commit to a layout. Zig-zag is the other common pattern, and <a href="/blog/zig-zag-vs-h-type-nickel-strip">zig-zag vs H-type</a> compares the two. Fuse-type strip has a deliberately narrow neck that opens under a fault current, which is a protection feature rather than a conductor, and <a href="/blog/fuse-type-vs-plain-nickel-strip">fuse-type vs plain</a> explains when a pack needs one. The full range is on the <a href="/h-type-nickel-strip">H type nickel strip</a> page.</p>

<h2>Qualifying a supplier before you scale</h2>
<p>Most battery makers qualify a strip supplier in stages, and each stage answers one question.</p>
<ol>
<li><strong>A sample lot.</strong> Is the material what the certificate says it is? Order the smallest quantity that lets you run real tests; <a href="/blog/nickel-strip-sample-before-bulk-order">testing a sample before a bulk order</a> covers what to check.</li>
<li><strong>Certificate and dimensions.</strong> Read the <a href="/blog/how-to-read-nickel-strip-material-test-certificate">material test certificate</a> against your specification, then measure thickness and width at several points along the length.</li>
<li><strong>Weld tests.</strong> Does it weld the way your process needs? Weld a set of sample cells and peel-test them; <a href="/blog/battery-spot-welding-tips-nickel-strip">spot welding tips for nickel strip</a> covers the settings that matter.</li>
<li><strong>A pilot batch, then scheduled volume.</strong> Does the next batch match the last? Compare the second lot against the first before releasing a production schedule.</li>
</ol>
<p>Storage matters at every stage. Strip that picks up moisture or skin oils welds worse than strip that left the works, so keep it sealed and dry until it is on the cell: see <a href="/blog/nickel-strip-storage-handling-shelf-life">storing and handling nickel strip</a>.</p>

<h2>Where Ramani Steel House fits</h2>
<p>Ramani Steel House has made nickel strip and nickel busbar in Mumbai since 1974, which is ${YEARS_IN_BUSINESS} years of manufacturing, and supplies battery makers across India and exports to 17+ countries. The strip is made and slit in-house, so a new pattern or size is cut to your drawing instead of being chosen from a catalogue, and the same material and certificates apply at ${MINIMUM_ORDER_QUANTITY} as at bulk quantity. If you are working out a specification, the <a href="/nickel-strip-for-lithium-ion-battery-manufacturers">nickel strip for lithium-ion battery manufacturers</a> page sets out how supply is organised, and the <a href="/contact">contact page</a> takes a drawing or a cell arrangement for a quotation.</p>`,
};

/**
 * Article, FAQPage and BreadcrumbList for the page. Built here, once, so the React head and the
 * crawler snapshot cannot disagree: a mounted page whose head differs from its snapshot's has the
 * snapshot's thrown away.
 */
export function lithiumArticleJsonLd(): object[] {
  const canonical = `https://www.nickelbusbar.com${LITHIUM_ARTICLE_PATH}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: LITHIUM_ARTICLE.title,
      description: LITHIUM_ARTICLE.description,
      image: [`https://www.nickelbusbar.com${LITHIUM_ARTICLE.coverImage}`],
      author: authorJsonLd(),
      publisher: {
        '@type': 'Organization',
        name: 'Ramani Steel House',
        logo: { '@type': 'ImageObject', url: 'https://www.nickelbusbar.com/img/logo.png' },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      datePublished: LITHIUM_ARTICLE.datePublished,
      dateModified: LITHIUM_ARTICLE.dateModified,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: LITHIUM_ARTICLE.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.nickelbusbar.com/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.nickelbusbar.com/blog' },
        { '@type': 'ListItem', position: 3, name: LITHIUM_ARTICLE.title, item: canonical },
      ],
    },
  ];
}
