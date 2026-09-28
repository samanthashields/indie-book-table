/** App-wide date display format: MM/DD/YYYY. Use these instead of ad hoc toLocaleDateString calls. */

const toDate = (value: string | Date): Date => (typeof value === "string" ? new Date(value.includes("T") ? value : `${value}T00:00:00`) : value);

export function formatDateMDY(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${date.getFullYear()}`;
}

/** MM/DD/YYYY plus a time, for activity/comment timestamps. */
export function formatDateTimeMDY(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "";
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${formatDateMDY(date)}, ${time}`;
}

export function formatDateRangeMDY(start: string | Date, end: string | Date | null): string {
  const startLabel = formatDateMDY(start);
  if (!end) return `From ${startLabel}, ongoing`;
  return `${startLabel} – ${formatDateMDY(end)}`;
}
