export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(value) {
  return String(value).padStart(2, "0");
}

export function localTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function localParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type)?.value;
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

export function localISODate(date = new Date()) {
  const { year, month, day } = localParts(date);
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function localClock(date = new Date()) {
  const { hour, minute } = localParts(date);
  return `${pad(hour)}:${pad(minute)}`;
}

export function formatDate(isoDate, options = {}) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: options.weekday ?? "long",
    day: "numeric",
    month: options.month ?? "long",
    year: options.year ?? "numeric",
  }).format(utc);
}

export function weekdayIndexFromISO(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utcDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return utcDay === 0 ? 6 : utcDay - 1;
}

export function weekdayLabel(isoDate) {
  return WEEK_DAYS[weekdayIndexFromISO(isoDate)];
}

export function addDaysISO(isoDate, days) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function mondayOfWeek(isoDate) {
  return addDaysISO(isoDate, -weekdayIndexFromISO(isoDate));
}

export function weekDatesFromMonday(mondayISO) {
  return Array.from({ length: 7 }, (_, index) => addDaysISO(mondayISO, index));
}

export function weekDatesContaining(isoDate) {
  return weekDatesFromMonday(mondayOfWeek(isoDate));
}

export function monthGrid(year, month) {
  const firstISO = `${year}-${pad(month)}-01`;
  const start = mondayOfWeek(firstISO);
  return Array.from({ length: 42 }, (_, index) => {
    const iso = addDaysISO(start, index);
    const [isoYear, isoMonth] = iso.split("-").map(Number);
    return {
      iso,
      inMonth: isoYear === year && isoMonth === month,
      weekday: weekdayLabel(iso),
    };
  });
}

export function daysBetween(a, b) {
  const first = new Date(`${a}T00:00:00Z`);
  const second = new Date(`${b}T00:00:00Z`);
  return Math.round((second - first) / 86400000);
}

export function isSameWeek(a, b) {
  return mondayOfWeek(a) === mondayOfWeek(b);
}
