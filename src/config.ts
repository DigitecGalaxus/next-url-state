/**
 * Default configuration for next-url-state.
 *
 * These values can be adjusted to tune the library's behavior.
 */

/**
 * Minimum interval (ms) between URL updates that create separate browser
 * history entries. Rapid state changes within this window are coalesced
 * into a single history entry, preventing the back button from stepping
 * through every keystroke.
 *
 * @default 250
 */
export const HISTORY_DEBOUNCE_MS = 250;
