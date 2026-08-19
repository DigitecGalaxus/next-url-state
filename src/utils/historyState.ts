/** Shape of the bookkeeping Next.js keeps on `window.history.state`. */
type NextHistoryState = {
  /** Set by the App Router on every entry it owns */
  __NA?: boolean;
  /** Set by the Pages Router on every entry it owns */
  __N?: boolean;
} | null;

/**
 * Returns the state object to hand to `history.pushState`/`history.replaceState`
 * when the URL is written directly instead of through a Next.js router.
 *
 * Both routers keep bookkeeping on `history.state`, but they need opposite
 * treatment:
 *
 * - **Pages Router** marks its entries with `__N` (plus `key`/`idx`). Its
 *   `onPopState` handler silently early-returns on entries where `__N` is
 *   absent, so replacing the state would freeze back navigation in hosts that
 *   drive the native history stack (e.g. iOS/Android webviews). The existing
 *   state has to be forwarded as-is.
 *
 * - **App Router** marks its entries with `__NA` and patches
 *   `pushState`/`replaceState` so external URL writes stay in sync with
 *   `usePathname()`/`useSearchParams()`. That patch bails out early when the
 *   passed state already carries `__NA`, assuming Next.js itself made the call.
 *   Forwarding the state would therefore skip the sync: the address bar
 *   changes, but the router's `canonicalUrl` keeps the old query and its
 *   `HistoryUpdater` effect writes that stale URL straight back on the next
 *   commit. Passing `null` lets the patch copy `__NA` and the internal tree
 *   over itself *and* dispatch the router sync.
 */
export const getHistoryStateToForward = (): unknown => {
  const state = window.history.state as NextHistoryState;
  return state?.__NA ? null : state;
};
