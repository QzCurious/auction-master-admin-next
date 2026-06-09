'use client';

import React, { useMemo, useRef, useState } from 'react';

function useStableCallback<T extends (...args: any[]) => any>(fn: T | undefined): T {
  const ref = useRef(fn);
  ref.current = fn;
  return useMemo(() => ((...args: Parameters<T>) => ref.current?.(...args)) as T, []);
}

interface ControllableState<T, P extends any[]> {
  defaultValue?: T;
  value?: T;
  onChange?: (value: T, ...args: P) => void;
}

type s = React.SetStateAction<string>;

export function useControllableState<T, P extends any[] = []>({
  defaultValue,
  value,
  onChange,
}: ControllableState<T, P>): [
  state: T,
  handler: NonNullable<typeof onChange>,
  // setValue: React.Dispatch<React.SetStateAction<T>>,
] {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue as T);

  const handler = useStableCallback<NonNullable<typeof onChange>>((value, ...args) => {
    if (isControlled) onChange?.(value, ...args);
    else setUncontrolled(value);
  });

  // const setValue = useStableCallback<React.Dispatch<React.SetStateAction<T>>>((prev) => {
  //   if (isControlled) onChange;
  //   else setUncontrolled(prev);
  // });

  return [isControlled ? value : uncontrolled, handler];
}

function Input({
  value,
  onChange,
  defaultValue,
}: {
  value?: string;
  onChange?: (value: string, num: number) => void;
  defaultValue?: string;
}) {
  const [state, handler] = useControllableState({ value, onChange, defaultValue });

  handler('', 3);

  return <input value={state} onChange={(e) => handler(e.target.value, 3)} />;
}

function View() {
  return <Input value="d" onChange={(x, num) => x} />;
}
