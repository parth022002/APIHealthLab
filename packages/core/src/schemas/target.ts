import { z } from 'zod';

export const TargetContextSchema = z.object({
  model: z.string().max(128).optional(),
  project: z.string().max(128).optional(),
  deployment: z.string().max(128).optional(),
  region: z.string().max(64).optional(),
  resource: z.string().max(256).optional(),
  extra: z.record(z.string().max(64), z.string().max(256)).optional(),
});
export type TargetContext = z.infer<typeof TargetContextSchema>;
