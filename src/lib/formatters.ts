const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatDateTime = (date: Date) => DATE_TIME_FORMATTER.format(date);
