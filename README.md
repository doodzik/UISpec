# UISpec

UISpec is a TypeScript library for defining UI intent as structured specifications that can be verified automatically against a running frontend application using Playwright.

## Installation

```bash
npm install uispec
# or
pnpm add uispec
```

## Quick Start

```typescript
import { screen, region, component } from 'uispec';

// Define your UI specification
const spec = screen('dashboard', (s) =>
  s
    .routes(['/dashboard'])
    .viewports({ desktop: 'desktop', tablet: 'tablet' })
    .mode('desktop', (m) =>
      m.tree([
        region({
          id: 'header',
          children: [
            component({ id: 'logo', semantics: { role: 'img', label: 'Logo' } }),
            component({ id: 'search', semantics: { role: 'searchbox' } }),
          ],
        }),
        region({
          id: 'sidebar',
          children: [
            component({ id: 'nav', semantics: { role: 'navigation' } }),
          ],
        }),
        region({ id: 'main', children: [component({ id: 'content')] }),
      ]),
    )
);

// Compile and validate
import { compile, generateCatalogs } from 'uispec';

const compiled = compile(spec);
const catalogs = generateCatalogs([compiled]);

console.log(catalogs.uiIds);
// ['dashboard/header', 'dashboard/logo', 'dashboard/search', ...]
```

## Wireframe Visualization

UISpec can generate an HTML wireframe from your specs so you can see what your UI structure looks like before writing any frontend code. The renderer understands common layout patterns — regions named `header` and `footer` span full width, while `sidebar` and `main` regions are placed side by side. See [`docs/wireframe-example.html`](docs/wireframe-example.html) for a live example you can open in your browser.

Each node kind has a distinct color:
- **Blue** — `region` (layout containers like header, sidebar, main, footer)
- **Green** — `component` (UI components like logo, buttons, nav links)
- **Orange** — `control` (input controls like searchbox, text fields)
- **Purple** — `container` (wrapper elements like stat cards)
- **Pink** — `collection` (lists and grids)
- **Teal** — `overlayAnchor` (modal/drawer anchor points)

Semantic annotations (roles, labels, placeholders) appear as italic text next to each node. Multiple modes (desktop, tablet, mobile) are shown side by side so you can see how the layout adapts. Overlays and flows are listed below the tree.

### Generate a wireframe

```typescript
import { compile, generateHtml } from '@doodzik/uispec';
import { writeFileSync } from 'fs';

const html = generateHtml([compile(mySpec)]);
writeFileSync('wireframe.html', html);
// Open wireframe.html in your browser
```

Or via CLI:

```bash
uispec visualize ./specs/dashboard.ts -o wireframe.html
```

To regenerate the docs wireframe screenshot (requires Playwright browsers):

```bash
pnpm generate:wireframe
```

## Features

- **DSL Builder**: Chainable API for defining UI specifications
- **Wireframe Visualizer**: Generate HTML wireframes from specs to preview your UI structure
- **Zod Validation**: Runtime validation of specifications
- **ID Catalog Generation**: Auto-generated UI ID catalogs for refactor safety
- **Semantic Validation**: Element existence, visibility, accessibility
- **Geometry Validation**: Layout constraints (containedWithin, leftOf, above, noOverlap)
- **Failure Bundles**: Detailed diagnostics for debugging failures

## CLI Commands

```bash
# Compile a spec file
uispec compile ./spec.ts

# Verify UI against specification
uispec verify ./uispec.config.ts

# Generate HTML wireframe from specs
uispec visualize ./spec.ts -o wireframe.html

# Initialize UISpec in current directory
uispec init
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm prettier

# Full check (before commit)
pnpm check

# Build
pnpm build
```

## Architecture

UISpec is composed of six subsystems:

1. **Schemas** - Zod schemas for all types
2. **DSL** - Chainable builder for UI specs
3. **Compiler** - AST → Canonical JSON + ID catalogs
4. **Verify Harness** - Deterministic Playwright environment
5. **Validation Engine** - Semantic + Geometry checks
6. **Failure Bundles** - Diagnostic output

## Core Concepts

### Screens

A screen represents a routable UI surface:

```typescript
screen('config', (s) =>
  s.routes(['/config'])
   .viewports({ desktop: 'desktopSidebar' })
   .mode('desktopSidebar', (m) => m.tree([...]))
)
```

### Nodes

Nodes represent UI elements with kinds:

- `region` - Layout container
- `component` - UI component
- `control` - Input control
- `container` - Wrapper element
- `collection` - List/grid
- `overlayAnchor` - Modal/drawer anchor

### Modes

Responsive layouts use named modes:

```typescript
.viewports({ desktop: 'desktopSidebar', tablet: 'tabletStacked' })
.mode('desktopSidebar', (m) => m.tree([...]))
.mode('tabletStacked', (m) => m.tree([...]))
```

## License

AGPL-3.0
