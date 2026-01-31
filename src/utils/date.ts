import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export const formatRelativeTime = (date: string | Date): string => {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(targetDate, { addSuffix: true, locale: ko });
};
