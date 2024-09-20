import {
  ZodArray,
  ZodCatch,
  ZodDefault,
  ZodEffects,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodReadonly,
  type SomeZodObject,
  type z,
  type ZodTypeAny,
} from 'zod';

export function parseSearchParams<T extends ZodTypeAny>(
  schema: UnwrapInnerType<T> extends SomeZodObject ? T : never,
  q:
    | URLSearchParams // for client side
    | Record<string, string | string[] | undefined> // for Next.js
): z.output<T> {
  // undefined instead of null for convenience of setting default value for destructing assignment
  type Shaped = Record<keyof z.output<T>, string | undefined | string[]>;

  //
  const unwrappedSchema = unwrapInnerType(schema) as SomeZodObject;
  if (!(unwrappedSchema instanceof ZodObject)) throw new Error('schema should compatible with ZodObject/SomeZodObject');

  if (q instanceof URLSearchParams) {
    const obj = {} as Shaped;
    for (const [k, s] of Object.entries(unwrappedSchema.shape)) {
      if (unwrapInnerType(s) instanceof ZodArray) obj[k as keyof Shaped] = q.getAll(k);
      else obj[k as keyof Shaped] = q.get(k) ?? undefined;
    }
    return schema.parse(obj);
  }
  // eslint-disable-next-line no-else-return
  else {
    const obj = {} as Shaped;
    for (const [k, s] of Object.entries(unwrappedSchema.shape)) {
      if (unwrapInnerType(s) instanceof ZodArray) {
        obj[k as keyof Shaped] = q[k] == null ? [] : Array.isArray(q[k]) ? q[k] : [q[k]];
      } else obj[k as keyof Shaped] = q[k] ?? undefined;
    }
    return schema.parse(obj);
  }
}

type UnwrapInnerType<
  T extends
    | ZodEffects<ZodTypeAny>
    | ZodOptional<ZodTypeAny>
    | ZodNullable<ZodTypeAny>
    | ZodReadonly<ZodTypeAny>
    | ZodDefault<ZodTypeAny>
    | ZodCatch<ZodTypeAny>
    | SomeZodObject
    | ZodTypeAny,
> =
  T extends ZodEffects<infer U, infer _, infer __>
    ? UnwrapInnerType<U>
    : T extends ZodOptional<infer U>
      ? UnwrapInnerType<U>
      : T extends ZodNullable<infer U>
        ? UnwrapInnerType<U>
        : T extends ZodReadonly<infer U>
          ? UnwrapInnerType<U>
          : T extends ZodDefault<infer U>
            ? UnwrapInnerType<U>
            : T extends ZodCatch<infer U>
              ? UnwrapInnerType<U>
              : T extends SomeZodObject | ZodTypeAny
                ? T
                : never;

function unwrapInnerType<
  T extends
    | ZodEffects<ZodTypeAny>
    | ZodOptional<ZodTypeAny>
    | ZodNullable<ZodTypeAny>
    | ZodReadonly<ZodTypeAny>
    | ZodDefault<ZodTypeAny>
    | ZodCatch<ZodTypeAny>
    | ZodTypeAny,
>(schema: T): UnwrapInnerType<T> {
  if (schema instanceof ZodEffects) {
    return unwrapInnerType(schema.innerType());
  }
  if (schema instanceof ZodOptional) {
    return unwrapInnerType(schema._def.innerType);
  }
  if (schema instanceof ZodNullable) {
    return unwrapInnerType(schema._def.innerType);
  }
  if (schema instanceof ZodReadonly) {
    return unwrapInnerType(schema._def.innerType);
  }
  if (schema instanceof ZodDefault) {
    return unwrapInnerType(schema._def.innerType);
  }
  if (schema instanceof ZodCatch) {
    return unwrapInnerType(schema._def.innerType);
  }
  return schema as any;
}
