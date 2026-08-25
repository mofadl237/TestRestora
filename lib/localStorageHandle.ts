// ─── LocalStorage (cart — persistent) ────────────────────────────────────────
export const variableLocalStorage = "itemsOrder";
export const setLocalStorage = (item: string) => {
  return localStorage.setItem(variableLocalStorage, item);
};
export const getLocalStorage = () => {
  return localStorage.getItem(variableLocalStorage);
};
export const removeLocalStorage = () => {
  return localStorage.removeItem(variableLocalStorage);
};
export const clearLocalStorage = () => {
  return localStorage.clear();
};

// ─── Named keys (localStorage — persistent) ─────────────────────────────────

export const setNamedStorage = (key: string, item: string) => {
  return localStorage.setItem(key, item);
};
export const getNamedStorage = (key: string) => {
  return localStorage.getItem(key);
};
export const removeNamedStorage = (key: string) => {
  return localStorage.removeItem(key);
};

// ─── SessionStorage (branch selection — per-session only) ────────────────────
//
// Branch selection is persisted to sessionStorage so it survives page
// refreshes within a single browsing session but is discarded when the
// tab/window is closed. This prevents stale branch selections from
// persisting across sessions when a customer physically moves.

const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTORA_RESTAURANT_ID ?? "";

/**
 * Restaurant-scoped sessionStorage key for branch selection.
 * Format: `restora.pub.branch.{restaurantId}`
 * Prevents cross-restaurant collisions in the same browser tab.
 */
export function getBranchStorageKey(): string {
  return `restora.pub.branch.${RESTAURANT_ID}`;
}

export const setSessionStorage = (key: string, item: string) => {
  return sessionStorage.setItem(key, item);
};
export const getSessionStorage = (key: string) => {
  return sessionStorage.getItem(key);
};
export const removeSessionStorage = (key: string) => {
  return sessionStorage.removeItem(key);
};
