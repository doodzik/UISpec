import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createRunner,
  destroyRunner,
  createPageLocator,
  injectUIIds,
  type ValidationContext,
} from '../src/verify/harness/runner.js';
import * as http from 'http';

let server: http.Server;
let context: ValidationContext;

const testHtml = `
<!DOCTYPE html>
<html>
<body>
  <div id="header" data-ui="test/header">Header</div>
  <div id="footer" data-ui="test/footer">Footer</div>
</body>
</html>
`;

function startServer(port: number): Promise<http.Server> {
  return new Promise((resolve) => {
    const srv = http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(testHtml);
    });
    srv.listen(port, () => resolve(srv));
  });
}

describe('Runner Functions', () => {
  beforeAll(async () => {
    server = await startServer(4567);
    context = await createRunner({ appUrl: 'http://localhost:4567', headless: true });
  });

  afterAll(async () => {
    await destroyRunner(context);
    server.close();
  });

  it('should create runner with custom viewport', async () => {
    const ctx = await createRunner({
      appUrl: 'http://localhost:4567',
      headless: true,
      viewport: { width: 1280, height: 720 },
    });
    await destroyRunner(ctx);
  });

  it('should create page locator', () => {
    const locator = createPageLocator(context.page);
    expect(locator).toBeDefined();
    expect(typeof locator.locator).toBe('function');
  });

  it('should inject UI IDs', async () => {
    await injectUIIds(context.page, ['test/header']);
    const header = await context.page.$('[data-ui="test/header"]');
    expect(header).not.toBeNull();
  });

  it('should count elements', async () => {
    const locator = createPageLocator(context.page);
    const count = await locator.locator('[data-ui="test/header"]').count();
    expect(count).toBe(1);
  });

  it('should get first element', async () => {
    const locator = createPageLocator(context.page);
    const el = await locator.locator('[data-ui="test/header"]').first();
    expect(el).toBeDefined();
  });

  it('should get all elements', async () => {
    const locator = createPageLocator(context.page);
    const elements = await locator.locator('[data-ui^="test/"]').all();
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should get element attributes', async () => {
    const locator = createPageLocator(context.page);
    const el = await locator.locator('[data-ui="test/header"]').first();
    const id = await el.getAttribute('id');
    expect(id).toBe('header');
  });

  it('should get bounding box', async () => {
    const locator = createPageLocator(context.page);
    const el = await locator.locator('[data-ui="test/header"]').first();
    const box = await el.boundingBox();
    expect(box).toBeDefined();
    expect(box?.x).toBeDefined();
    expect(box?.y).toBeDefined();
    expect(box?.width).toBeDefined();
    expect(box?.height).toBeDefined();
  });
});

describe('Runner Edge Cases', () => {
  let srv: http.Server;

  beforeAll(async () => {
    srv = await startServer(5678);
  });

  afterAll(() => {
    srv.close();
  });

  it('should handle non-existent elements gracefully', async () => {
    const ctx = await createRunner({ appUrl: 'http://localhost:5678', headless: true });
    const locator = createPageLocator(ctx.page);

    const count = await locator.locator('[data-ui="nonexistent"]').count();
    expect(count).toBe(0);

    await destroyRunner(ctx);
  });
});
