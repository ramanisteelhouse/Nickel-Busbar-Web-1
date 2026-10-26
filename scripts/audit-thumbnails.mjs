/**
 * Thumbnail audit: for every URL in the live sitemap, which image is Google told about, and could
 * it use it?
 *
 *     npm run audit:thumbnails                       # the live site
 *     SITE_URL=https://preview.example npm run audit:thumbnails
 *
 * Why this exists. Google picks the thumbnail beside a search result from the page's og:image, its
 * structured data and the images on the page, but it can only use one that is fetchable, is an
 * image, is not blocked by an X-Robots-Tag header, and is large enough. On 2026-10-24 not one of 29
 * blog posts passed: 22 pointed at Supabase signed URLs, which Supabase serves with
 * `X-Robots-Tag: none`, and seven named no image. Nothing in the build could see that, because the
 * markup was valid; the failure was in the headers of a file on another host.
 *
 * Checks each page's primary image (og:image): HTTP 200, an image content type, no noindex/none in
 * X-Robots-Tag, served from our own origin, not SVG (social cards cannot render it), and at least
 * 696px wide (Google's floor for Article images). Exits non-zero when any page fails, so it can gate
 * a deploy. Needs sharp, which the image sync scripts already use.
 */
import sharp from 'sharp';

const SITE = (process.env.SITE_URL || 'https://www.nickelbusbar.com').replace(/\/+$/, '');
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const sitemap = await (await fetch(`${SITE}/sitemap.xml`, { headers: { 'User-Agent': UA } })).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`sitemap URLs: ${urls.length}`);

const imageInfo = new Map();
async function inspect(url) {
  if (imageInfo.has(url)) return imageInfo.get(url);
  const info = { url, problems: [] };
  try {
    const head = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    info.status = head.status;
    info.type = head.headers.get('content-type') || '';
    info.robots = head.headers.get('x-robots-tag') || '';
    info.host = new URL(head.url).host;
    if (head.status !== 200) info.problems.push(`HTTP ${head.status}`);
    if (!/^image\//.test(info.type)) info.problems.push(`not an image (${info.type})`);
    if (/noindex|none/i.test(info.robots)) info.problems.push(`X-Robots-Tag: ${info.robots}`);
    if (info.host !== 'www.nickelbusbar.com') info.problems.push(`third-party host ${info.host}`);
    if (head.status === 200 && /^image\//.test(info.type)) {
      const buf = Buffer.from(await head.arrayBuffer());
      const meta = await sharp(buf).metadata();
      info.w = meta.width; info.h = meta.height; info.kb = Math.round(buf.length / 1024);
      if (/svg/.test(info.type)) info.problems.push('SVG (not used for social/og previews)');
      else if (meta.width < 696) info.problems.push(`small: ${meta.width}x${meta.height}`);
    }
  } catch (e) {
    info.problems.push('fetch failed: ' + String(e).slice(0, 60));
  }
  imageInfo.set(url, info);
  return info;
}

const rows = [];
for (const url of urls) {
  const path = url.replace(SITE, '') || '/';
  let html = '';
  try { html = await (await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })).text(); } catch { /* reported below */ }
  const og = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/)?.[1] ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/)?.[1];
  const tw = html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/)?.[1];
  const ld = [...html.matchAll(/"image":\s*(\[[^\]]*\]|"[^"]+")/g)].flatMap((m) => { try { const v = JSON.parse(m[1]); return Array.isArray(v) ? v : [v]; } catch { return []; } }).filter((v) => typeof v === 'string');
  const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]).filter((s) => !s.startsWith('data:'));
  const abs = (s) => (s.startsWith('http') ? s : SITE + s);
  const primary = og ? abs(og) : null;
  const primaryInfo = primary ? await inspect(primary) : null;
  const kind = path.startsWith('/blog/') && path !== '/blog' ? 'blog' : path.startsWith('/product/') ? 'product' : path.startsWith('/guides') ? 'guide' : path === '/' ? 'home' : /manufacturer|exporter|wholesaler|nickel-strip-for|nickel-busbar-for|pure-nickel|h-type/.test(path) ? 'landing' : 'other';
  rows.push({ path, kind, og, tw, ldImage: ld[0], firstImg: imgs[0] && abs(imgs[0]), primaryInfo });
}

const bad = rows.filter((r) => !r.og || r.primaryInfo?.problems.length);
const byKind = {};
for (const r of rows) {
  const k = (byKind[r.kind] ??= { total: 0, ok: 0, noOg: 0, blocked: 0, thirdParty: 0, small: 0, svg: 0 });
  k.total++;
  if (!r.og) k.noOg++;
  else if (!r.primaryInfo.problems.length) k.ok++;
  for (const p of r.primaryInfo?.problems ?? []) {
    if (/X-Robots/.test(p)) k.blocked++;
    if (/third-party/.test(p)) k.thirdParty++;
    if (/small/.test(p)) k.small++;
    if (/SVG/.test(p)) k.svg++;
  }
}
console.log('\nby page type (primary = og:image):');
console.table(byKind);

console.log('\nproblem pages:');
for (const r of bad) {
  console.log(`  ${r.kind.padEnd(8)} ${r.path}`);
  console.log(`           og:image ${r.og ? (r.og.length > 90 ? r.og.slice(0, 90) + '...' : r.og) : '(none)'}  ->  ${r.primaryInfo ? r.primaryInfo.problems.join('; ') : 'no og:image'}`);
}
console.log(`\nunique og images checked: ${imageInfo.size}`);
if (bad.length) {
  console.log(`\nFAILED: ${bad.length} of ${rows.length} pages have no usable thumbnail image.`);
  process.exit(1);
}
console.log(`\nPASSED: all ${rows.length} pages name an image Google can use.`);
