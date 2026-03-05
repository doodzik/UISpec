import { describe, it, expect } from 'vitest';
import {
  SemanticValidator,
  ValidationRules,
  ValidationResults,
  SemanticRule,
} from '../semantic.js';

describe('SemanticValidator', () => {
  const createMockPage = (elements: Record<string, boolean>) => {
    return {
      locator: (selector: string) => ({
        count: async () => (elements[selector] ? 1 : 0),
        first: async () => ({
          isVisible: async () => elements[selector] ?? false,
          getAttribute: async (_attr: string) => null,
        }),
        all: async () =>
          Object.keys(elements)
            .filter((e) => e === selector)
            .map(() => ({
              isVisible: async () => elements[selector] ?? false,
              getAttribute: async (_attr: string) => null,
            })),
      }),
    };
  };

  describe('element existence', () => {
    it('should pass when element exists', async () => {
      const page = createMockPage({ '[data-ui="test/header"]': true });
      const validator = new SemanticValidator(page as never);

      const rule: SemanticRule = { type: 'exists', target: 'test/header' };
      const result = await validator.validateElement('test/header', rule);

      expect(result.passed).toBe(true);
    });

    it('should fail when element does not exist', async () => {
      const page = createMockPage({});
      const validator = new SemanticValidator(page as never);

      const rule: SemanticRule = { type: 'exists', target: 'test/header' };
      const result = await validator.validateElement('test/header', rule);

      expect(result.passed).toBe(false);
    });
  });

  describe('visibility', () => {
    it('should pass when element is visible', async () => {
      const page = createMockPage({ '[data-ui="test/header"]': true });
      const validator = new SemanticValidator(page as never);

      const rule: SemanticRule = { type: 'visible', target: 'test/header' };
      const result = await validator.validateElement('test/header', rule);

      expect(result.passed).toBe(true);
    });

    it('should fail when element is hidden', async () => {
      const page = createMockPage({ '[data-ui="test/header"]': false });
      const validator = new SemanticValidator(page as never);

      const rule: SemanticRule = { type: 'visible', target: 'test/header' };
      const result = await validator.validateElement('test/header', rule);

      expect(result.passed).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('should check for accessible name', async () => {
      const page = {
        locator: (_selector: string) => ({
          first: async () => ({
            getAttribute: async (attr: string) => {
              if (attr === 'aria-label') return 'Submit button';
              return null;
            },
          }),
        }),
      };
      const validator = new SemanticValidator(page as never);

      const rule: SemanticRule = {
        type: 'accessibleName',
        target: 'test/button',
        value: 'Submit button',
      };
      const result = await validator.validateElement('test/button', rule);

      expect(result.passed).toBe(true);
    });

    it('should check for role', async () => {
      const page = {
        locator: (_selector: string) => ({
          first: async () => ({
            getAttribute: async (attr: string) => {
              if (attr === 'role') return 'button';
              return null;
            },
          }),
        }),
      };
      const validator = new SemanticValidator(page as never);

      const rule: SemanticRule = { type: 'role', target: 'test/button', value: 'button' };
      const result = await validator.validateElement('test/button', rule);

      expect(result.passed).toBe(true);
    });
  });
});

describe('ValidationResult', () => {
  it('should create success result', () => {
    const result = ValidationResults.success('test-rule', 'test/element');
    expect(result.passed).toBe(true);
    expect(result.ruleId).toBe('test-rule');
    expect(result.elementId).toBe('test/element');
  });

  it('should create failure result', () => {
    const result = ValidationResults.failure('test-rule', 'test/element', 'Element not found');
    expect(result.passed).toBe(false);
    expect(result.ruleId).toBe('test-rule');
    expect(result.elementId).toBe('test/element');
    expect(result.error).toBe('Element not found');
  });
});

describe('ValidationRule', () => {
  it('should create visible rule', () => {
    const rule = ValidationRules.visible('test/element');
    expect(rule.type).toBe('visible');
    expect(rule.target).toBe('test/element');
  });

  it('should create exists rule', () => {
    const rule = ValidationRules.exists('test/element');
    expect(rule.type).toBe('exists');
    expect(rule.target).toBe('test/element');
  });

  it('should create accessibleName rule', () => {
    const rule = ValidationRules.accessibleName('test/element', 'Submit');
    expect(rule.type).toBe('accessibleName');
    expect(rule.target).toBe('test/element');
    expect(rule.value).toBe('Submit');
  });

  it('should create role rule', () => {
    const rule = ValidationRules.role('test/element', 'button');
    expect(rule.type).toBe('role');
    expect(rule.target).toBe('test/element');
    expect(rule.value).toBe('button');
  });
});
