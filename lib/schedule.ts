const JAKARTA_TIME_ZONE = "Asia/Jakarta";

export function getJakartaStartOfToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return new Date(`${parts}T00:00:00+07:00`);
}

export function isUpcomingOrUndated(value?: Date | string | null) {
  if (!value) return true;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return true;

  return date >= getJakartaStartOfToday();
}

export function compareScheduleAsc<T extends { scheduledAt?: Date | null }>(
  first: T,
  second: T,
) {
  const firstTime = first.scheduledAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const secondTime = second.scheduledAt?.getTime() ?? Number.MAX_SAFE_INTEGER;

  if (firstTime !== secondTime) return firstTime - secondTime;
  return 0;
}
