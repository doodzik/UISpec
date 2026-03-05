export type SemanticRuleType = 'exists' | 'visible' | 'accessibleName' | 'role';

export interface SemanticRule {
  type: SemanticRuleType;
  target: string;
  value?: string;
}

export interface ValidationResultSuccess {
  passed: true;
  ruleId: string;
  elementId: string;
}

export interface ValidationResultFailure {
  passed: false;
  ruleId: string;
  elementId: string;
  error: string;
}

export type ValidationResult = ValidationResultSuccess | ValidationResultFailure;

export const ValidationResults = {
  success(ruleId: string, elementId: string): ValidationResultSuccess {
    return { passed: true, ruleId, elementId };
  },
  failure(ruleId: string, elementId: string, error: string): ValidationResultFailure {
    return { passed: false, ruleId, elementId, error };
  },
};

export const ValidationRules = {
  exists(target: string): SemanticRule {
    return { type: 'exists', target };
  },
  visible(target: string): SemanticRule {
    return { type: 'visible', target };
  },
  accessibleName(target: string, name: string): SemanticRule {
    return { type: 'accessibleName', target, value: name };
  },
  role(target: string, role: string): SemanticRule {
    return { type: 'role', target, value: role };
  },
};

interface PageLocator {
  locator(_selector: string): {
    count(): Promise<number>;
    first(): Promise<ElementLocator>;
    all(): Promise<ElementLocator[]>;
  };
}

interface ElementLocator {
  isVisible(): Promise<boolean>;
  getAttribute(_attr: string): Promise<string | null>;
}

export class SemanticValidator {
  private page: PageLocator;

  constructor(page: PageLocator) {
    this.page = page;
  }

  async validateElement(uiId: string, rule: SemanticRule): Promise<ValidationResult> {
    const selector = `[data-ui="${uiId}"]`;

    switch (rule.type) {
      case 'exists':
        return this.validateExists(selector, uiId, rule);
      case 'visible':
        return this.validateVisible(selector, uiId, rule);
      case 'accessibleName':
        return this.validateAccessibleName(selector, uiId, rule);
      case 'role':
        return this.validateRole(selector, uiId, rule);
      default:
        return ValidationResults.failure('unknown', uiId, 'Unknown rule type');
    }
  }

  private async validateExists(
    selector: string,
    uiId: string,
    rule: SemanticRule
  ): Promise<ValidationResult> {
    try {
      const count = await this.page.locator(selector).count();
      if (count > 0) {
        return ValidationResults.success(`exists:${rule.type}`, uiId);
      }
      return ValidationResults.failure(
        `exists:${rule.type}`,
        uiId,
        `Element ${selector} not found`
      );
    } catch {
      return ValidationResults.failure(
        `exists:${rule.type}`,
        uiId,
        `Error checking element existence`
      );
    }
  }

  private async validateVisible(
    selector: string,
    uiId: string,
    rule: SemanticRule
  ): Promise<ValidationResult> {
    try {
      const element = await this.page.locator(selector).first();
      const isVisible = await element.isVisible();
      if (isVisible) {
        return ValidationResults.success(`visible:${rule.type}`, uiId);
      }
      return ValidationResults.failure(
        `visible:${rule.type}`,
        uiId,
        `Element ${selector} is not visible`
      );
    } catch {
      return ValidationResults.failure(
        `visible:${rule.type}`,
        uiId,
        `Error checking element visibility`
      );
    }
  }

  private async validateAccessibleName(
    selector: string,
    uiId: string,
    rule: SemanticRule
  ): Promise<ValidationResult> {
    try {
      const element = await this.page.locator(selector).first();
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledby = await element.getAttribute('aria-labelledby');
      const textContent = await element.getAttribute('text');

      const accessibleName = ariaLabel || ariaLabelledby || textContent || '';

      if (accessibleName === rule.value) {
        return ValidationResults.success(`accessibleName:${rule.type}`, uiId);
      }
      return ValidationResults.failure(
        `accessibleName:${rule.type}`,
        uiId,
        `Accessible name "${accessibleName}" does not match expected "${rule.value}"`
      );
    } catch {
      return ValidationResults.failure(
        `accessibleName:${rule.type}`,
        uiId,
        `Error checking accessible name`
      );
    }
  }

  private async validateRole(
    selector: string,
    uiId: string,
    rule: SemanticRule
  ): Promise<ValidationResult> {
    try {
      const element = await this.page.locator(selector).first();
      const role = await element.getAttribute('role');

      if (role === rule.value) {
        return ValidationResults.success(`role:${rule.type}`, uiId);
      }
      return ValidationResults.failure(
        `role:${rule.type}`,
        uiId,
        `Role "${role}" does not match expected "${rule.value}"`
      );
    } catch {
      return ValidationResults.failure(`role:${rule.type}`, uiId, `Error checking role`);
    }
  }
}
