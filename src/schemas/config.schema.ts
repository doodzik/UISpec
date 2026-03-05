import { z } from 'zod';
import { ScreenSchema } from './screen.schema.js';
import { FixtureSchema } from './fixture.schema.js';

const BrowserOptionsSchema = z
  .object({
    headless: z.boolean().optional(),
    viewport: z
      .object({
        width: z.number(),
        height: z.number(),
      })
      .optional(),
    deviceScaleFactor: z.number().optional(),
  })
  .optional();

export type BrowserOptions = z.infer<typeof BrowserOptionsSchema>;

const StabilitySchema = z
  .object({
    hydratedMarker: z.string().optional(),
    fontsReady: z.boolean().optional(),
    networkSettled: z.boolean().optional(),
    dataReady: z.string().optional(),
    layoutStable: z.boolean().optional(),
  })
  .optional();

export type Stability = z.infer<typeof StabilitySchema>;

export const ConfigSchema = z
  .object({
    appUrl: z.string().url(),
    screens: z.array(ScreenSchema).min(1),
    fixtures: z.array(FixtureSchema).optional(),
    browser: BrowserOptionsSchema,
    stability: StabilitySchema,
  })
  .strict();

export type Config = z.infer<typeof ConfigSchema>;
