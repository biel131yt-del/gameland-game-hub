import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle } from "lucide-react";

import { STORE } from "@/lib/store-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold uppercase tracking-wider">
            Game<span className="text-primary">land</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Consoles, jogos, controles e relíquias retrô. Escolha, monte seu carrinho e finalize
            pelo WhatsApp.
          </p>
        </div>
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
            Navegue
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Início</Link></li>
            <li><Link to="/loja" className="hover:text-foreground">Loja completa</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
            Fale com a gente
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <a
                href={`https://wa.me/${STORE.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <MessageCircle className="size-4" /> {STORE.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={STORE.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Instagram className="size-4" /> {STORE.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Gameland. Todos os direitos reservados.
      </p>
    </footer>
  );
}
