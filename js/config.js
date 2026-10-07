/* Blend and Brew — shop details.

   Fill these in and the matching bits appear on the site: the "Find us" column
   in the footer, social links, and the order slip's WhatsApp button sending
   straight to the shop. Anything left as "" (or an empty list) stays hidden —
   nothing placeholder-ish is ever shown to customers. */
window.BNB_CONFIG = {
  // Digits only, international format, no "+" — e.g. "27821234567".
  // Empty: the slip's WhatsApp button lets the customer pick who to send to.
  whatsapp: "",

  instagram: "",   // handle without the @, e.g. "blendandbrew"
  facebook: "",    // full page URL
  tiktok: "",      // handle without the @

  address: "",     // e.g. "Shop 4, The Square, Main Road"
  mapUrl: "",      // a Google Maps share link

  // One row per line, e.g. ["Mon – Fri", "07:30 – 17:00"]
  hours: [],
};
