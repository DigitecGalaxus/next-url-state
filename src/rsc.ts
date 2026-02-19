// This file is intentionally NOT marked 'use client'.
// It is the only entry point safe to import from React Server Components.
import type { RouterAdapter } from "./routerAdapters";

export type { RouterAdapter };

/**
 * Creates a read-only {@link RouterAdapter} for use in React Server Components.
 *
 * Since URL updates require client-side JavaScript, `updateUrl()` is a no-op
 * that returns `false`. For URL mutations, pass data down to a Client Component.
 *
 * Import from `next-url-state/rsc` to avoid pulling in the `"use client"` bundle:
 *
 * @example
 * ```tsx
 * // app/products/page.tsx (Server Component)
 * import { createRscAdapter } from 'next-url-state/rsc';
 *
 * export default async function ProductsPage({ searchParams }: PageProps) {
 *   const params = await searchParams;
 *   const adapter = createRscAdapter(
 *     '/products',
 *     new URLSearchParams(params as Record<string, string>)
 *   );
 *   const currentPath = adapter.getCurrentPath();
 *   // → "/products?category=electronics&sort=price"
 * }
 * ```
 */
export function createRscAdapter(
  pathname: string,
  searchParams: URLSearchParams
): RouterAdapter {
  return {
    type: 'rsc',
    isReady: true,

    getCurrentPath(): string {
      const search = searchParams.toString();
      return `${pathname}${search ? `?${search}` : ''}`;
    },

    updateUrl(): Promise<boolean> {
      // No-op: URL updates are not possible in Server Components
      if (process.env.NODE_ENV === 'development') {
        console.warn('[next-url-state] updateUrl is not available in Server Components');
      }
      return Promise.resolve(false);
    },
  };
}
