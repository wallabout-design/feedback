// Releases the version in package.json: an annotated tag on origin/main, pushed,
// and a GitHub release for it. Always annotated, because Dependabot misses
// lightweight tags (wallabout-design/feedback#9).
//
//   npm run release              release the version in package.json
//   npm run release -- --dry-run  run every check, then stop before tagging
import { execFileSync } from 'node:child_process';
import { checkTag } from './tag-check.mjs';

const dryRun = process.argv.includes('--dry-run');
const run = (cmd, ...args) => execFileSync(cmd, args, { encoding: 'utf8' }).trim();
const fail = (msg) => {
  console.error(`error: ${msg}`);
  process.exit(1);
};

run('git', 'fetch', 'origin', 'main', '--tags');
const sha = run('git', 'rev-parse', 'origin/main');
const { version } = JSON.parse(run('git', 'show', 'origin/main:package.json'));
const tag = `v${version}`;
if (!/^\d+\.\d+\.\d+$/.test(version)) fail(`package.json version "${version}" is not X.Y.Z`);

const exists = (ref) => {
  try {
    run('git', 'rev-parse', '--verify', '--quiet', ref);
    return true;
  } catch {
    return false;
  }
};
if (exists(`refs/tags/${tag}`)) fail(`${tag} already exists. Bump version in package.json in a PR first.`);
if (run('git', 'ls-remote', '--tags', 'origin', `refs/tags/${tag}`)) fail(`${tag} already exists on origin`);

// origin/main must be green: the "test" check on its commit.
const repo = run('gh', 'repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner');
const state = run(
  'gh', 'api', `repos/${repo}/commits/${sha}/check-runs`,
  '--jq', '[.check_runs[] | select(.name == "test")] | map(.conclusion) | join(",")',
);
if (state !== 'success') fail(`CI on origin/main (${sha.slice(0, 7)}) is not green (test: ${state || 'not found'})`);

console.log(`${tag} on origin/main ${sha.slice(0, 7)}, CI green`);
if (dryRun) {
  console.log('dry run: stopping before the tag is made');
  process.exit(0);
}

run('git', 'tag', '-a', tag, '-m', `${tag}`, sha);
const problems = checkTag(tag);
if (problems.length) {
  run('git', 'tag', '-d', tag);
  fail(problems.join('\n'));
}
run('git', 'push', 'origin', `refs/tags/${tag}`);
console.log(run('gh', 'release', 'create', tag, '--verify-tag', '--generate-notes'));
