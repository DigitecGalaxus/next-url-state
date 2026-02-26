import {
  type DependencyList,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
/**
 * A hook that computes a value on every render when dependencies change
 * and allows triggering re-renders when updating it.
 *
 * @param computeFn - A function that computes the value
 * @param deps - Dependency array that triggers recomputation when changed
 * @returns [currentValue, setValue]
 *   - currentValue: The most up-to-date computed value
 *   - setValue: Function to update the value and trigger a re-render or return the previous value
 */
export function useComputedValue<T>(
  computeFn: () => T,
  deps: DependencyList,
): readonly [T, (updater: (prev: T) => T) => void] {
  // Compute value synchronously when dependencies change
  const computed = useMemo(computeFn, deps);
  // This ref holds the most up-to-date value
  const valueRef = useRef<T>(computed);
  valueRef.current = computed;

  // This state is only used to trigger re-renders
  const [, triggerRender] = useState({});

  // Function to update the value and trigger a re-render
  const setValue = useCallback((updater: (prev: T) => T) => {
    const nextValue = updater(valueRef.current);
    // Only update if the value has changed (reference inequality)
    if (valueRef.current !== nextValue) {
      valueRef.current = nextValue;
      // Trigger a re-render
      triggerRender({});
    }
  }, []);

  return [valueRef.current, setValue] as const;
}
