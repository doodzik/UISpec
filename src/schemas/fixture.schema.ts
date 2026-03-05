import { z } from 'zod';

export const FixtureSchema = z
  .object({
    id: z.string(),
    data: z.record(z.any()),
  })
  .strict();

export type Fixture = z.infer<typeof FixtureSchema>;
