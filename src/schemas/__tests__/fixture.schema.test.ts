import { describe, it, expect } from 'vitest';
import { FixtureSchema } from '../fixture.schema.js';

describe('FixtureSchema', () => {
  it('should accept valid fixture', () => {
    const fixture = {
      id: 'empty',
      data: {},
    };
    const result = FixtureSchema.safeParse(fixture);
    expect(result.success).toBe(true);
  });

  it('should accept fixture with data', () => {
    const fixture = {
      id: 'normal',
      data: {
        user: { name: 'Test User', email: 'test@example.com' },
      },
    };
    const result = FixtureSchema.safeParse(fixture);
    expect(result.success).toBe(true);
  });

  it('should reject fixture without id', () => {
    const fixture = { data: {} };
    const result = FixtureSchema.safeParse(fixture);
    expect(result.success).toBe(false);
  });

  it('should accept common fixture types', () => {
    const fixtures = [
      { id: 'normal', data: {} },
      { id: 'empty', data: {} },
      { id: 'longStrings', data: {} },
      { id: 'maxContent', data: {} },
      { id: 'rtl', data: {} },
    ];
    for (const fixture of fixtures) {
      const result = FixtureSchema.safeParse(fixture);
      expect(result.success).toBe(true);
    }
  });
});
