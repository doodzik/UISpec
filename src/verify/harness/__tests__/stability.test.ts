import { describe, it, expect } from 'vitest';
import { createStabilityGate, StabilityCondition } from '../stability.js';

describe('StabilityGate', () => {
  it('should create stability gate with default conditions', () => {
    const gate = createStabilityGate({});
    expect(gate).toBeDefined();
  });

  it('should check hydrated marker condition', () => {
    const gate = createStabilityGate({ hydratedMarker: '[data-hydrated]' });
    expect(gate.conditions).toContain('hydrated');
  });

  it('should check fonts ready condition', () => {
    const gate = createStabilityGate({ fontsReady: true });
    expect(gate.conditions).toContain('fontsReady');
  });

  it('should check network settled condition', () => {
    const gate = createStabilityGate({ networkSettled: true });
    expect(gate.conditions).toContain('networkSettled');
  });

  it('should check data ready condition', () => {
    const gate = createStabilityGate({ dataReady: '[data-loaded]' });
    expect(gate.conditions).toContain('dataReady');
  });

  it('should check layout stable condition', () => {
    const gate = createStabilityGate({ layoutStable: true });
    expect(gate.conditions).toContain('layoutStable');
  });

  it('should support multiple conditions', () => {
    const gate = createStabilityGate({
      hydratedMarker: '[data-hydrated]',
      fontsReady: true,
      networkSettled: true,
    });
    expect(gate.conditions).toHaveLength(3);
  });

  it('should return all conditions as array', () => {
    const gate = createStabilityGate({
      hydratedMarker: '[data-hydrated]',
      fontsReady: true,
      networkSettled: true,
      layoutStable: true,
    });
    expect(gate.conditions).toEqual(['hydrated', 'fontsReady', 'networkSettled', 'layoutStable']);
  });
});

describe('StabilityCondition', () => {
  it('should create hydrated condition', () => {
    const condition = StabilityCondition.hydrated('[data-hydrated]');
    expect(condition.type).toBe('hydrated');
    expect(condition.selector).toBe('[data-hydrated]');
  });

  it('should create fonts ready condition', () => {
    const condition = StabilityCondition.fontsReady();
    expect(condition.type).toBe('fontsReady');
  });

  it('should create network settled condition', () => {
    const condition = StabilityCondition.networkSettled();
    expect(condition.type).toBe('networkSettled');
  });

  it('should create data ready condition', () => {
    const condition = StabilityCondition.dataReady('[data-loaded]');
    expect(condition.type).toBe('dataReady');
    expect(condition.selector).toBe('[data-loaded]');
  });

  it('should create layout stable condition', () => {
    const condition = StabilityCondition.layoutStable();
    expect(condition.type).toBe('layoutStable');
  });
});
