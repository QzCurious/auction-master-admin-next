import { z } from 'zod';

export const SearchParamsSchema = z.object({
  groupId: z.coerce.number().optional().catch(undefined),
});
