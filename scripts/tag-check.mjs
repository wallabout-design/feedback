// Checks that a release tag is annotated and matches package.json's version at
// that tag. Used by `npm run release` and by .github/workflows/tag-check.yml.
// Dependabot reads a git dependency's releases from annotated tags only; a
// lightweight tag is missed, and Dependabot then proposes a downgrade
// (wallabout-design/feedback#9).
//
//   node scripts/tag-check.mjs v0.4.0
import { execFileSync } from 'node:child_process';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

export function checkTag(tag) {
  const problems = [];
  if (!/^v\d+\.\d+\.\d+$/.test(tag)) problems.push(`${tag} is not vX.Y.Z`);
  let kind;
  try {
    kind = git('cat-file', '-t', `refs/tags/${tag}`);
  } catch {
    return [...problems, `${tag} does not exist here (fetch it first)`];
  }
  if (kind !== 'tag') {
    problems.push(
      `${tag} is a lightweight tag (git cat-file -t prints "${kind}"). Delete it and make an annotated one with npm run release.`,
    );
  }
  try {
    const pkg = JSON.parse(git('show', `refs/tags/${tag}^{commit}:package.json`));
    if (`v${pkg.version}` !== tag) {
      problems.push(`${tag} does not match package.json version ${pkg.version} at that commit`);
    }
  } catch {
    problems.push(`could not read package.json at ${tag}`);
  }
  return problems;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const tag = process.argv[2];
  if (!tag) {
    console.error('usage: node scripts/tag-check.mjs vX.Y.Z');
    process.exit(2);
  }
  const problems = checkTag(tag);
  for (const p of problems) console.error(`error: ${p}`);
  if (problems.length) process.exit(1);
  console.log(`${tag}: annotated, matches package.json`);
}
