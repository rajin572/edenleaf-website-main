import dayjs from "dayjs";
import { INTL_LOCALES, type Locale } from "@/i18n/config";

/**
 * Storefront-facing dates. Goes through `Intl` so Bengali renders its own digits
 * and month names (CODING_RULES §2.6); the dayjs helpers below are fixed-format
 * and stay for the dashboard-style screens that already use them.
 */
export const formatDateForLocale = (
  date: string | Date,
  locale: Locale
): string =>
  new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));

export const formatDateTime = (date: string | Date | undefined): string => {
  // date is less than 1min ago, return "just now"
  // date is less than 1 hour ago, return "x minutes ago"
  // date is less than 1 day ago, return "HH:mm"
  // date is greater than 1 day ago, return "DD / MM / YYYY"
  const now = dayjs();
  const messageDate = dayjs(date);

  if (now.diff(messageDate, "minute") < 1) return "just now";
  if (now.diff(messageDate, "hour") < 1)
    return `${now.diff(messageDate, "minute")} minutes ago`;
  if (now.diff(messageDate, "day") < 1) return messageDate.format("HH:mm");
  return messageDate.format("DD - MMM - YYYY"); // Fixed: used "DD / MM / YYYY"
};

export const formatDate = (date: string | Date | undefined): string => {
  const messageDate = dayjs(date);

  return messageDate.format("DD / MM / YYYY"); // Fixed: used "DD / MM / YYYY"
};

export const formetDateAndTime = (date: string | Date | undefined): string => {
  const messageDate = dayjs(date);

  return messageDate.format("DD / MM / YYYY HH:mm"); // Fixed: used "DD / MM / YYYY"
};

export const formetTime = (date: string | Date | undefined): string => {
  const messageDate = dayjs(date);

  return messageDate.format("HH:mm"); // 24-hour format
};
