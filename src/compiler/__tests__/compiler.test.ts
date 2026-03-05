import { describe, it, expect } from 'vitest';
import { compile, generateCatalogs } from '../index.js';
import { screen, region, component } from '../../dsl/index.js';

describe('Compiler', () => {
  describe('compile', () => {
    it('should compile screen to canonical JSON', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) => m.tree([region({ id: 'header' })]))
      );

      const result = compile(spec);
      expect(result).toBeDefined();
      expect(result.id).toBe('home');
      expect(result.routes).toEqual(['/']);
    });

    it('should generate unique node IDs', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) =>
            m.tree([
              region({ id: 'header' }),
              region({ id: 'content', children: [component({ id: 'button' })] }),
            ])
          )
      );

      const result = compile(spec);
      const nodes = flattenNodes(result.modes.desktop.tree);
      expect(nodes.length).toBe(3);
    });

    it('should preserve tree structure', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) =>
            m.tree([
              region({
                id: 'main',
                children: [
                  region({ id: 'sidebar', children: [component({ id: 'nav' })] }),
                  region({ id: 'content' }),
                ],
              }),
            ])
          )
      );

      const result = compile(spec);
      const mainNode = result.modes.desktop.tree[0];
      expect(mainNode.children).toHaveLength(2);
      expect(mainNode.children?.[0].children).toHaveLength(1);
    });

    it('should handle multiple modes', () => {
      const spec = screen('config', (s) =>
        s
          .routes(['/config'])
          .viewports({ desktop: 'desktop', tablet: 'tablet' })
          .mode('desktop', (m) => m.tree([region({ id: 'header' })]))
          .mode('tablet', (m) => m.tree([region({ id: 'mobileHeader' })]))
      );

      const result = compile(spec);
      expect(result.modes.desktop).toBeDefined();
      expect(result.modes.tablet).toBeDefined();
    });

    it('should handle overlays', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) => m.tree([region({ id: 'main' })]))
          .overlay('modal', { id: 'settingsModal', anchor: 'main' })
      );

      const result = compile(spec);
      expect(result.overlays).toBeDefined();
      expect(result.overlays?.modal).toEqual({ id: 'settingsModal', anchor: 'main' });
    });

    it('should handle flows', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) => m.tree([region({ id: 'main' })]))
          .flow('navigation', [
            { action: 'click', target: 'navButton' },
            { action: 'expect', route: '/page' },
          ])
      );

      const result = compile(spec);
      expect(result.flows).toBeDefined();
      expect(result.flows?.navigation).toHaveLength(2);
    });
  });

  describe('generateCatalogs', () => {
    it('should generate UI ID catalog', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) =>
            m.tree([
              region({ id: 'header' }),
              region({ id: 'content', children: [component({ id: 'button' })] }),
            ])
          )
      );

      const compiled = compile(spec);
      const catalogs = generateCatalogs([compiled]);

      expect(catalogs.uiIds).toContain('home/header');
      expect(catalogs.uiIds).toContain('home/content');
      expect(catalogs.uiIds).toContain('home/button');
    });

    it('should generate route catalog', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) => m.tree([]))
      );

      const compiled = compile(spec);
      const catalogs = generateCatalogs([compiled]);

      expect(catalogs.routes).toContain('/');
    });

    it('should generate fixture catalog', () => {
      const catalogs = generateCatalogs([]);
      expect(catalogs.fixtures).toBeDefined();
      expect(Array.isArray(catalogs.fixtures)).toBe(true);
    });
  });
});

function flattenNodes(nodes: unknown[]): unknown[] {
  const result: unknown[] = [];
  for (const node of nodes) {
    result.push(node);
    if (typeof node === 'object' && node !== null && 'children' in node) {
      const children = (node as { children?: unknown[] }).children;
      if (children) {
        result.push(...flattenNodes(children));
      }
    }
  }
  return result;
}
