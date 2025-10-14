import { useRouter } from "next/router";
import {
  createContext,
  type ReactNode,
  useEffect,
  useRef,
  useTransition,
} from "react";
import { useUpdateSearchParams } from "./useUpdateSearchParams";
import {
  getUrlParams,
  type NonNullableUrlParams,
  type UrlParam,
} from "./utils/parseUrl";

type UpdateParamsCallback = (value: UrlParam) => void;

type UpdateCallback = (
  value: NonNullableUrlParams,
  changedKeys: Set<string>,
) => void;

export interface UrlChangeOptions {
  /**
   * Shallow routing allows you to change the URL without running data fetching methods again,
   * that includes getServerSideProps, getStaticProps, and getInitialProps.
   *
   * `true` by default
   */
  shallow?: boolean;
  /**
   * Create a history entry
   *
   * `false` by default
   */
  historyEntry?: boolean;
}

export interface UrlParamsContextValue {
  addParamCallback: (
    name: string,
    callback: UpdateParamsCallback,
  ) => () => void;
  addParamsCallback: (callback: UpdateCallback) => () => void;
  /**
   * Set a single url param
   */
  setUrlParams: (
    params: Record<string, UrlParam>,
    options?: UrlChangeOptions,
  ) => void;
  /**
   * Set multiple url params
   */
  setUrlParam: (
    name: string,
    value: UrlParam,
    options?: UrlChangeOptions,
  ) => void;
  /**
   * Returns the diff between the current and the new url params
   * e.g.: `const [newParams, changedKeys] = diffUrlParams({ name: "Alex" })`
   */
  diffUrlParams: (
    newParams: Record<string, UrlParam>,
  ) => [Readonly<NonNullableUrlParams>, string[]];
  /** Internal function which is called once router changes */
  updateHookStates: () => void;
  /**
   * Internal syncronous state for all useParam hooks
   * and state diffing.
   * The values are readonly to allow reference comparison
   */
  urlParams: {
    /**
     * The url param which includes the latest state updates
     * and is used for immediate ui updates
     */
    sync: Readonly<NonNullableUrlParams>;
    /**
     * The url param which updates slower but is always
     * reflecting the nextjs router state
     */
    async: Readonly<NonNullableUrlParams>;
  };
}

export const UrlParamsContext = createContext<UrlParamsContextValue>(
  null as unknown as UrlParamsContextValue,
);
UrlParamsContext.displayName = "UrlParamsContext";

