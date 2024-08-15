'use client';

import { useEffect, useReducer } from 'react';
import { differenceInDays, differenceInHours, intervalToDuration } from 'date-fns';

export function CountdownTime({ until }: { until: Date }) {
  const now = new Date();
  const shouldCountdown = until > now;
  const forceRender = useReducer(() => ({}), {})[1];

  useEffect(() => {
    if (!shouldCountdown) return;
    const interval = setInterval(() => {
      forceRender();
    }, 1000);
    return () => clearInterval(interval);
  }, [forceRender, shouldCountdown]);

  if (!shouldCountdown) {
    return '即將結束';
  }

  const remain = intervalToDuration({ start: now, end: until });

  if (differenceInDays(until, now) > 0) {
    return `${remain.days} 天 ${remain.hours ?? 0} 時`;
  }

  if (differenceInHours(until, now) > 0) {
    return `${remain.hours} 時 ${remain.minutes ?? 0} 分`;
  }

  return `${remain.minutes} 分 ${remain.seconds ?? 0} 秒`;
}
