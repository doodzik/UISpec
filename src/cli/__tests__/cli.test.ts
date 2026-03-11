import { describe, it, expect } from 'vitest';
import { parseArgs, validateConfig, loadConfig } from '../index.js';

describe('CLI', () => {
  describe('parseArgs', () => {
    it('should parse compile command', () => {
      const args = parseArgs(['node', 'uispec', 'compile', './spec.ts']);
      expect(args.command).toBe('compile');
      expect(args.input).toBe('./spec.ts');
    });

    it('should parse verify command', () => {
      const args = parseArgs(['node', 'uispec', 'verify', './uispec.config.ts']);
      expect(args.command).toBe('verify');
      expect(args.config).toBe('./uispec.config.ts');
    });

    it('should parse init command', () => {
      const args = parseArgs(['node', 'uispec', 'init']);
      expect(args.command).toBe('init');
    });

    it('should default to help for unknown commands', () => {
      const args = parseArgs(['node', 'uispec', 'unknown']);
      expect(args.command).toBe('help');
    });
  });

  describe('validateConfig', () => {
    it('should validate valid config', () => {
      const config = {
        appUrl: 'http://localhost:3000',
        screens: [
          {
            id: 'home',
            routes: ['/'],
            viewports: { desktop: 'desktop' },
            modes: { desktop: { tree: [] } },
          },
        ],
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
    });

    it('should reject config without appUrl', () => {
      const config = {
        screens: [],
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should reject config without screens', () => {
      const config = {
        appUrl: 'http://localhost:3000',
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
    });

    it('should reject config with empty screens array', () => {
      const config = {
        appUrl: 'http://localhost:3000',
        screens: [],
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
    });
  });

  describe('loadConfig', () => {
    it('should return null for non-existent file', async () => {
      const config = await loadConfig('./non-existent.ts');
      expect(config).toBeNull();
    });

    it('should load a TypeScript config file', async () => {
      const fixturePath = new URL('./fixtures/sample.config.ts', import.meta.url).href;
      const config = await loadConfig(fixturePath);
      expect(config).not.toBeNull();
      expect(config).toHaveProperty('appUrl', 'http://localhost:3000');
      expect(config).toHaveProperty('screens');
    });
  });
});
