'use client';

import { NextRouter } from "next/router";
import type { NonNullableUrlParams } from "./utils/parseUrl";

/**
 * Common router interface that abstracts both Pages Router and App Router
 */
export interface RouterAdapter {
  /**
   * Get the current URL path with search params and hash
   */
  getCurrentPath(): string;

  /**
   * Check if the router is ready to be used
   */
  isReady: boolean;

  /**
   * Update URL with new search params
   * @param method - 'push' for new history entry, 'replace' to replace current
   * @param params - URL search parameters to set
   * @param pathname - Current pathname
   * @param hash - Current hash
   * @param shallow - Whether to use shallow routing (Pages Router only)
   */
  updateUrl(
    method: 'push' | 'replace',
    params: NonNullableUrlParams,
    pathname: string,
    hash: string,
    shallow: boolean
  ): Promise<boolean>;

  /**
   * The router type identifier
   */
  type: 'pages' | 'app' | 'fallback';
}

/**
 * Hook to detect and create the appropriate router adapter
 * This must be called as a hook from a React component
 */
export function useRouterAdapter(): RouterAdapter {
  // Server-side: return fallback adapter
  if (typeof window === 'undefined') {
    return createFallbackAdapter();
  }

  // Try Pages Router first (most common)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useRouter: usePagesRouter } = require('next/router');
    const pagesRouter = usePagesRouter();

    if (pagesRouter) {
      return createPagesRouterAdapter(pagesRouter);
    }
  } catch (e) {
    // Pages Router not available, try App Router
  }

  // Try App Router
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const navigation = require('next/navigation');
    const { usePathname, useSearchParams, useRouter: useAppRouter } = navigation;

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useAppRouter();

    if (pathname !== null && searchParams && router) {
      return createAppRouterAdapter(pathname, searchParams, router);
    }
  } catch (e) {
    // App Router not available
  }

  // Fallback to History API
  return createFallbackAdapter();
}

/**
 * Create an adapter for Next.js App Router (next/navigation)
 */
function createAppRouterAdapter(
  pathname: string,
  searchParams: URLSearchParams,
  router: NextRouter
): RouterAdapter {
  return {
    type: 'app',
    isReady: true, // App Router is always ready

    getCurrentPath(): string {
      const search = searchParams.toString();
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      return `${pathname}${search ? `?${search}` : ''}${hash}`;
    },

    updateUrl(
      method: 'push' | 'replace',
      params: NonNullableUrlParams,
      pathname: string,
      hash: string,
      _shallow: boolean // App Router doesn't support shallow routing
    ): Promise<boolean> {
      const queryString = stringifyUrlParams(params);
      const urlQueryString = queryString ? `?${queryString}` : '';
      const urlHash = hash ? hash : '';
      const url = `${pathname}${urlQueryString}${urlHash}`;

      // App Router uses different methods
      if (method === 'push') {
        router.push(url);
      } else {
        router.replace(url);
      }

      return Promise.resolve(true);
    },
  };
}

/**
 * Create an adapter for Next.js Pages Router (next/router)
 */
function createPagesRouterAdapter(router: NextRouter): RouterAdapter {
  return {
    type: 'pages',
    isReady: router.isReady === true,

    getCurrentPath(): string {
      return router.asPath || '/';
    },

    updateUrl(
      method: 'push' | 'replace',
      params: NonNullableUrlParams,
      pathname: string,
      hash: string,
      shallow: boolean
    ): Promise<boolean> {
      const queryString = stringifyUrlParams(params);
      const urlQueryString = queryString ? `?${queryString}` : '';
      const urlHash = hash ? hash : '';
      const url = `${pathname}${urlQueryString}${urlHash}`;

      return router[method](url, undefined, { shallow });
    },
  };
}

/**
 * Create a fallback adapter that uses the History API
 * Used when no Next.js router is available (SSR, testing, etc.)
 */
function createFallbackAdapter(): RouterAdapter {
  return {
    type: 'fallback',
    isReady: typeof window !== 'undefined',

    getCurrentPath(): string {
      if (typeof window === 'undefined') {
        return '/';
      }
      return window.location.pathname + window.location.search + window.location.hash;
    },

    updateUrl(
      method: 'push' | 'replace',
      params: NonNullableUrlParams,
      pathname: string,
      hash: string,
      _shallow: boolean // Not used in fallback adapter
    ): Promise<boolean> {
      if (typeof window === 'undefined') {
        return Promise.resolve(false);
      }

      const queryString = stringifyUrlParams(params);
      const urlQueryString = queryString ? `?${queryString}` : '';
      const urlHash = hash ? hash : '';
      const url = `${pathname}${urlQueryString}${urlHash}`;

      const historyMethod = method === 'push' ? 'pushState' : 'replaceState';
      window.history[historyMethod]({}, '', url);

      return Promise.resolve(true);
    },
  };
}

/**
 * Convert a NonNullableUrlParams object to a query string
 */
function stringifyUrlParams(params: NonNullableUrlParams): string {
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
}

