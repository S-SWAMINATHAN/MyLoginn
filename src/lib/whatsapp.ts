import { parsePhoneNumberWithError } from "libphonenumber-js";

export function toWhatsAppLink(phone: string, message?: string) {
  try {
    const parsed = parsePhoneNumberWithError(phone);
    const digits = parsed.number.replace(/[^\d]/g, "");
    const text = message ? `?text=${encodeURIComponent(message)}` : "";
    return `https://wa.me/${digits}${text}`;
  } catch {
    return null;
  }
}

export function formatPhoneDisplay(phone: string) {
  try {
    const parsed = parsePhoneNumberWithError(phone);
    return parsed.formatInternational();
  } catch {
    return phone;
  }
}
