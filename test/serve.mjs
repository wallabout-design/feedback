// Static server for the browser tests: the repo root, with a CSP that blocks inline
// scripts, like the sites that use this package.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(import.meta.dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const port = Number(process.argv[2] ?? 4322);

createServer(async (req, res) => {
  const path = normalize(new URL(req.url, 'http://x').pathname);
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, {
      'content-type': types[extname(path)] ?? 'application/octet-stream',
      'content-security-policy': "default-src 'self'",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port);
