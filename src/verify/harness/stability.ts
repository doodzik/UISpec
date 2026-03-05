export interface StabilityGate {
  conditions: string[];
  hydratedMarker?: string;
  fontsReady?: boolean;
  networkSettled?: boolean;
  dataReady?: string;
  layoutStable?: boolean;
}

export interface StabilityConditionType {
  type: 'hydrated' | 'fontsReady' | 'networkSettled' | 'dataReady' | 'layoutStable';
  selector?: string;
}

export function createStabilityGate(config: {
  hydratedMarker?: string;
  fontsReady?: boolean;
  networkSettled?: boolean;
  dataReady?: string;
  layoutStable?: boolean;
}): StabilityGate {
  const conditions: string[] = [];

  if (config.hydratedMarker) {
    conditions.push('hydrated');
  }
  if (config.fontsReady) {
    conditions.push('fontsReady');
  }
  if (config.networkSettled) {
    conditions.push('networkSettled');
  }
  if (config.dataReady) {
    conditions.push('dataReady');
  }
  if (config.layoutStable) {
    conditions.push('layoutStable');
  }

  return {
    conditions,
    ...config,
  };
}

export const StabilityCondition = {
  hydrated(selector: string): StabilityConditionType {
    return { type: 'hydrated', selector };
  },
  fontsReady(): StabilityConditionType {
    return { type: 'fontsReady' };
  },
  networkSettled(): StabilityConditionType {
    return { type: 'networkSettled' };
  },
  dataReady(selector: string): StabilityConditionType {
    return { type: 'dataReady', selector };
  },
  layoutStable(): StabilityConditionType {
    return { type: 'layoutStable' };
  },
};
