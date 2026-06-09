import { useCallback, useEffect, useState } from 'react';

export function useObjectURL() {
  // eslint-disable-next-line react/hook-use-state
  const [urlMap] = useState(() => new Map<File, string>());

  useEffect(
    () => () => {
      for (const url of urlMap.values()) URL.revokeObjectURL(url);
    },
    [urlMap]
  );

  const createUrl = useCallback(
    (file: File) => {
      const url = urlMap.get(file) ?? URL.createObjectURL(file);
      if (!urlMap.has(file)) {
        urlMap.set(file, url);
      }
      return url;
    },
    [urlMap]
  );

  const revokeUrl = useCallback(
    (file: File) => {
      const url = urlMap.get(file);
      if (url) {
        URL.revokeObjectURL(url);
        urlMap.delete(file);
      }
    },
    [urlMap]
  );

  return { createUrl, revokeUrl };
}
