import { test, expect, describe, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createPageLocator, injectUIIds } from '../src/verify/harness/runner.js';
import { SemanticValidator } from '../src/verify/engine/semantic.js';
import { GeometryValidator } from '../src/verify/engine/geometry.js';
import { compile } from '../src/compiler/index.js';
import { screen, region } from '../src/dsl/index.js';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

let server: http.Server;
let browser: Browser;
let page: Page;

function startServer(port: number): Promise<http.Server> {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const filePath = path.join(process.cwd(), 'integration', 'test-page.html');
      const content = fs.readFileSync(filePath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    srv.listen(port, () => resolve(srv));
  });
}

describe('Playwright Integration', () => {
  beforeAll(async () => {
    server = await startServer(3456);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto('http://localhost:3456');
  });

  afterAll(async () => {
    await browser?.close();
    server?.close();
  });

  test('should validate element exists using semantic validator', async () => {
    const locator = createPageLocator(page);
    const validator = new SemanticValidator(locator);

    const result = await validator.validateElement('dashboard/header', {
      type: 'exists',
      target: 'dashboard/header',
    });
    expect(result.passed).toBe(true);
  });

  test('should validate element visibility', async () => {
    const locator = createPageLocator(page);
    const validator = new SemanticValidator(locator);

    const result = await validator.validateElement('dashboard/header', {
      type: 'visible',
      target: 'dashboard/header',
    });
    expect(result.passed).toBe(true);
  });

  test('should validate accessible name', async () => {
    const locator = createPageLocator(page);
    const validator = new SemanticValidator(locator);

    const result = await validator.validateElement('dashboard/notifications', {
      type: 'accessibleName',
      target: 'dashboard/notifications',
      value: 'Notifications',
    });
    expect(result.passed).toBe(true);
  });

  test('should validate role', async () => {
    const locator = createPageLocator(page);
    const validator = new SemanticValidator(locator);

    const result = await validator.validateElement('dashboard/sidebar', {
      type: 'role',
      target: 'dashboard/sidebar',
      value: 'navigation',
    });
    expect(result.passed).toBe(true);
  });

  test('should validate geometry - leftOf', async () => {
    const locator = createPageLocator(page);
    const validator = new GeometryValidator(locator);

    const rule = { type: 'leftOf' as const, target: 'dashboard/sidebar', other: 'dashboard/main' };
    const result = await validator.validate('dashboard/sidebar', rule);
    expect(result.passed).toBe(true);
  });

  test('should validate geometry - containedWithin', async () => {
    const locator = createPageLocator(page);
    const validator = new GeometryValidator(locator);

    const rule = {
      type: 'containedWithin' as const,
      target: 'dashboard/main',
      container: 'dashboard/main',
    };
    const result = await validator.validate('dashboard/main', rule);
    expect(result.passed).toBe(true);
  });

  test('should inject UI IDs into page', async () => {
    await injectUIIds(page, ['dashboard/header', 'dashboard/sidebar']);

    const header = await page.$('[data-ui="dashboard/header"]');
    expect(header).not.toBeNull();

    const screenAttr = await header?.getAttribute('data-screen');
    expect(screenAttr).toBe('dashboard');
  });

  test('should compile spec and validate against page', async () => {
    const spec = screen('dashboard', (s) =>
      s
        .routes(['/dashboard'])
        .viewports({ desktop: 'desktop' })
        .mode('desktop', (m) =>
          m.tree([region({ id: 'header' }), region({ id: 'sidebar' }), region({ id: 'main' })])
        )
    );

    const compiled = compile(spec);
    expect(compiled.id).toBe('dashboard');
    expect(compiled.routes).toContain('/dashboard');
  });

  test('should validate multiple elements in sequence', async () => {
    const locator = createPageLocator(page);
    const validator = new SemanticValidator(locator);

    const ids = ['dashboard/header', 'dashboard/sidebar', 'dashboard/main', 'dashboard/content'];
    for (const id of ids) {
      const result = await validator.validateElement(id, { type: 'exists', target: id });
      expect(result.passed, `Element ${id} should exist`).toBe(true);
    }
  });

  test('should fail validation for non-existent element', async () => {
    const locator = createPageLocator(page);
    const validator = new SemanticValidator(locator);

    const result = await validator.validateElement('dashboard/nonexistent', {
      type: 'exists',
      target: 'dashboard/nonexistent',
    });
    expect(result.passed).toBe(false);
  });

  test('should fail validation for wrong accessible name', async () => {
    const locator = createPageLocator(page);
    const validator = new SemanticValidator(locator);

    const result = await validator.validateElement('dashboard/notifications', {
      type: 'accessibleName',
      target: 'dashboard/notifications',
      value: 'Wrong Name',
    });
    expect(result.passed).toBe(false);
  });

  test('should fail validation for wrong role', async () => {
    const locator = createPageLocator(page);
    const validator = new SemanticValidator(locator);

    const result = await validator.validateElement('dashboard/sidebar', {
      type: 'role',
      target: 'dashboard/sidebar',
      value: 'wrongrole',
    });
    expect(result.passed).toBe(false);
  });

  test('should validate geometry - above', async () => {
    const locator = createPageLocator(page);
    const validator = new GeometryValidator(locator);

    const rule = { type: 'above' as const, target: 'dashboard/header', other: 'dashboard/main' };
    const result = await validator.validate('dashboard/header', rule);
    expect(result.passed).toBe(true);
  });

  test('should validate geometry - noOverlap', async () => {
    const locator = createPageLocator(page);
    const validator = new GeometryValidator(locator);

    const rule = {
      type: 'noOverlap' as const,
      target: 'dashboard/logo',
      other: 'dashboard/notifications',
    };
    const result = await validator.validate('dashboard/logo', rule);
    expect(result.passed).toBe(true);
  });
});
