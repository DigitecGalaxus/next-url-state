'use client';

import { type MutableRefObject, useCallback, useEffect, useRef } from "react";
import { useRouterAdapter, type RouterAdapter } from "./routerAdapters";
import { parseUrlWithImplicitDomain } from "./utils/urlParsing";
import { type NonNullableUrlParams } from "./utils/parseUrl";
import { stringifyUrlParams } from "./utils/stringifyUrlParams";

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
          const url = `${pathname}${urlQueryString}${hash}`;

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
    []
  );
};


