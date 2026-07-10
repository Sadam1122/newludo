const JAKARTA_TIME_ZONE = "Asia/Jakarta";

/**
 * Formats a date/time for display in Indonesia/Jakarta (WIB) time,
 * regardless of the server process's own system timezone. Without an
 * explicit `timeZone`, `toLocaleString` falls back to the host's local
 * timezone — fine on a dev machine already set to WIB, but silently wrong
 * (off by up to several hours) on a production server running in UTC.
 */
export function formatJakartaDateTime(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
) {
  const formatted = new Date(date).toLocaleString("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  });
  return `${formatted} WIB`;
}

/**
 * YYYY-MM-DD in Jakarta time — for filenames/exports. Plain
 * `toISOString().split("T")[0]` is UTC-based, so anything exported between
 * 00:00-06:59 WIB would land on the previous day's date since UTC is 7
 * hours behind Jakarta.
 */
export function formatJakartaDateStamp(date: Date | string = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}
