// "Сьогодні" у польському часовому поясі як "YYYY-MM-DD".
// Потрібно, бо сервер (Vercel) працює в UTC.
export function todayWarsaw(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
  }).format(new Date());
}
