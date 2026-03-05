import { describe, it, expect } from 'vitest';
import { NodeKindSchema, NodeSchema } from '../node.schema.js';

describe('NodeSchema', () => {
  const validNode = {
    id: 'testId',
    kind: 'region' as const,
  };

  it('should accept valid node with id and kind', () => {
    const result = NodeSchema.safeParse(validNode);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('testId');
      expect(result.data.kind).toBe('region');
    }
  });

  it('should accept valid node with children', () => {
    const nodeWithChildren = {
      id: 'parent',
      kind: 'region' as const,
      children: [
        { id: 'child1', kind: 'component' as const },
        { id: 'child2', kind: 'control' as const },
      ],
    };
    const result = NodeSchema.safeParse(nodeWithChildren);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.children).toHaveLength(2);
    }
  });

  it('should reject node without id', () => {
    const nodeWithoutId = { kind: 'region' as const };
    const result = NodeSchema.safeParse(nodeWithoutId);
    expect(result.success).toBe(false);
  });

  it('should reject node without kind', () => {
    const nodeWithoutKind = { id: 'testId' };
    const result = NodeSchema.safeParse(nodeWithoutKind);
    expect(result.success).toBe(false);
  });

  it('should reject invalid kind', () => {
    const nodeWithInvalidKind = { id: 'testId', kind: 'invalid' };
    const result = NodeSchema.safeParse(nodeWithInvalidKind);
    expect(result.success).toBe(false);
  });

  it('should accept all valid node kinds', () => {
    const kinds = [
      'region',
      'component',
      'control',
      'container',
      'collection',
      'overlayAnchor',
    ] as const;
    for (const kind of kinds) {
      const node = { id: `test-${kind}`, kind };
      const result = NodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    }
  });

  it('should accept node with semantics', () => {
    const nodeWithSemantics = {
      id: 'testId',
      kind: 'component' as const,
      semantics: {
        role: 'button',
        label: 'Click me',
      },
    };
    const result = NodeSchema.safeParse(nodeWithSemantics);
    expect(result.success).toBe(true);
  });
});

describe('NodeKindSchema', () => {
  it('should accept all valid node kinds', () => {
    const validKinds = [
      'region',
      'component',
      'control',
      'container',
      'collection',
      'overlayAnchor',
    ];
    for (const kind of validKinds) {
      const result = NodeKindSchema.safeParse(kind);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid node kind', () => {
    const result = NodeKindSchema.safeParse('invalidKind');
    expect(result.success).toBe(false);
  });
});
