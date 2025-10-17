export const getDynamicWidth = (value: string, placeholder?: string): string => {
  const length = value?.length || placeholder?.length || 1;
  return `${Math.max(length + 3, 4)}ch`;
};