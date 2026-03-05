import { describe, it, expect } from 'vitest';
import { screen, region, component, control } from '../src/dsl/index.js';
import { compile, generateCatalogs } from '../src/compiler/index.js';
import { validateConfig } from '../src/cli/index.js';

describe('Integration: Full Pipeline', () => {
  describe('DSL → Compile → Catalogs', () => {
    it('should compile complex screen and generate catalogs', () => {
      const spec = screen('dashboard', (s) =>
        s
          .routes(['/dashboard', '/dash'])
          .viewports({ desktop: 'desktop', tablet: 'tablet', mobile: 'mobile' })
          .mode('desktop', (m) =>
            m.tree([
              region({
                id: 'header',
                children: [
                  component({ id: 'logo', semantics: { role: 'img', label: 'Company Logo' } }),
                  control({
                    id: 'searchInput',
                    semantics: { role: 'searchbox', placeholder: 'Search...' },
                  }),
                  component({ id: 'userMenu', semantics: { role: 'button', label: 'User menu' } }),
                ],
              }),
              region({
                id: 'sidebar',
                children: [
                  component({ id: 'nav-home', semantics: { role: 'link', label: 'Home' } }),
                  component({ id: 'nav-settings', semantics: { role: 'link', label: 'Settings' } }),
                ],
              }),
              region({
                id: 'main',
                children: [component({ id: 'dashboardContent' })],
              }),
              region({ id: 'footer' }),
            ])
          )
          .mode('tablet', (m) =>
            m.tree([
              region({ id: 'header' }),
              region({ id: 'main', children: [component({ id: 'dashboardContent' })] }),
              region({ id: 'footer' }),
            ])
          )
          .mode('mobile', (m) =>
            m.tree([
              region({ id: 'header' }),
              region({ id: 'main', children: [component({ id: 'dashboardContent' })] }),
            ])
          )
          .overlay('settingsModal', {
            id: 'settingsModal',
            route: '/dashboard/settings',
            anchor: 'main',
          })
          .overlay('userMenu', { id: 'userMenuDropdown', anchor: 'userMenu' })
          .flow('openSettings', [
            { action: 'click', target: 'nav-settings' },
            { action: 'expect', route: '/dashboard/settings' },
          ])
          .invariant({
            id: 'headerVisible',
            description: 'Header should always be visible',
            target: 'header',
            conditions: [{ type: 'visible' }],
          })
      );

      const compiled = compile(spec);
      expect(compiled.id).toBe('dashboard');
      expect(compiled.routes).toContain('/dashboard');
      expect(compiled.routes).toContain('/dash');
      expect(compiled.viewports).toEqual({
        desktop: 'desktop',
        tablet: 'tablet',
        mobile: 'mobile',
      });
      expect(Object.keys(compiled.modes)).toHaveLength(3);

      const catalogs = generateCatalogs([compiled]);
      expect(catalogs.uiIds).toContain('dashboard/header');
      expect(catalogs.uiIds).toContain('dashboard/sidebar');
      expect(catalogs.uiIds).toContain('dashboard/main');
      expect(catalogs.uiIds).toContain('dashboard/logo');
      expect(catalogs.uiIds).toContain('dashboard/searchInput');
      expect(catalogs.routes).toContain('/dashboard');
      expect(catalogs.routes).toContain('/dash');
    });

    it('should preserve semantic information in compiled output', () => {
      const spec = screen('test', (s) =>
        s
          .routes(['/test'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) =>
            m.tree([
              component({
                id: 'submitButton',
                semantics: { role: 'button', label: 'Submit Form', description: 'Click to submit' },
              }),
              control({
                id: 'emailInput',
                semantics: { role: 'textbox', label: 'Email', placeholder: 'Enter email' },
              }),
            ])
          )
      );

      const compiled = compile(spec);
      const submitButton = compiled.modes['desktop'].tree[0];
      expect(submitButton.semantics?.role).toBe('button');
      expect(submitButton.semantics?.label).toBe('Submit Form');

      const emailInput = compiled.modes['desktop'].tree[1];
      expect(emailInput.semantics?.role).toBe('textbox');
      expect(emailInput.semantics?.placeholder).toBe('Enter email');
    });

    it('should handle nested children correctly', () => {
      const spec = screen('nested', (s) =>
        s
          .routes(['/nested'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) =>
            m.tree([
              region({
                id: 'level1',
                children: [
                  region({
                    id: 'level2',
                    children: [
                      region({
                        id: 'level3',
                        children: [component({ id: 'deep' })],
                      }),
                    ],
                  }),
                ],
              }),
            ])
          )
      );

      const compiled = compile(spec);
      const level1 = compiled.modes['desktop'].tree[0];
      const level2 = level1.children?.[0];
      const level3 = level2?.children?.[0];
      const deep = level3?.children?.[0];

      expect(level1.id).toBe('level1');
      expect(level2?.id).toBe('level2');
      expect(level3?.id).toBe('level3');
      expect(deep?.id).toBe('deep');
    });
  });

  describe('Config Validation', () => {
    it('should validate a complete config', () => {
      const config = {
        appUrl: 'http://localhost:3000',
        screens: [
          {
            id: 'home',
            routes: ['/'],
            viewports: { desktop: 'desktop' },
            modes: { desktop: { tree: [{ id: 'header', kind: 'region' }] } },
          },
        ],
        fixtures: [
          { id: 'normal', data: { user: { name: 'Test' } } },
          { id: 'empty', data: {} },
        ],
        browser: {
          headless: true,
          viewport: { width: 1920, height: 1080 },
        },
        stability: {
          hydratedMarker: '[data-hydrated]',
          fontsReady: true,
          networkSettled: true,
        },
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(true);
    });

    it('should reject config with invalid URL', () => {
      const config = {
        appUrl: 'not-a-url',
        screens: [
          {
            id: 'home',
            routes: ['/'],
            viewports: { desktop: 'desktop' },
            modes: { desktop: { tree: [] } },
          },
        ],
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
    });

    it('should reject config without screens', () => {
      const config = {
        appUrl: 'http://localhost:3000',
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
    });

    it('should reject empty screens array', () => {
      const config = {
        appUrl: 'http://localhost:3000',
        screens: [],
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
    });
  });
});
