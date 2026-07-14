import { DependencyList, useEffect, useRef, useState } from "react";

/**
 * Wraps a (synchronous) computation with a short artificial delay so the UI
 * can show loading skeletons on filter changes, the way a real analytics
 * backend would while it recomputes aggregates.
 */
export function useDelayedCompute<T>(compute: () => T, deps: DependencyList, delayMs = 420): { data: T; loading: boolean } {
  const [data, setData] = useState<T>(compute);
  const [loading, setLoading] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      setData(compute());
      setLoading(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, delayMs);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading };
}
