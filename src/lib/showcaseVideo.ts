/**
 * The product showcase reel, described once for the page, the schema and the crawler snapshot.
 *
 * A video is one of the few things on a page that Google can surface as its own result, but
 * only if a VideoObject describes it: a name, a description, a thumbnail and — the two that are
 * most often missing — an upload date and an ISO 8601 duration. Those cannot be derived from
 * the file at request time, so they live here beside the path.
 *
 * Plain data, no React: seoSnapshot.ts publishes the same VideoObject for crawlers that never
 * run the bundle, which is the only version Google's video indexing actually sees on this site.
 */
export const SHOWCASE_VIDEO = {
  src: '/video/nickel-strip-busbar-showcase.mp4',
  name: 'Ramani Steel House nickel strip and busbar showcase',
  description:
    'A short showcase of the pure nickel strip and nickel busbar made by Ramani Steel House in Mumbai: H-type, zig-zag, fuse-type and plain strip for 18650, 21700, 32650 and 32700 battery packs, plus nickel busbar for modules.',
  /** Read from the file's own mvhd box: 33 seconds. */
  duration: 'PT33S',
  durationLabel: '33-second',
  /** The date the reel was published to the site. */
  uploadDate: '2026-09-26',
  thumbnailAlt:
    'Pure nickel H type strip for 18650 battery packs, made by Ramani Steel House in Mumbai — video thumbnail',
  width: 1080,
  height: 1920,
} as const;

/** schema.org VideoObject. `siteUrl` makes contentUrl and thumbnailUrl absolute, as Google requires. */
export const showcaseVideoJsonLd = (siteUrl: string, thumbnailPath: string) => ({
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: SHOWCASE_VIDEO.name,
  description: SHOWCASE_VIDEO.description,
  thumbnailUrl: [`${siteUrl.replace(/\/+$/, '')}${thumbnailPath}`],
  uploadDate: SHOWCASE_VIDEO.uploadDate,
  duration: SHOWCASE_VIDEO.duration,
  contentUrl: `${siteUrl.replace(/\/+$/, '')}${SHOWCASE_VIDEO.src}`,
  width: SHOWCASE_VIDEO.width,
  height: SHOWCASE_VIDEO.height,
  publisher: {
    '@type': 'Organization',
    name: 'Ramani Steel House',
    url: siteUrl,
  },
});
