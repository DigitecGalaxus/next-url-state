/**
 * Represents an URL parameter value.
 *
 * A URL parameter can be:
 * - a string
 * - an array of strings (if the parameter appears multiple times)
 * - undefined (if the parameter is not present / removed)
 *
 * @example
 * const singleParam: UrlParam = "value";
 * const multipleParams: UrlParam = ["value1", "value2"];
 * const removedParam: UrlParam = undefined;
 */
export type UrlParam = string | string[] | undefined;

/**
 * Represents a collection of URL parameters.
 * The keys are parameter names and the values are URL parameter values.
 *
 * @example
 * const params: UrlParams = {
 *   param1: "value1",
 *   param2: ["value2", "value3"],
 *   param3: undefined
 * };
 */
export type UrlParams = Record<string, UrlParam>;

/**
 * Represents a non-nullable URL parameter value.
 *
 * A non-nullable URL parameter can be:
 * - a string
 * - an array of strings (if the parameter appears multiple times)
 *
 * This type excludes `undefined`.
 *
 * @example
 * const singleParam: NonNullableUrlParam = "value";
 * const multipleParams: NonNullableUrlParam = ["value1", "value2"];
 */
export type NonNullableUrlParam = Exclude<UrlParam, undefined>;

/**
 * Represents a collection of non-nullable URL parameters.
 *
 * The keys are parameter names and the values are non-nullable URL parameter values.
 *
 * @example
 * const params: NonNullableUrlParams = {
 *   param1: "value1",
 *   param2: ["value2", "value3"]
 * };
 */
export type NonNullableUrlParams = Record<string, NonNullableUrlParam>;

/**
 * Get search params from a router path (e.g. router.asPath)
 *
 * - Multiple occurrences of the same parameter result in a string[]
 * - Empty params result in empty strings
 *
 * @param path - The router path from which to extract the search params.
 * @returns An object representing the extracted search params.
 *
 * @example
 * ```ts
 * const params = getUrlParams(
 *   "/some/routes?a=1&a=2&b=3&c="
 * ) // -> { a: ["1", "2"], b: "3", c: "" }
 * ```
 */
export const getUrlParams = (path: string) =>
  [
    ...new URLSearchParams(
      path.split("?").slice(1).join("?").split("#")[0],
    ).entries(),
  ].reduce<NonNullableUrlParams>((acc, [name, value]) => {
    if (acc[name]) {
      const oldValue = acc[name];
      if (typeof oldValue === "string") {
        acc[name] = [oldValue, value];
      } else {
        oldValue.push(value);
      }
    } else {
      acc[name] = value;
    }
    return acc;
  }, {});
