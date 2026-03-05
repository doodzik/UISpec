# UISpec - AI Assistant Context

## Project Overview

UISpec is a TypeScript library for defining UI intent as structured specifications that can be verified automatically against a running frontend application using Playwright.

## Critical Rules

### 1. TEST-FIRST DEVELOPMENT (MANDATORY)

- **ALWAYS write tests before implementing code**
- Run tests first to see failure, then write code to pass
- Tests live alongside code: `src/module/__tests__/module.test.ts`
- Never write implementation code without a corresponding failing test
- Use Vitest for unit/integration tests
- Zod schemas should also have test coverage

### 2. Zod Schema-First Approach

- Define Zod schemas for all data structures (DSL input, compiler output, config)
- Use Zod for runtime validation in addition to TypeScript types
- Schemas enable: config file validation, API input validation, compiler output verification
- Example: `const ScreenSchema = z.object({ id: z.string(), ... })`

### 3. File Structure

```
src/
├── types/           # Core type definitions
│   └── __tests__/  # Type tests
├── schemas/        # Zod schemas (validated by tests)
│   └── __tests__/  # Schema validation tests
├── dsl/            # UISpec DSL builder
│   └── __tests__/  # DSL tests
├── compiler/       # DSL → JSON + catalogs
│   └── __tests__/  # Compiler tests
├── verify/         # Playwright validation
│   ├── harness/    # Test environment
│   ├── engine/     # Validation logic
│   └── bundles/    # Failure diagnostics
│   └── __tests__/  # All verify tests
└── cli/            # CLI commands
    └── __tests__/  # CLI tests
```

### 4. Code Quality Pipeline

**Every code change must pass:**

1. `pnpm typecheck` - TypeScript strict mode
2. `pnpm lint` - ESLint with TypeScript rules
3. `pnpm prettier` - Prettier formatting check
4. `pnpm test` - All tests passing

**Before commit (pre-commit hook):**

- Runs lint-staged on staged files
- Runs typecheck
- Runs tests

**CI Pipeline (every PR):**

- typecheck
- lint
- prettier check
- test with coverage
- Build verification

### 5. Naming Conventions

- Tests: `*.test.ts` (not `*.spec.ts`)
- Schemas: `*.schema.ts` (e.g., `screen.schema.ts`)
- Modules: `index.ts` for main exports
- Types: PascalCase (`ScreenSpec`, `NodeKind`)
- Zod schemas: `*Schema` suffix (`ScreenSchema`, `NodeSchema`)

### 6. Code Style

- No comments unless explaining WHY (not WHAT)
- Prefer explicit over implicit
- Keep functions small and focused
- Use TypeScript strict mode always
- Zod for runtime validation, TypeScript for compile-time

## Architecture

### Subsystems (in order of implementation)

1. **Schemas** - Zod schemas for all types
2. **DSL** - Chainable builder for UI specs
3. **Compiler** - AST → Canonical JSON + ID catalogs
4. **Verify Harness** - Deterministic Playwright environment
5. **Validation Engine** - Semantic + Geometry checks
6. **Failure Bundles** - Diagnostic output
7. **CLI** - User-facing commands

### Key Zod Schemas

- `ScreenSchema` - Screen definition
- `NodeSchema` - UI element (region, component, control, etc.)
- `ModeSchema` - Responsive layout variant
- `StateSchema` - UI state (modal, drawer, loading)
- `FlowSchema` - Navigation sequence
- `FixtureSchema` - Data scenario
- `ConfigSchema` - UISpec configuration

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
```

## Test-First Workflow

```
1. Write Zod schema + failing test (schema must fail invalid input, pass valid)
2. Write implementation test (expect failure)
3. Run test → see failure
4. Write minimal code to pass
5. Run test → see pass
6. Refactor if needed
7. Run: pnpm check
8. Commit
```

## Design Principles

- Keep UISpec boring and predictable
- DSL describes UI intent, not implementation details
- Validation must be deterministic
- Failure bundles provide sufficient debugging data
- Refactor safety is a core goal
