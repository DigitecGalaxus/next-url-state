import { useRouter } from "next/router";
import { type RefObject } from "react";
import { parseUrlWithImplicitDomain } from "./utils/urlParsing";
import {
  type NonNullableUrlParams,
  type UrlParams,
} from "./utils/parseUrl";

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
  latestRouterPathRef: RefObject<string>,
  options?: UpdateRouterOptions,
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
  const router = useRouter();
  return (
    routerMethod: "push" | "replace",
    params: NonNullableUrlParams,
    latestRouterPathRef: RefObject<string>,
    options: UpdateRouterOptions = {},
  ): Promise<boolean> => {
    const { pathname, hash } = parseUrlWithImplicitDomain(
      latestRouterPathRef.current,
    );

    const queryString = stringifyUrlParams(params);

    const urlQueryString = queryString ? `?${queryString}` : "";
    const urlHash = hash ? `${hash}` : "";

    const url = `${pathname}${urlQueryString}${urlHash}`;
    // execute the router method with the new params
    return router[routerMethod](url, undefined, {
      shallow: options.shallow === undefined || options.shallow,
    });
  };
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
