import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const script = resolve('scripts/tag-check.mjs');

function repo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'tag-check-'));
  const git = (...a: string[]) => execFileSync('git', a, { cwd: dir, stdio: 'pipe' });
  git('init', '-q');
  git('config', 'user.email', 't@example.com');
  git('config', 'user.name', 't');
  git('config', 'tag.gpgsign', 'false');
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ version: '1.2.3' }));
  git('add', 'package.json');
  git('commit', '-q', '-m', 'x');
  return dir;
}

function check(dir: string, tag: string): { ok: boolean; out: string } {
  try {
    const out = execFileSync('node', [script, tag], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: String((e as { stderr?: string }).stderr) };
  }
}

test('accepts an annotated tag that matches package.json', () => {
  const dir = repo();
  execFileSync('git', ['tag', '-a', 'v1.2.3', '-m', 'v1.2.3'], { cwd: dir });
  expect(check(dir, 'v1.2.3').ok).toBe(true);
});

test('rejects a lightweight tag', () => {
  const dir = repo();
  execFileSync('git', ['tag', 'v1.2.3'], { cwd: dir });
  const r = check(dir, 'v1.2.3');
  expect(r.ok).toBe(false);
  expect(r.out).toContain('lightweight');
});

test('rejects a tag that does not match package.json', () => {
  const dir = repo();
  execFileSync('git', ['tag', '-a', 'v1.2.4', '-m', 'v1.2.4'], { cwd: dir });
  const r = check(dir, 'v1.2.4');
  expect(r.ok).toBe(false);
  expect(r.out).toContain('does not match');
});
