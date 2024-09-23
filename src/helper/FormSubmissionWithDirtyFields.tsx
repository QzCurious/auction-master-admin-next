import type React from 'react';
import { type ComponentProps } from 'react';
import {
  useFormContext,
  useFormState,
  type FieldValues,
  type FormState,
  type SubmitErrorHandler,
} from 'react-hook-form';

export function FormSubmissionWithDirtyFields<
  TFieldValues extends FieldValues,
  TContext = any,
  TransformedValues extends FieldValues | undefined = undefined,
>({
  children,
  onValid,
  onInvalid,
  ...props
}: Omit<ComponentProps<'form'>, 'onSubmit'> & {
  onValid: (
    data: TransformedValues extends undefined
      ? TFieldValues
      : TransformedValues extends FieldValues
        ? TransformedValues
        : never,
    dirtyFields: FormState<TFieldValues>['dirtyFields'],
    event?: React.BaseSyntheticEvent
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ) => unknown | Promise<unknown>;
  onInvalid?: SubmitErrorHandler<TFieldValues>;
}) {
  const { handleSubmit } = useFormContext<TFieldValues, TContext, TransformedValues>();

  const { dirtyFields } = useFormState();

  return (
    <form
      {...props}
      onSubmit={handleSubmit(
        // @ts-expect-error cannot type this generic well
        (data, e) => onValid(data, dirtyFields, e),
        onInvalid
      )}
    >
      {children}
    </form>
  );
}
