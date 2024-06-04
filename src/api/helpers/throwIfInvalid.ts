import { type z } from 'zod';

export function throwIfInvalid<D extends z.input<Z>, Z extends z.ZodType<any>>(dataObj: D, schema: Z) {
  const res = schema.safeParse(dataObj);
  if (!res.success) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Invalid data');
      console.log('dataObj', dataObj);
    }
    throw new Error('Invalid data', { cause: res.error });
  }
  return;
}
