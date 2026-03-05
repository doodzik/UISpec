import { ConfigSchema } from '../schemas/config.schema.js';

export interface CLIArgs {
  command: string;
  input?: string;
  config?: string;
  output?: string;
  watch?: boolean;
}

export function parseArgs(argv: string[]): CLIArgs {
  const args = argv.slice(2);

  if (args.length === 0) {
    return { command: 'help' };
  }

  const command = args[0];

  switch (command) {
    case 'compile': {
      return {
        command: 'compile',
        input: args[1],
        output: args.find((a) => a === '-o' || a === '--output')
          ? args[args.indexOf('-o') + 1]
          : undefined,
      };
    }

    case 'verify': {
      const configFlagIndex = args.findIndex((a) => a === '-c' || a === '--config');
      const configValue = configFlagIndex >= 0 ? args[configFlagIndex + 1] : undefined;
      const positionalArg =
        !configValue && args[1] && !args[1].startsWith('-') ? args[1] : undefined;
      return {
        command: 'verify',
        config: configValue || positionalArg,
        watch: args.includes('-w') || args.includes('--watch'),
      };
    }

    case 'init':
      return { command: 'init' };

    case '--help':
    case '-h':
    case 'help':
      return { command: 'help' };

    default:
      return { command: 'help' };
  }
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export function validateConfig(config: unknown): ValidationResult {
  const result = ConfigSchema.safeParse(config);

  if (result.success) {
    return { valid: true };
  }

  const errors = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
  return { valid: false, errors };
}

export async function loadConfig(path: string): Promise<unknown | null> {
  try {
    const dynamicImport = new Function('path', `return import(path)`);
    const module = await dynamicImport(path);
    return module.default || module;
  } catch {
    return null;
  }
}

export async function run(argv: string[]): Promise<void> {
  const args = parseArgs(argv);

  const log = (...params: unknown[]) => console.log(...params);
  const error = (...params: unknown[]) => console.error(...params);

  switch (args.command) {
    case 'compile': {
      if (!args.input) {
        error('Error: Input file required');
        log('Usage: uispec compile <input> [-o, --output <path>]');
        return;
      }
      log(`Compiling ${args.input}...`);
      break;
    }

    case 'verify':
      log(`Verifying with config ${args.config || './uispec.config.ts'}...`);
      break;

    case 'init':
      log('Initializing UISpec in current directory...');
      break;

    case 'help':
    default:
      log('UISpec - UI Specification Validation Tool');
      log('');
      log('Usage: uispec <command>');
      log('');
      log('Commands:');
      log('  compile <input>    Compile UISpec DSL to canonical JSON');
      log('  verify             Verify UI against specification');
      log('  init               Initialize UISpec in current directory');
      log('');
      log('Options:');
      log('  -h, --help         Show this help message');
      log('  -v, --version      Show version number');
  }
}
