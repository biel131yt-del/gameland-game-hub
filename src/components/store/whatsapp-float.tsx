import { MessageCircle } from "lucide-react";

import { STORE } from "@/lib/store-config";

export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent("Olá, Gameland! Vim pelo site.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Conversar no WhatsApp"
      className="animate-float fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-glow-whatsapp transition-transform hover:scale-110"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
