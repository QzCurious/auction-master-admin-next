import { revalidateTag } from 'next/cache';
import { mutationEffects, type MutationName } from '@/domain/data/freshness';

export function revalidateMutation(name: MutationName) {
  for (const tag of mutationEffects[name]) revalidateTag(tag);
}
