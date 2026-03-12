import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { compile } from '../src/compiler/index.js';
import { generateHtml } from '../src/visualize/index.js';
import { dashboardSpec, configSpec } from '../examples/sample.spec.js';

async function main() {
  const html = generateHtml([compile(dashboardSpec), compile(configSpec)]);

  const docsDir = path.join(process.cwd(), 'docs');
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, 'wireframe-example.html'), html);
  console.log('Saved docs/wireframe-example.html');

  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });

  await new Promise<void>((resolve) => server.listen(3458, resolve));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://localhost:3458');
  await page.waitForLoadState('networkidle');

  await page.screenshot({
    fullPage: true,
    path: path.join(docsDir, 'wireframe-example.png'),
  });
  console.log('Saved docs/wireframe-example.png');

  const snapshotDir = path.join(process.cwd(), 'integration', '__snapshots__');
  fs.mkdirSync(snapshotDir, { recursive: true });
  await page.screenshot({
    fullPage: true,
    path: path.join(snapshotDir, 'wireframe.reference.png'),
  });
  console.log('Saved integration/__snapshots__/wireframe.reference.png');

  await browser.close();
  server.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
