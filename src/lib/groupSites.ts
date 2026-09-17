/**
 * The company's other web properties.
 *
 * Ramani Steel House publishes under several domains and a handful of trade directories, and
 * before this none of them linked to any other. That is an entity problem, not a link-building
 * one: an answer engine asked "who is Ramani Steel House" found four properties describing an
 * alloy importer and stockholder, and this site describing something different, with nothing
 * connecting them. With no relationship asserted it treats them as unrelated businesses and
 * weights the majority — so this site, the outlier, is the one discounted.
 *
 * Used twice: as `sameAs` in the `@graph` in index.html (the machine claim that these are one
 * company) and as real anchors in the footer (what a crawler follows and an answer engine reads
 * as rendered text). Both are needed; neither substitutes for the other.
 *
 * Every URL here was verified to return 200 before being added. A `sameAs` pointing at a dead
 * page weakens the entity rather than strengthening it, so re-check before adding more.
 *
 * Deliberately not listed in the footer: the trade-directory profiles (TradeIndia,
 * ExportersIndia, ThePipingMart). They belong in `sameAs` as corroborating references, but
 * linking out to them from every page of the site sends visitors to a competitor's listing
 * page. They are in index.html only.
 *
 * Just as deliberately, the copy around these links names the *company* and never the group's
 * other product lines. nickelbusbar.com is nickel strip and nickel busbar only; titanium,
 * duplex, stainless, cobalt and the powders are sold on the other domains and must stay there.
 * Naming them here would spend this domain's topical focus — the single thing that makes it
 * competitive for "nickel strip" queries — on materials it does not sell. Entity linking and
 * catalogue mixing are different things, and only the first is wanted.
 */
export const GROUP_SITES: ReadonlyArray<{ href: string; label: string }> = [
  { href: 'https://www.ramanisteel.com/', label: 'ramanisteel.com' },
  { href: 'https://www.ramanialloys.com/', label: 'ramanialloys.com' },
  { href: 'https://www.ramanisteelhouse.com/', label: 'ramanisteelhouse.com' },
];
