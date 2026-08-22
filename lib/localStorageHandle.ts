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