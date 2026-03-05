import { describe, it, expect } from 'vitest';
import { ScreenSchema } from '../screen.schema.js';

describe('ScreenSchema', () => {
  const validScreen = {
    id: 'config',
    routes: ['/config'],
    viewports: {
      desktop: 'desktopSidebar',
    },
    modes: {
      desktopSidebar: {
        tree: [
          { id: 'header', kind: 'region' as const },
          { id: 'content', kind: 'region' as const, children: [] },
        ],
      },
    },
  };

  it('should accept valid screen', () => {
    const result = ScreenSchema.safeParse(validScreen);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('config');
      expect(result.data.routes).toEqual(['/config']);
    }
  });

  it('should accept screen with multiple viewports', () => {
    const screenWithMultipleViewports = {
      id: 'config',
      routes: ['/config'],
      viewports: {
        desktop: 'desktopSidebar',
        tablet: 'tabletStacked',
        mobile: 'mobileDrawer',
      },
      modes: {
        desktopSidebar: { tree: [] },
        tabletStacked: { tree: [] },
        mobileDrawer: { tree: [] },
      },
    };
    const result = ScreenSchema.safeParse(screenWithMultipleViewports);
    expect(result.success).toBe(true);
  });

  it('should reject screen without id', () => {
    const screenWithoutId = {
      routes: ['/config'],
      viewports: { desktop: 'desktop' },
      modes: { desktop: { tree: [] } },
    };
    const result = ScreenSchema.safeParse(screenWithoutId);
    expect(result.success).toBe(false);
  });

  it('should reject screen without routes', () => {
    const screenWithoutRoutes = {
      id: 'config',
      viewports: { desktop: 'desktop' },
      modes: { desktop: { tree: [] } },
    };
    const result = ScreenSchema.safeParse(screenWithoutRoutes);
    expect(result.success).toBe(false);
  });

  it('should reject screen without viewports', () => {
    const screenWithoutViewports = {
      id: 'config',
      routes: ['/config'],
      modes: { desktop: { tree: [] } },
    };
    const result = ScreenSchema.safeParse(screenWithoutViewports);
    expect(result.success).toBe(false);
  });

  it('should reject screen without modes', () => {
    const screenWithoutModes = {
      id: 'config',
      routes: ['/config'],
      viewports: { desktop: 'desktop' },
    };
    const result = ScreenSchema.safeParse(screenWithoutModes);
    expect(result.success).toBe(false);
  });

  it('should accept screen with overlays', () => {
    const screenWithOverlays = {
      id: 'config',
      routes: ['/config'],
      viewports: { desktop: 'desktop' },
      modes: { desktop: { tree: [] } },
      overlays: {
        modal: {
          id: 'settingsModal',
          route: '/config/settings',
          anchor: 'main',
        },
      },
    };
    const result = ScreenSchema.safeParse(screenWithOverlays);
    expect(result.success).toBe(true);
  });

  it('should accept screen with flows', () => {
    const screenWithFlows = {
      id: 'config',
      routes: ['/config'],
      viewports: { desktop: 'desktop' },
      modes: { desktop: { tree: [] } },
      flows: {
        openSettings: [
          { action: 'click', target: 'settingsButton' },
          { action: 'expect', route: '/config/settings' },
        ],
      },
    };
    const result = ScreenSchema.safeParse(screenWithFlows);
    expect(result.success).toBe(true);
  });

  it('should accept screen with invariants', () => {
    const screenWithInvariants = {
      id: 'config',
      routes: ['/config'],
      viewports: { desktop: 'desktop' },
      modes: { desktop: { tree: [] } },
      invariants: [
        {
          id: 'headerVisible',
          description: 'Header must always be visible',
          target: 'header',
          conditions: [{ type: 'visible' }],
        },
      ],
    };
    const result = ScreenSchema.safeParse(screenWithInvariants);
    expect(result.success).toBe(true);
  });
});
