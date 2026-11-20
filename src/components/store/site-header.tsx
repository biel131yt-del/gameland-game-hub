import { Link } from "@tanstack/react-router";
import { Gamepad2, Instagram, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

import { STORE } from "@/lib/store-config";
import { cn } from "@/lib/utils";

import { useCart } from "./cart-provider";

export function SiteHeader() {
  const { count, setOpen, bump } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "border-b border-border bg-background/85 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div
        className={cn(
          "overflow-hidden bg-primary text-primary-foreground transition-all duration-300",
          scrolled ? "max-h-0" : "max-h-10",
        )}
      >
        <p className="flex h-8 items-center justify-center gap-3 text-xs font-semibold uppercase tracking-wider sm:gap-6 sm:text-sm">
          <span><span aria-hidden>✈️</span> {STORE.shippingNote}</span>
          <span aria-hidden className="opacity-50">•</span>
          <span><span aria-hidden>📍</span> {STORE.city}-{STORE.state}</span>
        </p>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground transition-transform group-hover:rotate-12">
            <Gamepad2 className="size-5" />
          </span>
          <span className="font-display text-xl font-bold uppercase tracking-wider">
            Game<span className="text-primary">land</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary sm:block"
          >
            Início
          </Link>
          <Link
            to="/loja"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
          >
            Loja
          </Link>
          <a
            href={STORE.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram da Gameland"
            className="grid size-10 place-items-center rounded-md text-muted-foreground transition-colors hover:text-accent"
          >
            <Instagram className="size-5" />
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Abrir carrinho (${count} itens)`}
            className="relative grid size-10 place-items-center rounded-md border border-border bg-card transition-colors hover:border-primary hover:text-primary"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span
                key={bump}
                className="animate-cart-bump absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold leading-5 text-accent-foreground"
              >
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
