// Fails when a dependency in package-lock.json has a known vulnerability rated
// high or critical (CVSS 7.0 or more).
//
// osv-scanner has no severity threshold of its own, so this runs it with JSON
// output and applies the threshold here. A finding with no score is treated as
// high: an unrated vulnerability is not proof that it is harmless.
// Ignores live in osv-scanner.toml, each with a reason and an end date.
import { spawnSync } from 'node:child_process';

if (process.env.SKIP_SCANS) {
  console.log('SKIP_SCANS is set; the scan job runs this');
  process.exit(0);
}

const THRESHOLD = 7.0;
const lockfiles = ['package-lock.json'];

const run = spawnSync(
  'osv-scanner',
  ['scan', 'source', '--format', 'json', '--config', 'osv-scanner.toml', ...lockfiles.flatMap((f) => ['--lockfile', f])],
  { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
);

if (run.error) {
  console.error(`could not run osv-scanner (${run.error.message}); install it with: brew install osv-scanner`);
  process.exit(2);
}

// Exit 0 is clean and 1 means findings (judged below); anything else is an error.
let report;
try {
  report = JSON.parse(run.stdout);
} catch {
  report = null;
}
if (!report || (run.status !== 0 && run.status !== 1)) {
  console.error(run.stderr || run.stdout);
  console.error(`osv-scanner did not produce a report (exit ${run.status})`);
  process.exit(2);
}

const failures = [];
for (const result of report.results ?? []) {
  for (const pkg of result.packages ?? []) {
    for (const group of pkg.groups ?? []) {
      const score = Number.parseFloat(group.max_severity);
      if (Number.isNaN(score) || score >= THRESHOLD) {
        failures.push(
          `${pkg.package.name}@${pkg.package.version} (${result.source?.path}): ${group.ids.join(', ')}, severity ${group.max_severity || 'unrated'}`,
        );
      }
    }
  }
}

if (failures.length) {
  console.error(`${failures.length} vulnerabilit${failures.length === 1 ? 'y' : 'ies'} rated high or critical:\n`);
  for (const line of failures) console.error(`  ${line}`);
  console.error('\nUpdate the dependency, or add an entry with a reason and an end date to osv-scanner.toml.');
  process.exit(1);
}
console.log('no high or critical vulnerabilities in the lockfiles');
