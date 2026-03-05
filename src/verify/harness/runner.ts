/* eslint-disable @typescript-eslint/no-explicit-any */
import { chromium, type Browser, type Page } from 'playwright';

export interface RunnerOptions {
  appUrl: string;
  headless?: boolean;
  viewport?: { width: number; height: number };
}

export interface ValidationContext {
  page: Page;
  browser: Browser;
}

export async function createRunner(options: RunnerOptions): Promise<ValidationContext> {
  const browser = await chromium.launch({
    headless: options.headless ?? true,
  });

  const context = await browser.newContext({
    viewport: options.viewport ?? { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  await page.goto(options.appUrl);

  await page.evaluate(() => {
    const doc = (globalThis as any).document;
    if (!doc) return;
    const style = doc.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
      }
    `;
    doc.head.appendChild(style);
  });

  return { page, browser };
}

export async function destroyRunner(ctx: ValidationContext): Promise<void> {
  await ctx.browser.close();
}

export function createPageLocator(page: Page) {
  return {
    locator: (selector: string) => ({
      count: async () => {
        const elements = await page.locator(selector).count();
        return elements;
      },
      first: async () => {
        const element = page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        const boundingBox = await element.boundingBox().catch(() => null);
        return {
          isVisible: async () => isVisible,
          getAttribute: async (attr: string) => {
            return await element.getAttribute(attr).catch(() => null);
          },
          boundingBox: async () => boundingBox,
        };
      },
      all: async () => {
        const elements = await page.locator(selector).all();
        return Promise.all(
          elements.map(async (element) => {
            const isVisible = await element.isVisible().catch(() => false);
            const boundingBox = await element.boundingBox().catch(() => null);
            return {
              isVisible: async () => isVisible,
              getAttribute: async (attr: string) => {
                return await element.getAttribute(attr).catch(() => null);
              },
              boundingBox: async () => boundingBox,
            };
          })
        );
      },
    }),
  };
}

export async function injectUIIds(page: Page, uiIds: string[]): Promise<void> {
  await page.evaluate((ids) => {
    const doc = (globalThis as any).document;
    if (!doc) return;
    for (const id of ids) {
      const [screenId, nodeId] = id.split('/');
      if (screenId && nodeId) {
        const elements = doc.querySelectorAll(`[data-ui="${id}"]`);
        elements.forEach((el: any) => {
          el.setAttribute('data-screen', screenId);
          el.setAttribute('data-node', nodeId);
        });
      }
    }
  }, uiIds);
}
