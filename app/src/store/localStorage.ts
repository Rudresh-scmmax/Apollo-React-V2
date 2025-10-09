export const loadState = (itemKey: string) => {
  try {
    const serializedState = localStorage.getItem(itemKey);
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("appState", serializedState);
  } catch (err) {
    // ignore write errors
  }
};
