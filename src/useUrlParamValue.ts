import { useUrlParamArray } from "./useUrlParamArray";

/** options for useUrlParam (with custom parser of string values) */
type UseUrlParamValueParser<TParam> = {
  /**
   * Function to parse the URL parameter into a custom format
   */
  parse: (param: string | undefined) => TParam;
};

/**
 * Hook to subscribe to a single url param
 *
 * Returns the optimistic value of the given parameter.
 * That means if the given param is changed by another `useUrlParam`
 * it might be different from the actual URL until nextjs updates the URL.
 *
 * @example
 * ```tsx
 * const userName = useUrlParamValue("userName");
 * ```
 */
export const useUrlParamValue = <TParam = string | undefined>(
  paramName: string,
  options?: UseUrlParamValueParser<TParam>,
): TParam =>
  useUrlParamArray<TParam>(paramName, {
    parse: (param) => {
      const first = Array.isArray(param) ? param[0] : param;
      return options ? (options.parse(first) as TParam) : (first as TParam);
    },
    serialize: () => [],
  })[0];
