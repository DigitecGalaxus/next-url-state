import type { UrlChangeOptions } from "./UrlParamsContext";
import { useUrlParamArray } from "./useUrlParamArray";

/** options for useUrlParam (with custom parser of string values) */
type UseUrlParamWithParser<TParam extends string | number | undefined> = {
  /**
   * Function to parse the URL parameter into a custom format
   */
  parse: (param: string | undefined) => TParam;
};
/** options for useUrlParam (for any possible data structure) */
type UseUrlParamWithParserAndSerializer<TParam> = {
  /**
   * Function to parse the URL parameter into a custom format
   */
  parse: (param: string | undefined) => TParam;
  /**
   * Convert the data back to a URL parameter.
   * An undefined value will remove the parameter from the url
   */
  serialize: (param: TParam) => string | undefined;
};
// If the internal state represenation is not a string it must
// be parsed and serialized
type UseUrlParamOptions<TParam> = [TParam] extends [string | number | undefined]
  ? UseUrlParamWithParser<TParam> | UseUrlParamWithParserAndSerializer<TParam>
  : UseUrlParamWithParserAndSerializer<TParam>;

/**
 * Hook to subscribe to a single url param
 *
 * Replaces the useQueryStringParam hook
 *
 * If the url param is multiple times in the url the first value will be used
 * e.g. /path?name=value1&name=value2 -> value1
 *
 * Any update to the specific url param will trigger a re-render
 *
 * ```ts
 * // simple
 * useUrlParam("name")
 *
 * // with boolean value
 * useUrlParam<boolean>("enabled", {
 *   parse: (param) => Boolean(param),
 *   serialize: (param) => String(param),
 * })
 *
 * // with custom parse and serialize functions
 * useUrlParam<number>("age", {
 *   parse: (param: string | undefined) => parseInt(param, 10),
 *   serialize: (param: number) => param > 0 ? param.toString() : undefined,
 * })
 * ```
 *
 * @example
 * ```tsx
 * const [userName, setUserName] = useUrlParam("userName");
 *
 * For a detailed example of the custom hook see useUrlParams.demo.tsx
 *
 * ```
 */
export const useUrlParam = <TParam = string | undefined>(
  paramName: string,
  options?: UseUrlParamOptions<TParam>,
): readonly [
  TParam,
  (newValue: TParam, options?: UrlChangeOptions) => Promise<void>,
] =>
  useUrlParamArray<TParam>(paramName, {
    parse: (param: string | string[]): TParam => {
      const newValue = Array.isArray(param) ? param[0] : param;
      return options ? options.parse(newValue) : (newValue as TParam);
    },
    serialize: (param: TParam): string | string[] => {
      const serializer = options && "serialize" in options && options.serialize;
      if (
        !serializer &&
        // without serializer undefined values remove the parameter from the url
        (param === undefined ||
          // use the parser to check if the value is the default value
          // so the default value is not written to the url
          (options && options.parse(undefined) === param))
      ) {
        return [];
      }
      // if the serializer returns undefined or null the parameter will be removed
      return (serializer || String)(param) ?? ([] as string[]);
    },
  });
