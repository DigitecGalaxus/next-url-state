import { useCallback, useContext, useEffect, useRef } from "react";
import { type NonNullableUrlParam, type UrlParam } from "./utils/parseUrl";
import {
  type UrlChangeOptions,
  UrlParamsContext,
} from "./UrlParamsContext";
import { useComputedValue } from "./useComputedValue";

/** options for useUrlParam (with custom parser of string values) */
type UseUrlParamArrayWithParser<TParam extends string | string[]> = {
  /**
   * Function to parse the URL parameter into a custom format
   */
  parse: (param: string | string[]) => TParam;
};
/** options for useUrlParam (for any possible data structure) */
type UseUrlParamArrayWithParserAndSerializer<TParam> = {
  /**
   * Function to parse the URL parameter into a custom format
   */
  parse: (param: string | string[]) => TParam;
  /**
   * Convert the data back to a URL parameter.
   * An undefined value will remove the parameter from the url
   */
  serialize: (param: TParam) => string | string[];
};
// If the internal state represenation is not a string | string[] it must
// be parsed and serialized
export type UseParamsOptions<TParam> = [TParam] extends [string | string[]]
  ?
      | UseUrlParamArrayWithParser<TParam>
      | UseUrlParamArrayWithParserAndSerializer<TParam>
  : UseUrlParamArrayWithParserAndSerializer<TParam>;

/**
 * Hook to subscribe to a single url param with multiple values
 *
 * e.g. /path?name=value1&name=value2
 *
 * Any update to the specific url param will trigger a re-render
 *
 * ```ts
 * // simple
 * useUrlParamArray("name")
 *
 * // complex
 * useUrlParamArray<TParam>("name", {
 *   parse: (param: string) => TParam,
 *   serialize: (param: TParam) => string,
 * })
 * ```
 *
 * @example
 * ```tsx
 * const [userName, setUserName] = useUrlParamArray("userName");
 *
 * For a detailed example of the custom hook see useUrlParams.demo.tsx
 *
 * ```
 */
export const useUrlParamArray = <TParam = string | string[]>(
  paramName: string,
  options?: UseParamsOptions<TParam>,
): readonly [
  TParam,
  (newValue: TParam, options?: UrlChangeOptions) => Promise<void>,
] => {
  const { urlParams, addParamCallback, setUrlParam } =
    useContext(UrlParamsContext);

  const currentParamRawValue = urlParams.sync[paramName];

  const [[value], setValue] = useComputedValue<[TParam, UrlParam]>(
    () => [
      parseParamValue(currentParamRawValue || [], options) as TParam,
      currentParamRawValue,
    ],
    [currentParamRawValue],
  );

  // Rerender when the url param changes
  // paramName is a dep so the callback re-registers if the watched param changes
  useEffect(
    () =>
      addParamCallback(paramName, (newValue) => {
        setValue((previous) =>
          previous[1] === newValue
            ? previous
            : [parseParamValue(newValue || [], options) as TParam, newValue],
        );
      }),
    [paramName],
  );

  // Use a ref so the callback stays stable even when options is an inline object
  // that changes reference on every render (common when useUrlParam wraps useUrlParamArray).
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const updateValue = useCallback(
    async (newValue: TParam, urlChangeOptions?: UrlChangeOptions) => {
      const currentOptions = optionsRef.current;
      let urlParamValue: string | string[];
      if (currentOptions) {
        if ("serialize" in currentOptions && currentOptions.serialize) {
          urlParamValue = currentOptions.serialize(newValue);
        }
        // Remove the parameter if the value is undefined or the default value
        else if (currentOptions.parse([]) === newValue || newValue === undefined) {
          urlParamValue = [];
        } else {
          urlParamValue = newValue as string | string[];
        }
      } else {
        urlParamValue = newValue as string | string[];
      }
      return setUrlParam(paramName, urlParamValue, urlChangeOptions);
    },
    [paramName, setUrlParam],
  );

  return [value, updateValue] as const;
};

/**
 * Parse, validate, and transform a URL parameter value.
 *
 * This function handles the retrieval of a URL parameter value, applying optional parsing,
 * validation, and default value logic if provided. It ensures that the returned value meets
 * the specified criteria or falls back to a default value if provided.
 *
 * @param paramValue - The current value of the URL parameter.
 * @param options - Optional configuration object for handling the parameter value. This includes
 *                  defaultValue, parse and serialize functions.
 * @returns The processed value of the URL parameter, which could be the parsed value, the default
 *          value, or the original value depending on the provided options and the parameter state.
 **/
const parseParamValue = <TParam>(
  paramValue: NonNullableUrlParam,
  options?: UseParamsOptions<TParam>,
): TParam | NonNullableUrlParam => {
  if (options) {
    return options.parse(paramValue);
  }
  return paramValue;
};
