export const formatPercent = (value: number | null, decimals = 1): string => {
  if (value === null) return "-";
  return `${(value * 100).toFixed(decimals)}%`;
};
