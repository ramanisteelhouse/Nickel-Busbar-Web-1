/**
 * The company's social profiles, and the share targets offered on an article.
 *
 * Two different jobs, deliberately in one file:
 *
 * `SOCIAL_PROFILES` are the accounts a reader can follow. They are also listed as `sameAs` in
 * the Organization markup in index.html — that copy is the machine-readable claim that these
 * accounts and this domain are the same business, which is what lets a search engine or an
 * assistant resolve "Ramani Steel House" to one entity instead of several. The visible links
 * here are what a person clicks and what a crawler follows; both are needed, and index.html
 * carries a longer list that also includes the trade-directory profiles.
 *
 * `shareLinks` are per-article, pointing at the sharer's own account rather than ours. A share
 * from a reader's LinkedIn is worth more than a link from ours: it reaches people we have no
 * list for, and on a B2B topic LinkedIn is where the buyers actually are.
 */
export const SOCIAL_PROFILES: ReadonlyArray<{ name: string; url: string }> = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/company/ramani-steel-house/' },
  { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61550731232092' },
  { name: 'Instagram', url: 'https://www.instagram.com/ramanisteelhouse/' },
  { name: 'Pinterest', url: 'https://in.pinterest.com/ramanisteel2023/' },
  { name: 'X', url: 'https://x.com/SteelHouse69101' },
];

export const LINKEDIN_PROFILE = SOCIAL_PROFILES[0].url;

/** Share URLs for one article. Every value is encoded, so a title with & or # survives. */
export function shareLinks(url: string, title: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}` },
    { name: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
  ];
}
