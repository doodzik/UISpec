import { describe, it, expect } from 'vitest';
import { screen, region, component, control, container } from '../index.js';

describe('DSL', () => {
  describe('screen', () => {
    it('should create screen with id and routes', () => {
      const spec = screen('config', (s) => s.routes(['/config']));
      expect(spec.id).toBe('config');
      expect(spec.routes).toEqual(['/config']);
    });

    it('should create screen with viewports', () => {
      const spec = screen('config', (s) =>
        s.routes(['/config']).viewports({ desktop: 'desktopSidebar', tablet: 'tabletStacked' })
      );
      expect(spec.viewports).toEqual({ desktop: 'desktopSidebar', tablet: 'tabletStacked' });
    });

    it('should create screen with modes', () => {
      const spec = screen('config', (s) =>
        s
          .routes(['/config'])
          .viewports({ desktop: 'desktopSidebar' })
          .mode('desktopSidebar', (m) => m.tree([region({ id: 'header' })]))
      );
      expect(spec.modes.desktopSidebar).toBeDefined();
      expect(spec.modes.desktopSidebar.tree).toHaveLength(1);
    });

    it('should create screen with overlays', () => {
      const spec = screen('config', (s) =>
        s
          .routes(['/config'])
          .viewports({ desktop: 'desktop' })
          .overlay('modal', { id: 'settingsModal', anchor: 'main' })
      );
      expect(spec.overlays).toBeDefined();
      expect(spec.overlays?.modal).toEqual({ id: 'settingsModal', anchor: 'main' });
    });

    it('should create screen with flows', () => {
      const spec = screen('config', (s) =>
        s
          .routes(['/config'])
          .viewports({ desktop: 'desktop' })
          .flow('openSettings', [
            { action: 'click', target: 'settingsButton' },
            { action: 'expect', route: '/config/settings' },
          ])
      );
      expect(spec.flows).toBeDefined();
      expect(spec.flows?.openSettings).toHaveLength(2);
    });
  });

  describe('node builders', () => {
    it('should create region node', () => {
      const node = region({ id: 'header' });
      expect(node.id).toBe('header');
      expect(node.kind).toBe('region');
    });

    it('should create component node', () => {
      const node = component({ id: 'button', semantics: { role: 'button', label: 'Click' } });
      expect(node.id).toBe('button');
      expect(node.kind).toBe('component');
      expect(node.semantics).toEqual({ role: 'button', label: 'Click' });
    });

    it('should create control node', () => {
      const node = control({
        id: 'input',
        semantics: { role: 'textbox', placeholder: 'Enter text' },
      });
      expect(node.id).toBe('input');
      expect(node.kind).toBe('control');
    });

    it('should create container node', () => {
      const node = container({ id: 'wrapper', children: [region({ id: 'child' })] });
      expect(node.id).toBe('wrapper');
      expect(node.kind).toBe('container');
      expect(node.children).toHaveLength(1);
    });

    it('should allow chaining children', () => {
      const node = region({
        id: 'parent',
        children: [component({ id: 'child1' }), component({ id: 'child2' })],
      });
      expect(node.children).toHaveLength(2);
    });
  });

  describe('chaining', () => {
    it('should allow fluent chaining', () => {
      const spec = screen('config', (s) =>
        s
          .routes(['/config'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) => m.tree([region({ id: 'header' })]))
          .overlay('modal', { id: 'modal', anchor: 'main' })
      );
      expect(spec.modes.desktop.tree).toHaveLength(1);
      expect(spec.overlays?.modal).toBeDefined();
    });
  });
});
