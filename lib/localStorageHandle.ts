// LocalStorage
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

// ─── Named keys (independent persisted features) ────────────────────────────

/** Persisted active-branch snapshot (`BranchSlice`). */
export const ACTIVE_BRANCH_STORAGE_KEY = "restora.activeBranch";

export const setNamedStorage = (key: string, item: string) => {
  return localStorage.setItem(key, item);
};
export const getNamedStorage = (key: string) => {
  return localStorage.getItem(key);
};
export const removeNamedStorage = (key: string) => {
  return localStorage.removeItem(key);
};