export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type GeometryRuleType = 'containedWithin' | 'leftOf' | 'above' | 'noOverlap';

export interface GeometryRule {
  type: GeometryRuleType;
  target: string;
  container?: string;
  other?: string;
  tolerance?: number;
}

export interface GeometryValidationResult {
  passed: boolean;
  ruleId: string;
  targetId: string;
  error?: string;
}

export const GeometryRules = {
  containedWithin(target: string, container: string, tolerance = 0): GeometryRule {
    return { type: 'containedWithin', target, container, tolerance };
  },
  leftOf(target: string, other: string, tolerance = 0): GeometryRule {
    return { type: 'leftOf', target, other, tolerance };
  },
  above(target: string, other: string, tolerance = 0): GeometryRule {
    return { type: 'above', target, other, tolerance };
  },
  noOverlap(target: string, other: string, tolerance = 0): GeometryRule {
    return { type: 'noOverlap', target, other, tolerance };
  },
};

interface PageLocator {
  locator(selector: string): {
    first(): Promise<{ boundingBox(): Promise<BoundingBox | null> }>;
  };
}

export class GeometryValidator {
  private page: PageLocator;
  private tolerance = 2;

  constructor(page: PageLocator) {
    this.page = page;
  }

  async validate(targetId: string, rule: GeometryRule): Promise<GeometryValidationResult> {
    const targetSelector = `[data-ui="${targetId}"]`;

    switch (rule.type) {
      case 'containedWithin':
        return this.validateContainedWithin(targetSelector, targetId, rule);
      case 'leftOf':
        return this.validateLeftOf(targetSelector, targetId, rule);
      case 'above':
        return this.validateAbove(targetSelector, targetId, rule);
      case 'noOverlap':
        return this.validateNoOverlap(targetSelector, targetId, rule);
      default:
        return { passed: false, ruleId: rule.type, targetId, error: 'Unknown geometry rule type' };
    }
  }

  private async getBoundingBox(selector: string): Promise<BoundingBox | null> {
    try {
      const element = await this.page.locator(selector).first();
      return await element.boundingBox();
    } catch {
      return null;
    }
  }

  private async validateContainedWithin(
    targetSelector: string,
    targetId: string,
    rule: GeometryRule
  ): Promise<GeometryValidationResult> {
    const targetBox = await this.getBoundingBox(targetSelector);
    const containerSelector = `[data-ui="${rule.container}"]`;
    const containerBox = await this.getBoundingBox(containerSelector);

    if (!targetBox || !containerBox) {
      return {
        passed: false,
        ruleId: rule.type,
        targetId,
        error: 'Could not get bounding boxes for elements',
      };
    }

    const tol = rule.tolerance ?? this.tolerance;
    const isContained =
      targetBox.x >= containerBox.x - tol &&
      targetBox.y >= containerBox.y - tol &&
      targetBox.x + targetBox.width <= containerBox.x + containerBox.width + tol &&
      targetBox.y + targetBox.height <= containerBox.y + containerBox.height + tol;

    if (isContained) {
      return { passed: true, ruleId: rule.type, targetId };
    }

    return {
      passed: false,
      ruleId: rule.type,
      targetId,
      error: `Element is not contained within ${rule.container}`,
    };
  }

  private async validateLeftOf(
    targetSelector: string,
    targetId: string,
    rule: GeometryRule
  ): Promise<GeometryValidationResult> {
    const targetBox = await this.getBoundingBox(targetSelector);
    const otherSelector = `[data-ui="${rule.other}"]`;
    const otherBox = await this.getBoundingBox(otherSelector);

    if (!targetBox || !otherBox) {
      return {
        passed: false,
        ruleId: rule.type,
        targetId,
        error: 'Could not get bounding boxes for elements',
      };
    }

    const tol = rule.tolerance ?? this.tolerance;
    const isLeftOf = targetBox.x + targetBox.width <= otherBox.x + tol;

    if (isLeftOf) {
      return { passed: true, ruleId: rule.type, targetId };
    }

    return {
      passed: false,
      ruleId: rule.type,
      targetId,
      error: `Element is not left of ${rule.other}`,
    };
  }

  private async validateAbove(
    targetSelector: string,
    targetId: string,
    rule: GeometryRule
  ): Promise<GeometryValidationResult> {
    const targetBox = await this.getBoundingBox(targetSelector);
    const otherSelector = `[data-ui="${rule.other}"]`;
    const otherBox = await this.getBoundingBox(otherSelector);

    if (!targetBox || !otherBox) {
      return {
        passed: false,
        ruleId: rule.type,
        targetId,
        error: 'Could not get bounding boxes for elements',
      };
    }

    const tol = rule.tolerance ?? this.tolerance;
    const isAbove = targetBox.y + targetBox.height <= otherBox.y + tol;

    if (isAbove) {
      return { passed: true, ruleId: rule.type, targetId };
    }

    return {
      passed: false,
      ruleId: rule.type,
      targetId,
      error: `Element is not above ${rule.other}`,
    };
  }

  private async validateNoOverlap(
    targetSelector: string,
    targetId: string,
    rule: GeometryRule
  ): Promise<GeometryValidationResult> {
    const targetBox = await this.getBoundingBox(targetSelector);
    const otherSelector = `[data-ui="${rule.other}"]`;
    const otherBox = await this.getBoundingBox(otherSelector);

    if (!targetBox || !otherBox) {
      return {
        passed: false,
        ruleId: rule.type,
        targetId,
        error: 'Could not get bounding boxes for elements',
      };
    }

    const hasOverlap =
      targetBox.x < otherBox.x + otherBox.width &&
      targetBox.x + targetBox.width > otherBox.x &&
      targetBox.y < otherBox.y + otherBox.height &&
      targetBox.y + targetBox.height > otherBox.y;

    if (!hasOverlap) {
      return { passed: true, ruleId: rule.type, targetId };
    }

    return {
      passed: false,
      ruleId: rule.type,
      targetId,
      error: `Element overlaps with ${rule.other}`,
    };
  }
}
