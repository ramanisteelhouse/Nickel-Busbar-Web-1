/**
 * Prints the bookmarkable review queue URL.
 *
 *     npx tsx scripts/review-queue-url.ts
 *
 * The queue at /api/reviews/pending is protected by an HMAC of JWT_SECRET rather than a login,
 * because the page has to be usable by tapping a link on a phone and a header cannot be set that
 * way. That leaves the question of how you get the URL the first time: the token is derived from
 * a secret, so it cannot be printed in a deploy log or committed anywhere.
 *
 * So it is computed locally, from the same JWT_SECRET the server uses. Run it once, bookmark the
 * result. Every new-review alert also carries the link, so a lost bookmark can be recovered from
 * any past alert.
 *
 * The URL changes only if JWT_SECRET is rotated — which is the intended behaviour, since a
 * rotated secret should invalidate every moderation link that was ever sent out.
 */
import "dotenv/config";
import { createHmac } from "node:crypto";

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error(
    "JWT_SECRET is not set. Put the production value in .env, or read it from the Vercel project's\n" +
      "environment variables — the token has to be derived from the same secret the server uses."
  );
  process.exit(1);
}

const site = (process.env.SITE_URL || "https://www.nickelbusbar.com").replace(/\/+$/, "");
const token = createHmac("sha256", secret).update("reviews:pending").digest("hex").slice(0, 32);

console.log(`${site}/api/reviews/pending?token=${token}`);
