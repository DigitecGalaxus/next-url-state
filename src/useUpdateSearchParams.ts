'use client';

import { type MutableRefObject, useCallback, useEffect, useRef } from "react";
import { useRouterAdapter, type RouterAdapter } from "./routerAdapters";
import { parseUrlWithImplicitDomain } from "./utils/urlParsing";
import { type NonNullableUrlParams, type UrlParams } from "./utils/parseUrl";

export type UpdateRouterOptions = {
  /**
   * Shallow routing allows you to change the URL without running data fetching methods again,
   * that includes getServerSideProps, getStaticProps, and getInitialProps.
   *
   * `true` by default
   */
  shallow?: boolean;
};

export type UpdateRouter = (
  params: NonNullableUrlParams,
  latestRouterPathRef: MutableRefObject<string>,
  options?: UpdateRouterOptions
) => Promise<boolean>;

/**
 * Usability hook to update the router params
 * Either push or replace the current route with the new params.
 *
 * @example
 * ```tsx
 * const updateSearchParams = useUpdateRouterParams();
 * ```
 **/
export const useUpdateSearchParams = () => {
  const routerAdapter = useRouterAdapter();
  const routerAdapterRef = useRef<RouterAdapter | null>(null);

  // set the ref only when the router becomes ready (client)
  useEffect(() => {
    if (routerAdapter.isReady) {
      routerAdapterRef.current = routerAdapter;
    } else {
      routerAdapterRef.current = null;
    }
  }, [routerAdapter.isReady]);

  return useCallback(
    (
      routerMethod: "push" | "replace",
      params: NonNullableUrlParams,
      latestRouterPathRef: MutableRefObject<string>,
      options: UpdateRouterOptions = {}
    ): Promise<boolean> => {
      const { pathname, hash } = parseUrlWithImplicitDomain(
        latestRouterPathRef.current
      );

      const isShallow = options.shallow === undefined || options.shallow;

      // If router is not ready, fallback to History API (browser only)
      if (!routerAdapterRef.current) {
        if (typeof window !== 'undefined') {
          const queryString = stringifyUrlParams(params);
          const urlQueryString = queryString ? `?${queryString}` : "";
          const urlHash = hash ? `${hash}` : "";
          const url = `${pathname}${urlQueryString}${urlHash}`;

          // Shallow routing uses replaceState, non-shallow uses pushState
          const historyMethod = isShallow ? 'replaceState' : 'pushState';
          window.history[historyMethod]({}, "", url);
        }
        return Promise.resolve(true);
      }

      // Use the router adapter to update URL
      return routerAdapterRef.current.updateUrl(
        routerMethod,
        params,
        pathname,
        hash,
        isShallow
      );
    },
    [routerAdapterRef]
  );
};

/**
 * Convert a UrlParams object to a query string.
 *
 * @example
 * ```ts
 * const params = { a: "1", b: "2", c: ["1", "2", "3"] };
 * const queryString = stringifyUrlParams(params);
 * // -> "a=1&b=2&c=1&c=2&c=3"
 * ```
 */
export const stringifyUrlParams = (params: UrlParams) => {
  const searchParams = new URLSearchParams();
  for (const key in params) {
    const value = params[key];
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else if (value !== undefined) {
      searchParams.set(key, value);
    }
  }
  return searchParams.toString();
};
