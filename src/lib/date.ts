import { format, formatDistanceToNowStrict } from "date-fns";

export function fmtDate(value?: Date | string | null) {
  if (!value) return "-";
  return format(new Date(value), "MMM d, yyyy");
}

export function relative(value?: Date | string | null) {
  if (!value) return "-";
  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}
