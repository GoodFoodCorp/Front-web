/** Formats a Date as a local (not UTC) `YYYY-MM-DD` string. */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function todayISODate(): string {
  return toISODate(new Date());
}
