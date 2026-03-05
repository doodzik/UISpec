import { z } from 'zod';

export interface FailureBundle {
  ruleId: string;
  elementId: string;
  error: string;
  timestamp: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  computedStyles?: Record<string, string>;
  domSnippet?: string;
  involvedUiIds?: string[];
  screenshotPath?: string;
}

export const FailureBundleSchema = z
  .object({
    ruleId: z.string(),
    elementId: z.string(),
    error: z.string(),
    timestamp: z.string(),
    boundingBox: z
      .object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      })
      .optional(),
    computedStyles: z.record(z.string()).optional(),
    domSnippet: z.string().optional(),
    involvedUiIds: z.array(z.string()).optional(),
    screenshotPath: z.string().optional(),
  })
  .strict();

export function createFailureBundle(params: {
  ruleId: string;
  elementId: string;
  error: string;
  boundingBox?: FailureBundle['boundingBox'];
  computedStyles?: FailureBundle['computedStyles'];
  domSnippet?: FailureBundle['domSnippet'];
  involvedUiIds?: FailureBundle['involvedUiIds'];
  screenshotPath?: FailureBundle['screenshotPath'];
}): FailureBundle {
  return {
    ruleId: params.ruleId,
    elementId: params.elementId,
    error: params.error,
    timestamp: new Date().toISOString(),
    ...(params.boundingBox && { boundingBox: params.boundingBox }),
    ...(params.computedStyles && { computedStyles: params.computedStyles }),
    ...(params.domSnippet && { domSnippet: params.domSnippet }),
    ...(params.involvedUiIds && { involvedUiIds: params.involvedUiIds }),
    ...(params.screenshotPath && { screenshotPath: params.screenshotPath }),
  };
}
