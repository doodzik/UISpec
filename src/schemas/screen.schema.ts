import { z } from 'zod';
import { NodeSchema } from './node.schema.js';

export const ViewportSchema = z.record(z.string());

export type Viewport = z.infer<typeof ViewportSchema>;

export const ModeSchema = z.object({
  tree: z.array(NodeSchema),
  invariants: z
    .array(
      z.object({
        id: z.string(),
        description: z.string().optional(),
        target: z.string(),
        conditions: z.array(z.any()),
      })
    )
    .optional(),
});

export type Mode = z.infer<typeof ModeSchema>;

export const OverlaySchema = z.object({
  id: z.string(),
  route: z.string().optional(),
  anchor: z.string(),
});

export type Overlay = z.infer<typeof OverlaySchema>;

export const FlowStepSchema = z.object({
  action: z.enum(['click', 'expect', 'fill', 'hover', 'press']),
  target: z.string().optional(),
  value: z.string().optional(),
  route: z.string().optional(),
});

export type FlowStep = z.infer<typeof FlowStepSchema>;

export const FlowSchema = z.record(z.array(FlowStepSchema));

export type Flow = z.infer<typeof FlowSchema>;

export const InvariantSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  target: z.string(),
  conditions: z.array(z.any()),
});

export type Invariant = z.infer<typeof InvariantSchema>;

export const ScreenSchema = z
  .object({
    id: z.string(),
    routes: z.array(z.string()).min(1),
    viewports: ViewportSchema,
    modes: z.record(z.string(), ModeSchema),
    overlays: z.record(z.string(), OverlaySchema).optional(),
    flows: FlowSchema.optional(),
    invariants: z.array(InvariantSchema).optional(),
  })
  .strict();

export type Screen = z.infer<typeof ScreenSchema>;
