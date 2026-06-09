'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { visuallyHidden } from '@mui/utils';

interface UseMultiClickOptions {
  clicks: number;
  timeframe: number;
  onSuccess: () => void;
}

const useMultiClick = ({ clicks, timeframe, onSuccess }: UseMultiClickOptions) => {
  const clickCountRef = useRef(0);
  const timerRef = useRef<number>(0);

  const handleClick = useCallback(() => {
    clickCountRef.current += 1;
    console.log(clickCountRef.current);

    if (clickCountRef.current === 1) {
      timerRef.current = window.setTimeout(() => {
        clickCountRef.current = 0;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      }, timeframe);
    }

    if (clickCountRef.current === clicks) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      clickCountRef.current = 0;
      onSuccess();
    }
  }, [clicks, timeframe, onSuccess]);

  return handleClick;
};

export default function TriggerToFlowFigure() {
  const router = useRouter();
  return (
    <button
      type="button"
      style={{ width: '40px', height: '40px', opacity: 0 }}
      onClick={useMultiClick({
        clicks: 5,
        timeframe: 2000,
        onSuccess: () => {
          router.push('/dashboard/items/status-flow-figure');
        },
      })}
    >
      <span style={visuallyHidden}>hidden</span>
    </button>
  );
}
