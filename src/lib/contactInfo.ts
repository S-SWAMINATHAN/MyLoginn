/** Single source of truth for MyLoginn contact details (used by the contact page and footer). */

export const CONTACT_EMAIL = "mailloginn@gmail.com";

export const CONTACT_PHONES = [
  { display: "96555 60555", tel: "+919655560555" },
  { display: "8489 202020", tel: "+918489202020" },
  { display: "63817 21061", tel: "+916381721061" },
] as const;

/** Primary line, also used for WhatsApp. */
export const WHATSAPP_PHONE = "+919655560555";

export const CONTACT_HOURS = "Mon–Sat, 9am–7pm IST";
