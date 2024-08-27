'use client';

import { useMemo, useRef, useState } from 'react';

function useStableCallback<T extends (...args: any[]) => any>(fn: T | undefined): T {
  const ref = useRef(fn);
  ref.current = fn;
  return useMemo(() => ((...args: Parameters<T>) => ref.current?.(...args)) as T, []);
}

interface ControllableState<T> {
  defaultValue?: T;
  value?: T;
  onChange?: (value: T) => void;
}

export function useControllableState<T>({
  defaultValue,
  value: valueProp,
  onChange,
}: ControllableState<T>): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState(defaultValue as T);

  const isControlled = valueProp !== undefined;
  const setControlledState = useStableCallback(
    isControlled
      ? (value: T | ((prev: T) => T)) => {
          onChange?.(typeof value === 'function' ? (value as (prev: T) => T)(valueProp) : value);
        }
      : undefined
  );

  if (isControlled) {
    return [valueProp, setControlledState];
  }

  return [state, setState];
}

function Input({
  value,
  onChange,
  defaultValue,
}: {
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
}) {
  const [state, setState] = useControllableState({ value: '', onChange, defaultValue, });

  return <input />;
}

function View() {
  return <Input value="d" onChange={(x) => x} />;
}
