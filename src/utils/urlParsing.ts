export type ParsedUrlWithImplicitDomain = Pick<
  URL,
  "pathname" | "search" | "searchParams" | "hash"
>;

/**
 * Parses a url with implicit domain name and returns a subset of the native URL object
 * @param {string} url the url you want to parse
 * @returns {ParsedUrlWithImplicitDomain}
 */
export const parseUrlWithImplicitDomain = (
  url: string,
): ParsedUrlWithImplicitDomain => {
  const nativeUrl = new URL(url, "https://domain.tld");
  return {
    pathname: nativeUrl.pathname,
    search: nativeUrl.search,
    searchParams: nativeUrl.searchParams,
    hash: nativeUrl.hash,
  };
};
