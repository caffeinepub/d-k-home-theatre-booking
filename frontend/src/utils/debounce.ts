/**
 * Creates a debounced version of a function that delays invoking it until
 * after `wait` milliseconds have elapsed since the last invocation.
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, wait);
  };
}

/**
 * Returns true if the given function call is within `wait` ms of the last call.
 * Useful for ref-based single-submission guards.
 */
export function createSubmitGuard(wait: number) {
  let lastSubmit = 0;
  return () => {
    const now = Date.now();
    if (now - lastSubmit < wait) return false;
    lastSubmit = now;
    return true;
  };
}
