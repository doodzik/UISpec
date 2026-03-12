import { describe, it, expect } from 'vitest';
import { generateHtml } from '../index.js';
import { screen, region, component, control, container, collection } from '../../dsl/index.js';
import { compile } from '../../compiler/index.js';

describe('Visualize', () => {
  describe('generateHtml', () => {
    it('should return valid HTML document', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) => m.tree([region({ id: 'header' })]))
      );

      const html = generateHtml([compile(spec)]);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
    });

    it('should include screen id as heading', () => {
      const spec = screen('dashboard', (s) =>
        s
          .routes(['/dashboard'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) => m.tree([region({ id: 'main' })]))
      );

      const html = generateHtml([compile(spec)]);
      expect(html).toContain('dashboard');
    });

    it('should render node ids', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) =>
            m.tree([region({ id: 'header' }), region({ id: 'sidebar' }), region({ id: 'main' })])
          )
      );

      const html = generateHtml([compile(spec)]);
      expect(html).toContain('header');
      expect(html).toContain('sidebar');
      expect(html).toContain('main');
    });

    it('should render nested children', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) =>
            m.tree([
              region({
                id: 'header',
                children: [component({ id: 'logo' }), control({ id: 'searchInput' })],
              }),
            ])
          )
      );

      const html = generateHtml([compile(spec)]);
      expect(html).toContain('logo');
      expect(html).toContain('searchInput');
    });

    it('should render node kinds', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) =>
            m.tree([
              region({ id: 'header' }),
              component({ id: 'logo' }),
              control({ id: 'input' }),
              container({ id: 'wrapper' }),
              collection({ id: 'list' }),
            ])
          )
      );

      const html = generateHtml([compile(spec)]);
      expect(html).toContain('region');
      expect(html).toContain('component');
      expect(html).toContain('control');
      expect(html).toContain('container');
      expect(html).toContain('collection');
    });

    it('should render semantics when present', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) =>
            m.tree([component({ id: 'logo', semantics: { role: 'img', label: 'Company Logo' } })])
          )
      );

      const html = generateHtml([compile(spec)]);
      expect(html).toContain('img');
      expect(html).toContain('Company Logo');
    });

    it('should render multiple modes', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop', mobile: 'mobile' })
          .mode('desktop', (m) => m.tree([region({ id: 'sidebar' }), region({ id: 'main' })]))
          .mode('mobile', (m) => m.tree([region({ id: 'main' })]))
      );

      const html = generateHtml([compile(spec)]);
      expect(html).toContain('desktop');
      expect(html).toContain('mobile');
    });

    it('should render overlays', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) => m.tree([region({ id: 'main' })]))
          .overlay('settingsModal', { id: 'settingsModal', anchor: 'main', route: '/settings' })
      );

      const html = generateHtml([compile(spec)]);
      expect(html).toContain('settingsModal');
      expect(html).toContain('anchor: main');
    });

    it('should render multiple screens', () => {
      const spec1 = screen('dashboard', (s) =>
        s
          .routes(['/dashboard'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) => m.tree([region({ id: 'main' })]))
      );
      const spec2 = screen('settings', (s) =>
        s
          .routes(['/settings'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) => m.tree([region({ id: 'form' })]))
      );

      const html = generateHtml([compile(spec1), compile(spec2)]);
      expect(html).toContain('dashboard');
      expect(html).toContain('settings');
    });

    it('should render routes', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/home', '/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) => m.tree([region({ id: 'main' })]))
      );

      const html = generateHtml([compile(spec)]);
      expect(html).toContain('/home');
      expect(html).toContain('/');
    });

    it('should render flows', () => {
      const spec = screen('home', (s) =>
        s
          .routes(['/'])
          .viewports({ desktop: 'desktop' })
          .mode('desktop', (m) => m.tree([region({ id: 'main' })]))
          .flow('login', [
            { action: 'click', target: 'loginBtn' },
            { action: 'fill', target: 'emailInput', value: 'test@test.com' },
          ])
      );

      const html = generateHtml([compile(spec)]);
      expect(html).toContain('login');
      expect(html).toContain('click');
      expect(html).toContain('loginBtn');
    });
  });
});
