// Checks that every internal href and src in the built HTML resolves to a
// file in dist/, using the same rewrite rules as the CloudFront function in
// src/static-hosting-stack.ts. Run after "npm run build".
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? 'dist';

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      // The Pagefind bundle is generated and has no site links.
      return name === 'pagefind' ? [] : htmlFiles(path);
    }
    return path.endsWith('.html') ? [path] : [];
  });
}

function resolve(uri) {
  if (uri === '/' || uri.endsWith('/')) return `${uri}index.html`;
  if (!uri.includes('.')) return `${uri}.html`;
  return uri;
}

let checked = 0;
const broken = [];
for (const file of htmlFiles(root)) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    checked += 1;
    const uri = decodeURIComponent(match[1]);
    if (!existsSync(join(root, resolve(uri)))) {
      broken.push(`${uri} (in ${file.slice(root.length)})`);
    }
  }
}

console.log(`Checked ${checked} internal links, ${broken.length} broken.`);
for (const entry of broken) console.error(`  ${entry}`);
process.exit(broken.length > 0 ? 1 : 0);
