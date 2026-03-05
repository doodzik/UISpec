import { z } from 'zod';

export const NodeKindSchema = z.enum([
  'region',
  'component',
  'control',
  'container',
  'collection',
  'overlayAnchor',
]);

export type NodeKind = z.infer<typeof NodeKindSchema>;

const SemanticsSchema = z.object({
  role: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
});

export type Semantics = z.infer<typeof SemanticsSchema>;

export interface Node {
  id: string;
  kind: NodeKind;
  children?: Node[];
  semantics?: Semantics;
}

export const NodeSchema: z.ZodType<Node> = z
  .object({
    id: z.string(),
    kind: NodeKindSchema,
    children: z.array(z.any()).optional(),
    semantics: SemanticsSchema.optional(),
  })
  .strict();
