# UISpec Development Skill

## Overview

This skill provides specialized instructions for developing and maintaining the UISpec library - a TypeScript library for defining UI intent as structured specifications verified against frontend applications using Playwright.

## Project Structure

```
UISpec/
├── src/
│   ├── schemas/        # Zod schemas (Node, Screen, Fixture, Config)
│   ├── dsl/           # Chainable builder API
│   ├── compiler/       # DSL → JSON + ID catalogs
│   ├── verify/
│   │   ├── harness/   # Runner + stability gates
│   │   ├── engine/    # Semantic + geometry validation
│   │   └── bundles/   # Failure diagnostics
│   └── cli/            # CLI commands
├── integration/        # Playwright integration tests
├── examples/          # Sample specifications
└── dist/             # Build output
```

## Critical Rules

### 1. TEST-FIRST DEVELOPMENT (MANDATORY)

- **ALWAYS write tests before implementing code**
- Tests live alongside code: `src/module/__tests__/module.test.ts`
- Use Vitest for all tests
- Run `pnpm test` after every change

### 2. CODE QUALITY PIPELINE

Every code change must pass:

```bash
pnpm check  # typecheck + lint + prettier + test
```

### 3. ZOD SCHEMA-FIRST

- Define Zod schemas for all data structures
- Schemas enable runtime validation
- Example: `const ScreenSchema = z.object({ id: z.string(), ... })`

### 4. NAMING CONVENTIONS

- Tests: `*.test.ts` (not `*.spec.ts`)
- Schemas: `*.schema.ts`
- Types: PascalCase (`ScreenSpec`, `NodeKind`)
- Zod schemas: `*Schema` suffix

## Development Commands

```bash
# Type checking
pnpm typecheck      # Run TypeScript compiler

# Linting & Formatting
pnpm lint          # ESLint check
pnpm lint:fix      # ESLint fix
pnpm prettier      # Check formatting
pnpm prettier:fix  # Fix formatting

# Testing
pnpm test          # Run all tests
pnpm test:watch   # Watch mode
pnpm test:coverage # Coverage report

# Full check (before commit)
pnpm check         # typecheck + lint + prettier + test

# Build
pnpm build        # Build for npm
```

## Test-First Workflow

```
1. Write failing test in appropriate __tests__/ directory
2. Run test: pnpm test
3. Verify test fails with expected error
4. Write minimal code to make test pass
5. Run test again, verify pass
6. Run: pnpm check
7. Commit
```

## Key APIs

### DSL Builder

```typescript
import { screen, region, component } from 'uispec';

const spec = screen('dashboard', (s) =>
  s
    .routes(['/dashboard'])
    .viewports({ desktop: 'desktop' })
    .mode('desktop', (m) => m.tree([region({ id: 'header' })]))
);
```

### Compiler

```typescript
import { compile, generateCatalogs } from 'uispec';

const compiled = compile(spec);
const catalogs = generateCatalogs([compiled]);
// catalogs.uiIds = ['dashboard/header', ...]
```

### Validation

```typescript
import { createRunner, createPageLocator, SemanticValidator } from 'uispec';

const runner = await createRunner({ appUrl: 'http://localhost:3000' });
const locator = createPageLocator(runner.page);
const validator = new SemanticValidator(locator);
const result = await validator.validateElement('dashboard/header', { type: 'visible' });
```

## Important Notes

- The project uses strict TypeScript mode
- ESLint is configured to allow `_` prefix for unused variables in type definitions
- Playwright is used for browser automation in integration tests
- Coverage thresholds are set to 100%
- CI runs on GitHub Actions (see `.github/workflows/ci.yml`)

## Package.json Scripts

All available npm scripts:

- `typecheck` - TypeScript strict mode
- `lint` - ESLint with TypeScript rules
- `prettier` - Prettier formatting check
- `test` - Vitest run
- `test:watch` - Watch mode
- `test:coverage` - Coverage report
- `check` - Full pipeline (typecheck + lint + prettier + test)
- `build` - Build with tsup

## Dependencies

Runtime:

- `zod` - Schema validation
- `playwright` - Browser automation
- `commander` - CLI
- `chalk` - Terminal colors

Dev:

- `vitest` - Test framework
- `tsup` - TypeScript bundler
- `typescript` - Type checking
- `eslint` / `prettier` - Code quality

## Common Tasks

### Adding a new schema

1. Create `src/schemas/newthing.schema.ts` with Zod schema
2. Add tests in `src/schemas/__tests__/newthing.schema.test.ts`
3. Export from `src/index.ts`

### Adding a new validation rule

1. Add rule type to appropriate engine (semantic.ts or geometry.ts)
2. Add tests with mock page
3. Add integration test with Playwright

### Running integration tests

```bash
pnpm test integration/
```

### Building for release

```bash
pnpm build
```
