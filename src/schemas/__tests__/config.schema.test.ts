import { describe, it, expect } from 'vitest';
import { ConfigSchema } from '../config.schema.js';

describe('ConfigSchema', () => {
  const validConfig = {
    appUrl: 'http://localhost:3000',
    screens: [
      {
        id: 'home',
        routes: ['/'],
        viewports: { desktop: 'desktop' },
        modes: { desktop: { tree: [] } },
      },
    ],
    fixtures: [{ id: 'normal', data: {} }],
  };

  it('should accept valid config', () => {
    const result = ConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('should accept config without fixtures', () => {
    const configWithoutFixtures = {
      appUrl: 'http://localhost:3000',
      screens: [
        {
          id: 'home',
          routes: ['/'],
          viewports: { desktop: 'desktop' },
          modes: { desktop: { tree: [] } },
        },
      ],
    };
    const result = ConfigSchema.safeParse(configWithoutFixtures);
    expect(result.success).toBe(true);
  });

  it('should reject config without appUrl', () => {
    const configWithoutUrl = {
      screens: [],
    };
    const result = ConfigSchema.safeParse(configWithoutUrl);
    expect(result.success).toBe(false);
  });

  it('should reject config without screens', () => {
    const configWithoutScreens = {
      appUrl: 'http://localhost:3000',
    };
    const result = ConfigSchema.safeParse(configWithoutScreens);
    expect(result.success).toBe(false);
  });

  it('should reject empty screens array', () => {
    const configWithEmptyScreens = {
      appUrl: 'http://localhost:3000',
      screens: [],
    };
    const result = ConfigSchema.safeParse(configWithEmptyScreens);
    expect(result.success).toBe(false);
  });

  it('should accept config with browser options', () => {
    const configWithBrowser = {
      appUrl: 'http://localhost:3000',
      screens: [
        {
          id: 'home',
          routes: ['/'],
          viewports: { desktop: 'desktop' },
          modes: { desktop: { tree: [] } },
        },
      ],
      browser: {
        headless: false,
        viewport: { width: 1920, height: 1080 },
      },
    };
    const result = ConfigSchema.safeParse(configWithBrowser);
    expect(result.success).toBe(true);
  });

  it('should accept config with stability gates', () => {
    const configWithStability = {
      appUrl: 'http://localhost:3000',
      screens: [
        {
          id: 'home',
          routes: ['/'],
          viewports: { desktop: 'desktop' },
          modes: { desktop: { tree: [] } },
        },
      ],
      stability: {
        hydratedMarker: '[data-hydrated]',
        fontsReady: true,
        networkSettled: true,
      },
    };
    const result = ConfigSchema.safeParse(configWithStability);
    expect(result.success).toBe(true);
  });
});
