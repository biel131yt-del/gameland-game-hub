import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { formatBRL } from "@/lib/cart";
import { categoryLabel, type Product } from "@/lib/products";

import { useCart } from "./cart-provider";

export function ProductCard({ product }: { product: Product }) {
  const { add, setOpen } = useCart();

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow">
      <Link
        to="/produto/$id"
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={product.image || "/products/games-stack.jpg"}
          alt={product.name}
          loading="lazy"
          width={600}
          height={600}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.badge && (
            <span className="rounded-sm bg-primary px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
              {product.badge}
            </span>
          )}
          <span className="rounded-sm bg-background/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
            {product.condition}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          {product.categoryLabel ?? categoryLabel(product.category)}
        </p>
        <Link to="/produto/$id" params={{ id: product.id }} className="mt-1">
          <h3 className="font-display text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {product.oldPrice && (
              <p className="text-xs text-muted-foreground line-through">
                {formatBRL(product.oldPrice)}
              </p>
            )}
            <p className="font-display text-xl font-bold">{formatBRL(product.price)}</p>
          </div>
          {product.stock <= 0 ? <span className="text-sm font-medium text-muted-foreground">Esgotado</span> : <button
            type="button"
            aria-label={`Adicionar ${product.name} ao carrinho`}
            onClick={() => {
              add(product);
              toast.success(`${product.name} no carrinho!`, {
                action: { label: "Ver carrinho", onClick: () => setOpen(true) },
              });
            }}
            className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-all hover:scale-110 hover:rotate-90 active:scale-95"
          >
            <Plus className="size-5" />
          </button>}
        </div>
      </div>
    </article>
  );
}
