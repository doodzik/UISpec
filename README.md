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

## Features

- **DSL Builder**: Chainable API for defining UI specifications
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
