export function lazyAsyncSingleton<T>(fn: () => Promise<T>): () => Promise<T> {
  let instance: T | null = null;
  return async () => {
    if (instance === null) {
      instance = await fn();
    }
    return instance;
  };
}

export function lazySingleton<T>(fn: () => T): () => T {
  let instance: T | null = null;
  return () => {
    if (instance === null) {
      instance = fn();
    }
    return instance;
  };
}
