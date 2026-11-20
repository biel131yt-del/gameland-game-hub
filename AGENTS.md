## Project rules
- Store catalog reads active products from Neon on the server (prices in integer cents) — checkout builds a wa.me link in `src/lib/cart.ts`. Why: user wants a simple store whose orders go to WhatsApp.
- Store contact details (WhatsApp, Instagram) come only from `src/lib/store-config.ts`. Why: one place to change them.
