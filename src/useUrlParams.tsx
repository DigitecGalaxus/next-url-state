import { useContext, useEffect, useState } from "react";
import type { NonNullableUrlParams, UrlParam } from "./utils/parseUrl";
import {
  type UrlChangeOptions,
  UrlParamsContext,
} from "./UrlParamsContext";

type GenericUrlParams<TKeys extends string> = [TKeys] extends [string]
  ? { [key in TKeys]: Readonly<UrlParam> }
  : Record<string, Readonly<UrlParam>>;

type GenericUrlParamsArray<TKeys extends string> = [TKeys] extends [string]
  ? { [key in TKeys]: Readonly<string[]> }
  : Record<string, Readonly<string[] | undefined>>;

type GenericUrlParamsString<TKeys extends string> = [TKeys] extends [string]
  ? { [key in TKeys]: string | undefined }
  : Record<string, string | undefined>;

/**
 * Hook to subscribe to ALL url params or to a subsest of them
 *
 * Any update to SOME or ALL url param will trigger a re-render
 *
 * @param keys (Optional) Array of specific url param keys to subscribe to
 * @example
 * ```tsx
 * const [urlParams, setUrlParams] = useUrlParams();
 *
 * // Subscribe only to specific params
 * const [urlParams, setUrlParams] = useUrlParams(["param1", "param2"]);
 * ```
 */
export const useUrlParams = <TKeys extends string>(
  keys: TKeys[] = [],
): [
  Readonly<GenericUrlParamsString<TKeys>>,
  (
    newValue: Partial<GenericUrlParamsString<TKeys>>,
    options?: UrlChangeOptions,
  ) => void,
] => {
  const { urlParams, addParamsCallback, setUrlParams } =
    useContext(UrlParamsContext);
  const [currentUrlParams, setUrlParamsState] = useState<
    Readonly<GenericUrlParamsString<TKeys>>
  >(() => filterByKeys(urlParams.sync, keys));

  useEffect(() => {
    return addParamsCallback((newParams, changedKeys) => {
      // Subscribe to all params if no specific keys are provided
      // or to specific keys if they have changed
      if (keys.length === 0 || keys.some((key) => changedKeys.has(key))) {
        setUrlParamsState(filterByKeys(newParams, keys));
      }
    });
  }, [
    // join keys re-subscribe only if the value of keys changes
    // use null value not allowed in urls to prevent conflicts with actual key separators
    keys.join("\0"),
  ]);
  return [
    currentUrlParams,
    setUrlParams as (
      newValue: Partial<GenericUrlParamsString<TKeys>>,
      options?: UrlChangeOptions,
    ) => void,
  ] as const;
};

const filterByKeys = <TKeys extends string>(
  urlParams: NonNullableUrlParams,
  keys: TKeys[],
) => {
  const newKeys = keys.length === 0 ? Object.keys(urlParams) : keys;
  const filteredParams: GenericUrlParamsString<string> = {};
  for (const key of newKeys) {
    const value = urlParams[key];
    filteredParams[key] = Array.isArray(value) ? value[0] : value;
  }
  return filteredParams as GenericUrlParamsString<TKeys>;
};

/**
 * Hook to subscribe to ALL url params or to a subsest of them
 *
 * Any update to SOME or ALL url param will trigger a re-render
 *
 * @param keys (Optional) Array of specific url param keys to subscribe to
 * @example
 * ```tsx
 * const [urlParams, setUrlParams] = useUrlParams();
 *
 * // Subscribe only to specific params
 * const [urlParams, setUrlParams] = useUrlParams(["param1", "param2"]);
 * ```
 */
export const useUrlParamsArray = <TKeys extends string>(
  keys: TKeys[] = [],
): [
  Readonly<GenericUrlParamsArray<TKeys>>,
  (
    newValue: Partial<GenericUrlParams<TKeys>>,
    options?: UrlChangeOptions,
  ) => void,
] => {
  const { urlParams, addParamsCallback, setUrlParams } =
    useContext(UrlParamsContext);
  const [currentUrlParams, setUrlParamsState] = useState<
    Readonly<GenericUrlParamsArray<TKeys>>
  >(() => filterByKeysArray(urlParams.sync, keys));

  useEffect(() => {
    return addParamsCallback((newParams, changedKeys) => {
      // Subscribe to all params if no specific keys are provided
      // or to specific keys if they have changed
      if (keys.length === 0 || keys.some((key) => changedKeys.has(key))) {
        setUrlParamsState(filterByKeysArray(newParams, keys));
      }
    });
  }, [
    // join keys re-subscribe only if the value of keys changes
    // use null value not allowed in urls to prevent conflicts with actual key separators
    keys.join("\0"),
  ]);
  return [
    currentUrlParams,
    setUrlParams as (
      newValue: Partial<GenericUrlParams<TKeys>>,
      options?: UrlChangeOptions,
    ) => void,
  ] as const;
};

const filterByKeysArray = <TKeys extends string>(
  urlParams: NonNullableUrlParams,
  keys: TKeys[],
) => {
  const newKeys = keys.length === 0 ? Object.keys(urlParams) : keys;
  const filteredParams: GenericUrlParamsArray<string> = {};
  for (const key of newKeys) {
    const value = urlParams[key] || [];
    filteredParams[key] = Array.isArray(value) ? value : [value];
  }
  return filteredParams as GenericUrlParamsArray<TKeys>;
};
