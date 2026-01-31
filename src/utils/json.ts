export const isJsonString = (str: string): boolean => {
  const trimmed = str.trim();
  return (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  );
};

export const tryFormatJson = (str: string): string => {
  if (!isJsonString(str)) return str;
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
};