export const UrlParamsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const routerPath = useRouter().asPath;
  const [, startTransition] = useTransition();
  const updateSearchParams = useUpdateSearchParams();
  const currentRouterPathRef = useRef(routerPath);

  const contextValue = useLazyRef<UrlParamsContextValue>(() => {
    /** Internal state of last history entry */
    let lastHistoryEntry = 0;
    /** Keeps the write history state when multiple transitions are merged together */
    let writeHistory: boolean | undefined;
    /** Keeps the shallow state when multiple transitions are merged together */
    let shallow: undefined | boolean;
    const urlParamCallbacks = new Map<string, Set<UpdateParamsCallback>>();
    const urlParamsCallbacks = new Set<UpdateCallback>();
    const uncalledParams = new Set<string>();
    const initialUrlParms = getUrlParams(routerPath);
    const urlParams = {
      async: initialUrlParms,
      sync: initialUrlParms,
    };
    /** Handlers to resolve the setUrlParam promise - Set<[resolve, reject]> */
    const routeChangeCompleteHandler = new Set<
      [() => void, (err: unknown) => void]
    >();

    const api: UrlParamsContextValue = {
      urlParams,

      addParamCallback: (name, callback) => {
        let callbacks = urlParamCallbacks.get(name);
        if (!callbacks) {
          callbacks = new Set();
          urlParamCallbacks.set(name, callbacks);
        }
        callbacks.add(callback);
        return () => {
          callbacks.delete(callback);
        };
      },

      addParamsCallback: (callback) => {
        urlParamsCallbacks.add(callback);
        return () => {
          urlParamsCallbacks.delete(callback);
        };
      },

      diffUrlParams: (newParams) => {
        const currentParams = urlParams.sync;
        const changedKeys: string[] = [];
        const newUrlParams: NonNullableUrlParams = {};
        if (newParams === currentParams) {
          return [currentParams, changedKeys];
        }
        // Look for deleted params
        Object.keys(currentParams)
          .filter((key) => newParams[key] === undefined)
          .forEach((key) => {
            changedKeys.push(key);
          });
        // Compare params and new params
        Object.entries(newParams).forEach(([name, newValue]) => {
          // Skip for same string or same string array
          if (currentParams[name] === newValue) {
            newUrlParams[name] = newValue;
          } else if (Array.isArray(newValue)) {
            if (
              !Array.isArray(currentParams[name]) ||
              currentParams[name].length !== newValue.length ||
              currentParams[name].some((v, i) => v !== newValue[i])
            ) {
              changedKeys.push(name);
            }
            if (newValue.length) {
              newUrlParams[name] = newValue;
            }
          }
          // New Value is not an array and not equal to the previous value
          else if (newValue !== undefined) {
            newUrlParams[name] = newValue;
            changedKeys.push(name);
          }
        });
        changedKeys.forEach((name) => {
          uncalledParams.add(name);
        });
        return [
          // Return the previous state if nothing has changed to keep the same object reference
          changedKeys.length ? newUrlParams : currentParams,
          changedKeys,
        ];
      },

      updateHookStates: () => {
        const latestState = urlParams.sync;
        // Notify all callbacks (the registered hooks)
        uncalledParams.forEach((name) => {
          urlParamCallbacks
            .get(name)
            ?.forEach((callback) => callback(latestState[name]));
        });

        urlParamsCallbacks.forEach((callback) =>
          callback(latestState, uncalledParams),
        );

        uncalledParams.clear();
      },

      setUrlParam: (name, value, options) => {
        if (urlParams.sync[name] === value) {
          return;
        }
        return api.setUrlParams({ [name]: value }, options);
      },

      setUrlParams: (params, { historyEntry, ...options } = {}) => {
        const [newSyncUrlParams, changes] = api.diffUrlParams({
          ...urlParams.sync,
          ...params,
        });
        if (changes.length === 0) {
          return;
        }
        urlParams.sync = newSyncUrlParams;
        // Notify all callbacks (the registred hooks)
        api.updateHookStates();
        // Prevent multiple history entries for the same user action
        writeHistory ||= historyEntry && Date.now() - lastHistoryEntry > 250;
        if (writeHistory) {
          lastHistoryEntry = Date.now();
        }
        // Shallow routing is enabled by default
        // store the flag until the next successful transition
        if (options.shallow === false) {
          shallow = false;
        }

        return new Promise<void>((...promiseHandler) => {
          // Store the promise handler to call it after the next uncanceled transition
          routeChangeCompleteHandler.add(promiseHandler);
          startTransition(() => {
            // If the url params have not changed in the meantime
            // update the url
            if (newSyncUrlParams === urlParams.sync) {
              const urlChangePromise = updateSearchParams(
                writeHistory ? "push" : "replace",
                newSyncUrlParams,
                currentRouterPathRef,
                {
                  shallow,
                },
              );
              routeChangeCompleteHandler.forEach((promiseHandler) =>
                urlChangePromise.then(...promiseHandler),
              );
              routeChangeCompleteHandler.clear();
              shallow = true;
              writeHistory = false;
            }
          });
        });
      },
    };

    return api;
  });

  // Update the internal states before the context children render
  if (currentRouterPathRef.current !== routerPath) {
    currentRouterPathRef.current = routerPath;
    const [newUrlParams] = contextValue.diffUrlParams(getUrlParams(routerPath));
    // Update the internal states
    contextValue.urlParams.sync = newUrlParams;
    contextValue.urlParams.async = newUrlParams;
  }

  // Callbacks must not be fired during rendering but inside an effect
  // this effect is triggered initialy and on browser back/forward or link clicks
  useEffect(() => {
    contextValue.updateHookStates();
  }, [routerPath]);

  return (
    <UrlParamsContext.Provider value={contextValue}>
      {children}
    </UrlParamsContext.Provider>
  );
};

/**
 * Helper to initialize a value only once
 */
const useLazyRef = <T,>(initializer: () => T): T => {
  const ref = useRef<T | undefined>(undefined);
  if (ref.current === undefined) {
    ref.current = initializer();
  }
  return ref.current;
};
