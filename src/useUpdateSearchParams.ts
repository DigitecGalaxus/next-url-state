'use client';

import { type MutableRefObject, useCallback, useRef } from "react";
import { useRouterAdapter, type RouterAdapter } from "./routerAdapters";
import { parseUrlWithImplicitDomain } from "./utils/urlParsing";
import { type NonNullableUrlParams } from "./utils/parseUrl";
import { stringifyUrlParams } from "./utils/stringifyUrlParams";
import { getHistoryStateToForward } from "./utils/historyState";

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

  // Assigned during render instead of inside an effect. Effects run child-first,
  // so a param update fired from a child's mount effect happens *before* the
  // provider's own effects. With the ref still empty at that point, the very
  // first update of a page load always took the History API fallback below even
  // though a router was available — which left the Next.js router pointing at
  // the old URL, so its next commit wrote that URL straight back to the address
  // bar (the removed param reappeared).
  routerAdapterRef.current = routerAdapter.isReady ? routerAdapter : null;

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
          // window.location.pathname is used instead of the router-reported pathname
          // because Next.js strips the basePath from usePathname()/router.asPath,
          // while window.location.pathname always reflects what's in the address bar.
          const url = `${window.location.pathname}${urlQueryString}${hash}`;

          // See getHistoryStateToForward: the Pages Router needs its existing
          // history.state forwarded, the App Router needs `null` so its
          // pushState/replaceState patch keeps the router in sync.
          const historyMethod = isShallow ? 'replaceState' : 'pushState';
          window.history[historyMethod](getHistoryStateToForward(), "", url);
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


