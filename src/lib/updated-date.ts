// "Updated" date on the letter section: always two months and 7 days before today.
const MONTHS_BACK = 2;
const DAYS_BACK = 7;

// Clamp the day so Apr 30 becomes Feb 28, not Mar 2.
function monthsBack(date: Date, months: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth() - months, 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(date.getDate(), lastDay));
  return result;
}

export function formatUpdatedDate(locale: string, today: Date = new Date()): string {
  const date = monthsBack(today, MONTHS_BACK);
  date.setDate(date.getDate() - DAYS_BACK);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
