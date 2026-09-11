/**
 * Writes public/version.json: the commit this build was made from.
 *
 * "Is my change live?" had no reliable answer. A push reaching GitHub proves nothing about the
 * site: when the repository moved to a new owner, Vercel's GitHub app lost access to it, every
 * push still succeeded, and three commits sat unbuilt for four days while production kept
 * serving an older build. The only way to tell was to grep the live HTML for text a change had
 * introduced, or compare JavaScript bundle hashes by eye.
 *
 * With the commit published at /version.json, the post-deploy smoke workflow waits until
 * production serves the commit that triggered it before checking anything, and fails with a
 * message naming the problem if that never happens.
 */
import { execSync } from "child_process";
import { writeFileSync } from "fs";
import path from "path";

function resolveCommit(): string {
  // Vercel and GitHub Actions both expose the commit being built. A local build falls back to git,
  // and a build with neither (a bare CLI upload) says so rather than guessing.
  const fromEnvironment = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA;
  if (fromEnvironment) return fromEnvironment;
  try {
    return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "unknown";
  }
}

const info = { commit: resolveCommit(), builtAt: new Date().toISOString() };
writeFileSync(path.resolve(process.cwd(), "public/version.json"), `${JSON.stringify(info, null, 2)}\n`);
console.log(`[build-info] public/version.json -> ${info.commit.slice(0, 7)}`);
