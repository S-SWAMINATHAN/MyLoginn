/** Single source of truth for MyLoginn contact details (used by the contact page and footer). */

export const CONTACT_EMAIL = "contact@myloginn.com";

export const CONTACT_PHONES = [
  { display: "96555 60555", tel: "+919655560555" },
  { display: "8489 202020", tel: "+918489202020" },
] as const;

/** Primary line, also used for WhatsApp. */
export const WHATSAPP_PHONE = "+919655560555";

export const CONTACT_HOURS = "Mon–Sat, 9am–7pm IST";

/** Official social profiles. Add a profile here only once it exists; the footer and Organization schema both read this list. */
export const SOCIAL_LINKS = [
  { id: "instagram", label: "MyLoginn on Instagram", href: "https://www.instagram.com/myloginntech/" },
  { id: "facebook", label: "MyLoginn on Facebook", href: "https://www.facebook.com/p/MyLoginn-Tech-61592248317142/" },
  // TODO: replace these two placeholder links with MyLoginn's real profile URLs, then remove `pending`.
  // While `pending` is set they appear in the footer but are left out of the Organization structured data.
  { id: "linkedin", label: "MyLoginn on LinkedIn", href: "https://www.linkedin.com/", pending: true },
  { id: "youtube", label: "MyLoginn on YouTube", href: "https://www.youtube.com/", pending: true },
] as const;
