export type { Node, NodeKind, Semantics } from './schemas/node.schema.js';
export { NodeKindSchema, NodeSchema } from './schemas/node.schema.js';

export type { Screen, Mode, Overlay, Flow, FlowStep, Invariant } from './schemas/screen.schema.js';
export {
  ScreenSchema,
  ModeSchema,
  OverlaySchema,
  FlowSchema,
  FlowStepSchema,
  InvariantSchema,
} from './schemas/screen.schema.js';

export type { Fixture } from './schemas/fixture.schema.js';
export { FixtureSchema } from './schemas/fixture.schema.js';

export type { Config, BrowserOptions, Stability } from './schemas/config.schema.js';
export { ConfigSchema } from './schemas/config.schema.js';

export {
  screen,
  region,
  component,
  control,
  container,
  collection,
  overlayAnchor,
} from './dsl/index.js';

export { compile, generateCatalogs, type CompiledScreen, type Catalogs } from './compiler/index.js';

export {
  createStabilityGate,
  StabilityCondition,
  type StabilityGate,
} from './verify/harness/stability.js';

export {
  createRunner,
  destroyRunner,
  createPageLocator,
  injectUIIds,
  type RunnerOptions,
  type ValidationContext,
} from './verify/harness/runner.js';

export {
  SemanticValidator,
  type SemanticRule,
  type SemanticRuleType,
} from './verify/engine/semantic.js';
export { ValidationRules, ValidationResults } from './verify/engine/semantic.js';

export {
  GeometryValidator,
  GeometryRules,
  type GeometryRule,
  type GeometryRuleType,
  type BoundingBox,
} from './verify/engine/geometry.js';

export {
  createFailureBundle,
  type FailureBundle,
  FailureBundleSchema,
} from './verify/bundles/bundle.js';

export {
  parseArgs,
  validateConfig,
  loadConfig,
  run,
  type CLIArgs,
  type ValidationResult,
} from './cli/index.js';

export { generateHtml } from './visualize/index.js';
