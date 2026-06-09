import { type z } from 'zod';

export interface SuccessResponseJson<T> {
  data: T;
  status: {
    code: '0';
    message: 'Success';
    dateTime: string;
    traceCode: string;
  };
  error?: never;
}

export interface FailedResponseJson {
  data: null;
  status: {
    code: string;
    message: string;
    dateTime: string;
    traceCode: string;
  };
}

export function throwIfInvalid<D extends z.input<Z>, Z extends z.ZodTypeAny>(dataObj: D, schema: Z) {
  const res = schema.safeParse(dataObj);
  if (!res.success) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Invalid data');
      console.log('dataObj', dataObj);
    }
    throw new Error('Invalid data', { cause: res.error });
  }
  return res.data as z.output<Z>;
}
