import { type FieldNamesMarkedBoolean, type FieldValues } from 'react-hook-form';
import { isArray } from 'remeda';

export const getDirtyFields = <TFieldValues extends FieldValues>(
  formValues: TFieldValues,
  dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>
): Partial<TFieldValues> => {
  const dirtyValues = {} as Partial<TFieldValues>;
  for (const entry of Object.entries(dirtyFields)) {
    const [key, value] = entry as [keyof TFieldValues, any];

    if (!value) continue;

    /**
     * for `key in formValues`:
     * User might pass a subset of FieldValues, produced by `useForm`, to formValues
     * ```typescript
     * const {
     *   handleSubmit,
     *   formState: { dirtyFields },
     * } = useForm()
     * handleSubmit(({ someField, ...data }) => {
     *   getDirtyFields(data, dirtyFields)
     * })
     * ```
     */
    if (value === true) {
      if (key in formValues) dirtyValues[key] = formValues[key];
      continue;
    }

    if (isArray(value)) {
      (dirtyValues[key] as []) = [];

      for (let i = 0; i < value.length; i++) {
        if (!value[i]) continue;
        if (value[i] === true) {
          dirtyValues[key][i] = formValues[key][i];
          continue;
        }
        if (value[i]) {
          dirtyValues[key][i] = getDirtyFields(formValues[key][i], value[i] as any);
          continue;
        }
      }
      continue;
    }

    (dirtyValues[key] as any) = getDirtyFields(formValues[key], value);
  }

  return dirtyValues;
};
