'use client';

import type { NextRouter } from "next/router";
import type { NonNullableUrlParams } from "./utils/parseUrl";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { stringifyUrlParams } from "./utils/stringifyUrlParams";

/**
 * Common router interface that abstracts both Pages Router and App Router
 */
export interface RouterAdapter {
  getCurrentPath(): string;
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
  type: 'pages' | 'app' | 'fallback' | 'rsc';
}

function detectRouterType(): 'app' | 'pages' | 'fallback' {
  if (typeof window !== 'undefined' && (window as unknown as { __NEXT_DATA__?: unknown }).__NEXT_DATA__) {
    return 'pages';
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nav = require('next/navigation');
    if (nav && typeof nav.usePathname === 'function') {
      return 'app';
    }
  } catch {
    // Expected in non-Next.js projects or Pages Router apps
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const router = require('next/router');
    if (router && typeof router.useRouter === 'function') {
      return 'pages';
    }
  } catch {
    // Expected in non-Next.js projects or App Router apps
  }

  return 'fallback';
}

// Detect router type once at module load
const DETECTED_ROUTER_TYPE = detectRouterType();

function useAppRouterAdapterInternal(): RouterAdapter {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { usePathname, useSearchParams, useRouter } = require('next/navigation');

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // App Router hooks work in both server and client contexts — no SSR guard needed
  return createAppRouterAdapter(pathname, searchParams, router);
}

function usePagesRouterAdapterInternal(): RouterAdapter {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useRouter } = require('next/router');
  const router = useRouter();

  if (typeof window === 'undefined' || !router) {
    return createFallbackAdapter();
  }

  return createPagesRouterAdapter(router);
}

/* hook for fallback adapter using History API */
function useFallbackAdapterInternal(): RouterAdapter {
  return createFallbackAdapter();
}

const useRouterAdapterImpl: () => RouterAdapter =
  DETECTED_ROUTER_TYPE === 'app' ? useAppRouterAdapterInternal :
  DETECTED_ROUTER_TYPE === 'pages' ? usePagesRouterAdapterInternal :
  useFallbackAdapterInternal;

/**
 * React hook that returns the correct {@link RouterAdapter} for the current
 * Next.js environment.
 *
 * Router detection runs once at module load time and is then cached, so
 * every call returns the same adapter type without re-detecting.
 *
 * Resolution order:
 * 1. **Pages Router** — if `window.__NEXT_DATA__` exists
 * 2. **App Router** — if `next/navigation` can be resolved
 * 3. **Fallback** — uses the History API directly (SSR, testing, non-Next.js)
 *
 * For explicit control, use {@link useAppRouterAdapter},
 * {@link usePagesRouterAdapter}, or {@link useFallbackAdapter} instead.
 */
export function useRouterAdapter(): RouterAdapter {
  return useRouterAdapterImpl();
}

export const useAppRouterAdapter = useAppRouterAdapterInternal;
export const usePagesRouterAdapter = usePagesRouterAdapterInternal;
export const useFallbackAdapter = useFallbackAdapterInternal;

/**
 * Creates a {@link RouterAdapter} for the Next.js App Router (`next/navigation`).
 *
 * Wraps the App Router's `push` and `replace` methods so they conform to
 * the shared RouterAdapter interface. Shallow routing is accepted but ignored,
 * since the App Router does not support it.
 *
 * @param pathname - Current pathname from `usePathname()`
 * @param searchParams - Current search params from `useSearchParams()`
 * @param router - App Router instance from `useRouter()`
 */
export function createAppRouterAdapter(
  pathname: string,
  searchParams: URLSearchParams,
  router: AppRouterInstance
): RouterAdapter {
  return {
    type: 'app',
    isReady: true,

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
      const url = `${pathname}${urlQueryString}${hash}`;

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
 * Creates a {@link RouterAdapter} for the Next.js Pages Router (`next/router`).
 *
 * Wraps the Pages Router's `push` and `replace` methods so they conform to
 * the shared RouterAdapter interface. Supports shallow routing, which is
 * enabled by default to avoid re-running data fetching methods.
 *
 * @param router - Pages Router instance from `useRouter()`
 */
export function createPagesRouterAdapter(router: NextRouter): RouterAdapter {
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
      const url = `${pathname}${urlQueryString}${hash}`;

      return router[method](url, undefined, { shallow });
    },
  };
}

/**
 * Create a fallback adapter that uses the History API
 * Used when no Next.js router is available (SSR, testing, etc.)
 */
export function createFallbackAdapter(): RouterAdapter {
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
      const url = `${pathname}${urlQueryString}${hash}`;

      const historyMethod = method === 'push' ? 'pushState' : 'replaceState';
      window.history[historyMethod]({}, '', url);

      return Promise.resolve(true);
    },
  };
}
