/** Converts a wall-clock time ("YYYY-MM-DDTHH:mm") in an IANA time zone to an absolute Date. */
export function zonedTimeToUtc(localDateTime: string, timeZone: string): Date {
  const [date, time] = localDateTime.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const offsetAt = (instant: number) => {
    const parts = Object.fromEntries(
      formatter.formatToParts(instant).map((p) => [p.type, Number(p.value)]),
    );
    const zonedAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    return zonedAsUtc - instant;
  };

  // Second pass corrects the offset when the first guess lands across a DST transition.
  const firstGuess = wallClockAsUtc - offsetAt(wallClockAsUtc);
  return new Date(wallClockAsUtc - offsetAt(firstGuess));
}

export function formatEventDate(localDateTime: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone }).format(
    zonedTimeToUtc(localDateTime, timeZone),
  );
}

export function formatEventTime(localDateTime: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(zonedTimeToUtc(localDateTime, timeZone));
}
