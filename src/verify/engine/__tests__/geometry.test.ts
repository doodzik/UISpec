import { describe, it, expect } from 'vitest';
import { GeometryValidator, GeometryRule, GeometryRules, BoundingBox } from '../geometry.js';

describe('GeometryValidator', () => {
  const createMockPage = (boxes: Record<string, BoundingBox>) => {
    return {
      locator: (selector: string) => ({
        first: async () => ({
          boundingBox: async () => boxes[selector] || null,
        }),
      }),
    };
  };

  describe('containedWithin', () => {
    it('should pass when element is contained within parent', async () => {
      const page = createMockPage({
        '[data-ui="test/child"]': { x: 10, y: 10, width: 50, height: 50 },
        '[data-ui="test/parent"]': { x: 0, y: 0, width: 100, height: 100 },
      });
      const validator = new GeometryValidator(page as never);

      const rule: GeometryRule = {
        type: 'containedWithin',
        target: 'test/child',
        container: 'test/parent',
      };

      const result = await validator.validate('test/child', rule);
      expect(result.passed).toBe(true);
    });

    it('should fail when element extends beyond parent', async () => {
      const page = createMockPage({
        '[data-ui="test/child"]': { x: -10, y: 10, width: 50, height: 50 },
        '[data-ui="test/parent"]': { x: 0, y: 0, width: 100, height: 100 },
      });
      const validator = new GeometryValidator(page as never);

      const rule: GeometryRule = {
        type: 'containedWithin',
        target: 'test/child',
        container: 'test/parent',
      };

      const result = await validator.validate('test/child', rule);
      expect(result.passed).toBe(false);
    });
  });

  describe('leftOf', () => {
    it('should pass when element is to the left', async () => {
      const page = createMockPage({
        '[data-ui="test/left"]': { x: 0, y: 0, width: 50, height: 100 },
        '[data-ui="test/right"]': { x: 100, y: 0, width: 50, height: 100 },
      });
      const validator = new GeometryValidator(page as never);

      const rule: GeometryRule = {
        type: 'leftOf',
        target: 'test/left',
        other: 'test/right',
      };

      const result = await validator.validate('test/left', rule);
      expect(result.passed).toBe(true);
    });

    it('should fail when element is to the right', async () => {
      const page = createMockPage({
        '[data-ui="test/left"]': { x: 100, y: 0, width: 50, height: 100 },
        '[data-ui="test/right"]': { x: 0, y: 0, width: 50, height: 100 },
      });
      const validator = new GeometryValidator(page as never);

      const rule: GeometryRule = {
        type: 'leftOf',
        target: 'test/left',
        other: 'test/right',
      };

      const result = await validator.validate('test/left', rule);
      expect(result.passed).toBe(false);
    });
  });

  describe('above', () => {
    it('should pass when element is above', async () => {
      const page = createMockPage({
        '[data-ui="test/top"]': { x: 0, y: 0, width: 100, height: 50 },
        '[data-ui="test/bottom"]': { x: 0, y: 100, width: 100, height: 50 },
      });
      const validator = new GeometryValidator(page as never);

      const rule: GeometryRule = {
        type: 'above',
        target: 'test/top',
        other: 'test/bottom',
      };

      const result = await validator.validate('test/top', rule);
      expect(result.passed).toBe(true);
    });

    it('should fail when element is below', async () => {
      const page = createMockPage({
        '[data-ui="test/top"]': { x: 0, y: 100, width: 100, height: 50 },
        '[data-ui="test/bottom"]': { x: 0, y: 0, width: 100, height: 50 },
      });
      const validator = new GeometryValidator(page as never);

      const rule: GeometryRule = {
        type: 'above',
        target: 'test/top',
        other: 'test/bottom',
      };

      const result = await validator.validate('test/top', rule);
      expect(result.passed).toBe(false);
    });
  });

  describe('noOverlap', () => {
    it('should pass when elements do not overlap', async () => {
      const page = createMockPage({
        '[data-ui="test/first"]': { x: 0, y: 0, width: 50, height: 50 },
        '[data-ui="test/second"]': { x: 100, y: 100, width: 50, height: 50 },
      });
      const validator = new GeometryValidator(page as never);

      const rule: GeometryRule = {
        type: 'noOverlap',
        target: 'test/first',
        other: 'test/second',
      };

      const result = await validator.validate('test/first', rule);
      expect(result.passed).toBe(true);
    });

    it('should fail when elements overlap', async () => {
      const page = createMockPage({
        '[data-ui="test/first"]': { x: 0, y: 0, width: 100, height: 100 },
        '[data-ui="test/second"]': { x: 50, y: 50, width: 100, height: 100 },
      });
      const validator = new GeometryValidator(page as never);

      const rule: GeometryRule = {
        type: 'noOverlap',
        target: 'test/first',
        other: 'test/second',
      };

      const result = await validator.validate('test/first', rule);
      expect(result.passed).toBe(false);
    });
  });
});

describe('GeometryRules', () => {
  it('should create containedWithin rule', () => {
    const rule = GeometryRules.containedWithin('test/child', 'test/parent');
    expect(rule.type).toBe('containedWithin');
    expect(rule.target).toBe('test/child');
    expect(rule.container).toBe('test/parent');
  });

  it('should create leftOf rule', () => {
    const rule = GeometryRules.leftOf('test/left', 'test/right');
    expect(rule.type).toBe('leftOf');
    expect(rule.target).toBe('test/left');
    expect(rule.other).toBe('test/right');
  });

  it('should create above rule', () => {
    const rule = GeometryRules.above('test/top', 'test/bottom');
    expect(rule.type).toBe('above');
    expect(rule.target).toBe('test/top');
    expect(rule.other).toBe('test/bottom');
  });

  it('should create noOverlap rule', () => {
    const rule = GeometryRules.noOverlap('test/first', 'test/second');
    expect(rule.type).toBe('noOverlap');
    expect(rule.target).toBe('test/first');
    expect(rule.other).toBe('test/second');
  });
});

describe('BoundingBox', () => {
  it('should calculate right edge correctly', () => {
    const box: BoundingBox = { x: 10, y: 20, width: 100, height: 50 };
    expect(box.x + box.width).toBe(110);
  });

  it('should calculate bottom edge correctly', () => {
    const box: BoundingBox = { x: 10, y: 20, width: 100, height: 50 };
    expect(box.y + box.height).toBe(70);
  });

  it('should check containment correctly', () => {
    const inner: BoundingBox = { x: 10, y: 10, width: 50, height: 50 };
    const outer: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };

    const isContained =
      inner.x >= outer.x &&
      inner.y >= outer.y &&
      inner.x + inner.width <= outer.x + outer.width &&
      inner.y + inner.height <= outer.y + outer.height;

    expect(isContained).toBe(true);
  });
});
