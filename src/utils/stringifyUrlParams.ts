import { UrlParams } from "./parseUrl";

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