import { test, expect, describe, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../src/compiler/index.js';
import { generateHtml } from '../src/visualize/index.js';
import { dashboardSpec, configSpec } from '../examples/sample.spec.js';

const SNAPSHOT_DIR = path.join(process.cwd(), 'integration', '__snapshots__');
const VIEWPORT = { width: 1280, height: 900 };

let server: http.Server;
let browser: Browser;
let page: Page;
let wireframeHtml: string;

function startServer(port: number, html: string): Promise<http.Server> {
  return new Promise((resolve) => {
    const srv = http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    });
    srv.listen(port, () => resolve(srv));
  });
}

function compareScreenshots(actual: Buffer, referencePath: string, tolerance: number): boolean {
  if (!fs.existsSync(referencePath)) {
    return false;
  }
  const reference = fs.readFileSync(referencePath);

  if (actual.length !== reference.length) {
    const sizeDiff =
      Math.abs(actual.length - reference.length) / Math.max(actual.length, reference.length);
    return sizeDiff < tolerance;
  }

  let diffPixels = 0;
  const totalBytes = Math.min(actual.length, reference.length);
  for (let i = 0; i < totalBytes; i++) {
    if (actual[i] !== reference[i]) {
      diffPixels++;
    }
  }

  const diffRatio = diffPixels / totalBytes;
  return diffRatio < tolerance;
}

describe('Visualize E2E', () => {
  beforeAll(async () => {
    wireframeHtml = generateHtml([compile(dashboardSpec), compile(configSpec)]);

    server = await startServer(3457, wireframeHtml);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: VIEWPORT });
    page = await context.newPage();
    await page.goto('http://localhost:3457');
    await page.waitForLoadState('networkidle');
  });

  afterAll(async () => {
    await browser?.close();
    server?.close();
  });

  test('should render wireframe page with correct title', async () => {
    const title = await page.title();
    expect(title).toBe('UISpec Wireframe');
  });

  test('should render screen headings', async () => {
    const headings = await page.$$eval('.screen h2', (els) => els.map((el) => el.textContent));
    expect(headings).toContain('dashboard');
    expect(headings).toContain('config');
  });

  test('should render all mode sections for dashboard', async () => {
    const modes = await page.$$eval('.screen:first-of-type .mode h3', (els) =>
      els.map((el) => el.textContent)
    );
    expect(modes).toContain('desktop');
    expect(modes).toContain('tablet');
    expect(modes).toContain('mobile');
  });

  test('should render node boxes with correct kind labels', async () => {
    const kinds = await page.$$eval('.kind', (els) => els.map((el) => el.textContent));
    expect(kinds).toContain('REGION');
    expect(kinds).toContain('COMPONENT');
    expect(kinds).toContain('CONTROL');
    expect(kinds).toContain('CONTAINER');
  });

  test('should render semantic annotations', async () => {
    const semantics = await page.$$eval('.semantics', (els) => els.map((el) => el.textContent));
    const allText = semantics.join(' ');
    expect(allText).toContain('Company Logo');
    expect(allText).toContain('searchbox');
  });

  test('should render legend with all node kinds', async () => {
    const legendItems = await page.$$eval('.legend-item', (els) =>
      els.map((el) => el.textContent?.trim())
    );
    expect(legendItems).toContain('region');
    expect(legendItems).toContain('component');
    expect(legendItems).toContain('control');
    expect(legendItems).toContain('container');
    expect(legendItems).toContain('collection');
    expect(legendItems).toContain('overlayAnchor');
  });

  test('should render overlays section', async () => {
    const overlayNames = await page.$$eval('.overlay strong', (els) =>
      els.map((el) => el.textContent)
    );
    expect(overlayNames).toContain('settingsModal');
    expect(overlayNames).toContain('userMenuDropdown');
  });

  test('should render flows section', async () => {
    const flowNames = await page.$$eval('.flow strong', (els) => els.map((el) => el.textContent));
    expect(flowNames).toContain('openSettings');
    expect(flowNames).toContain('search');
  });

  test('should match reference screenshot', async () => {
    const screenshotPath = path.join(SNAPSHOT_DIR, 'wireframe.actual.png');
    const referencePath = path.join(SNAPSHOT_DIR, 'wireframe.reference.png');

    const screenshot = await page.screenshot({ fullPage: true });
    fs.writeFileSync(screenshotPath, screenshot);

    if (!fs.existsSync(referencePath)) {
      fs.writeFileSync(referencePath, screenshot);
      console.log(`Reference screenshot saved to ${referencePath}. Re-run to compare.`);
      return;
    }

    const isMatch = compareScreenshots(screenshot, referencePath, 0.05);
    expect(isMatch, 'Screenshot should match reference within 5% tolerance').toBe(true);
  });

  test('should produce full-page screenshot with expected dimensions', async () => {
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot.length).toBeGreaterThan(10000);
  });
});
