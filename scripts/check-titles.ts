/**
 * Checks the page titles that are defined in code: landing pages, the catalogue hub and the
 * guides. No database and no network.
 *
 *     npm run check:titles
 *
 * Two rules, both from how these pages are searched for:
 *
 *   - 60 characters at most. Google cuts a result title off at about that width, and the part it
 *     cuts is the end, which is where the commercial words sit.
 *   - Landing and catalogue titles carry a word a buyer types next to the product: manufacturer,
 *     supplier, exporter, wholesaler or price. "Pure Nickel Strip 0.15mm x 10mm" says what the
 *     page is; "... | Manufacturer & Supplier" says who is selling it, which is what the query
 *     "nickel strip manufacturer" is looking for.
 *
 * "Price" is only allowed where the page shows a price. The catalogue lists prices; the landing
 * pages do not, so a landing title that promised one would promise something the page lacks.
 *
 * Product titles are built from the database at request time (see productSeo.ts), so they are
 * measured by the live audit rather than here.
 */
import { catalogueMetaFor } from "../src/lib/catalogueMeta.js";
import { GUIDES } from "../src/lib/guides.js";
import { LANDING_PAGES } from "../src/lib/landingPages.js";

const MAX = 60;
const COMMERCIAL = /manufacturer|supplier|exporter|wholesaler|distributor|price/i;

const problems: string[] = [];
const checked: Array<[string, string]> = [];

const check = (where: string, title: string, { needsModifier, allowPrice }: { needsModifier: boolean; allowPrice: boolean }) => {
  checked.push([where, title]);
  if (title.length > MAX) problems.push(`${where}: ${title.length} characters (max ${MAX}): "${title}"`);
  if (needsModifier && !COMMERCIAL.test(title)) problems.push(`${where}: no commercial modifier: "${title}"`);
  if (!allowPrice && /\bprice\b/i.test(title)) problems.push(`${where}: promises a price the page does not show: "${title}"`);
};

for (const page of LANDING_PAGES) check(`/${page.slug}`, page.title, { needsModifier: true, allowPrice: false });
for (const isCategories of [false, true]) {
  const meta = catalogueMetaFor(isCategories);
  check(isCategories ? "/categories" : "/products", meta.title, { needsModifier: !isCategories, allowPrice: true });
}
// Guides are explainers, not sales pages, so they are held to the length rule only.
for (const guide of GUIDES) check(`/guides/${guide.slug}`, guide.metaTitle, { needsModifier: false, allowPrice: false });

const longest = [...checked].sort((a, b) => b[1].length - a[1].length)[0];
console.log(`${checked.length} titles checked; longest is ${longest[1].length} characters (${longest[0]}).`);

if (problems.length) {
  console.error(`\nFAILED: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exitCode = 1;
} else {
  console.log("PASSED: every title fits and every landing title names who is selling.");
}
