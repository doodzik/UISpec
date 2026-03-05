import { screen, region, component, control, container } from '../src/dsl/index.js';

export const dashboardSpec = screen('dashboard', (s) =>
  s
    .routes(['/dashboard', '/dash'])
    .viewports({
      desktop: 'desktop',
      tablet: 'tablet',
      mobile: 'mobile',
    })

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
            component({
              id: 'notifications',
              semantics: { role: 'button', label: 'Notifications' },
            }),
            component({ id: 'userMenu', semantics: { role: 'button', label: 'User Menu' } }),
          ],
        }),

        region({
          id: 'sidebar',
          children: [
            component({ id: 'navHome', semantics: { role: 'link', label: 'Home' } }),
            component({ id: 'navProjects', semantics: { role: 'link', label: 'Projects' } }),
            component({ id: 'navTasks', semantics: { role: 'link', label: 'Tasks' } }),
            component({ id: 'navSettings', semantics: { role: 'link', label: 'Settings' } }),
          ],
        }),

        region({
          id: 'main',
          children: [
            region({
              id: 'stats',
              children: [
                container({ id: 'statCard1', semantics: { role: 'article' } }),
                container({ id: 'statCard2', semantics: { role: 'article' } }),
                container({ id: 'statCard3', semantics: { role: 'article' } }),
              ],
            }),
            region({
              id: 'recentActivity',
              semantics: { role: 'feed' },
            }),
          ],
        }),

        region({ id: 'footer' }),
      ])
    )

    .mode('tablet', (m) =>
      m.tree([
        region({ id: 'header' }),
        region({ id: 'main', children: [region({ id: 'content' })] }),
        region({ id: 'footer' }),
      ])
    )

    .mode('mobile', (m) => m.tree([region({ id: 'header' }), region({ id: 'main' })]))

    .overlay('settingsModal', {
      id: 'settingsModal',
      route: '/dashboard/settings',
      anchor: 'main',
    })

    .overlay('userMenuDropdown', {
      id: 'userMenuDropdown',
      anchor: 'userMenu',
    })

    .flow('openSettings', [
      { action: 'click', target: 'navSettings' },
      { action: 'expect', route: '/dashboard/settings' },
    ])

    .flow('search', [
      { action: 'click', target: 'searchInput' },
      { action: 'fill', target: 'searchInput', value: 'test query' },
    ])

    .invariant({
      id: 'headerVisible',
      description: 'Header must always be visible',
      target: 'header',
      conditions: [{ type: 'visible' }],
    })

    .invariant({
      id: 'sidebarLeftOfMain',
      description: 'Sidebar should be left of main content on desktop',
      target: 'sidebar',
      conditions: [{ type: 'leftOf', other: 'main' }],
    })
);

export const configSpec = screen('config', (s) =>
  s
    .routes(['/config', '/settings'])
    .viewports({ desktop: 'desktop' })

    .mode('desktop', (m) =>
      m.tree([
        region({
          id: 'sidebar',
          children: [
            component({ id: 'profileTab', semantics: { role: 'tab', label: 'Profile' } }),
            component({ id: 'securityTab', semantics: { role: 'tab', label: 'Security' } }),
            component({
              id: 'notificationsTab',
              semantics: { role: 'tab', label: 'Notifications' },
            }),
          ],
        }),
        region({
          id: 'content',
          children: [component({ id: 'configForm' })],
        }),
      ])
    )
);
