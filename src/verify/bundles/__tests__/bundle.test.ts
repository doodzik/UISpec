import { describe, it, expect } from 'vitest';
import { createFailureBundle, FailureBundleSchema } from '../bundle.js';

describe('FailureBundle', () => {
  describe('createFailureBundle', () => {
    it('should create failure bundle with required fields', () => {
      const bundle = createFailureBundle({
        ruleId: 'exists:visible',
        elementId: 'test/header',
        error: 'Element not found',
      });

      expect(bundle.ruleId).toBe('exists:visible');
      expect(bundle.elementId).toBe('test/header');
      expect(bundle.error).toBe('Element not found');
      expect(bundle.timestamp).toBeDefined();
    });

    it('should include bounding box when provided', () => {
      const bundle = createFailureBundle({
        ruleId: 'containedWithin',
        elementId: 'test/child',
        error: 'Element extends beyond parent',
        boundingBox: { x: 10, y: 10, width: 100, height: 50 },
      });

      expect(bundle.boundingBox).toEqual({ x: 10, y: 10, width: 100, height: 50 });
    });

    it('should include computed styles when provided', () => {
      const bundle = createFailureBundle({
        ruleId: 'visible',
        elementId: 'test/header',
        error: 'Element is hidden',
        computedStyles: { display: 'none', visibility: 'hidden' },
      });

      expect(bundle.computedStyles).toEqual({ display: 'none', visibility: 'hidden' });
    });

    it('should include DOM snippet when provided', () => {
      const bundle = createFailureBundle({
        ruleId: 'exists',
        elementId: 'test/header',
        error: 'Element not found',
        domSnippet: '<div data-ui="test/header"></div>',
      });

      expect(bundle.domSnippet).toBe('<div data-ui="test/header"></div>');
    });

    it('should include involved UI IDs', () => {
      const bundle = createFailureBundle({
        ruleId: 'leftOf',
        elementId: 'test/sidebar',
        error: 'Sidebar should be left of main content',
        involvedUiIds: ['test/sidebar', 'test/main'],
      });

      expect(bundle.involvedUiIds).toEqual(['test/sidebar', 'test/main']);
    });
  });

  describe('FailureBundleSchema', () => {
    it('should validate valid failure bundle', () => {
      const validBundle = {
        ruleId: 'exists:visible',
        elementId: 'test/header',
        error: 'Element not found',
        timestamp: new Date().toISOString(),
      };

      const result = FailureBundleSchema.safeParse(validBundle);
      expect(result.success).toBe(true);
    });

    it('should reject bundle without ruleId', () => {
      const invalidBundle = {
        elementId: 'test/header',
        error: 'Element not found',
        timestamp: new Date().toISOString(),
      };

      const result = FailureBundleSchema.safeParse(invalidBundle);
      expect(result.success).toBe(false);
    });

    it('should reject bundle without elementId', () => {
      const invalidBundle = {
        ruleId: 'exists:visible',
        error: 'Element not found',
        timestamp: new Date().toISOString(),
      };

      const result = FailureBundleSchema.safeParse(invalidBundle);
      expect(result.success).toBe(false);
    });

    it('should reject bundle without error', () => {
      const invalidBundle = {
        ruleId: 'exists:visible',
        elementId: 'test/header',
        timestamp: new Date().toISOString(),
      };

      const result = FailureBundleSchema.safeParse(invalidBundle);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const bundleWithOptional = {
        ruleId: 'exists:visible',
        elementId: 'test/header',
        error: 'Element not found',
        timestamp: new Date().toISOString(),
        boundingBox: { x: 0, y: 0, width: 100, height: 50 },
        computedStyles: { display: 'block' },
        domSnippet: '<div></div>',
        involvedUiIds: ['test/header'],
        screenshotPath: '/screenshots/failure.png',
      };

      const result = FailureBundleSchema.safeParse(bundleWithOptional);
      expect(result.success).toBe(true);
    });
  });
});
