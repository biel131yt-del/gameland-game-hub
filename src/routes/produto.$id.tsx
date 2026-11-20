import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useCart } from "@/components/store/cart-provider";
import { ProductCard } from "@/components/store/product-card";
import { Reveal } from "@/components/store/reveal";
import { formatBRL } from "@/lib/cart";
import { categoryLabel, getProduct, PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/produto/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — Gameland` : "Produto — Gameland";
    const description = p ? `${p.description} Por ${formatBRL(p.price)}.` : "Produto da Gameland.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-32 text-center">
      <h1 className="font-display text-3xl font-bold uppercase">Produto não encontrado</h1>
      <Link to="/loja" className="mt-6 inline-block font-semibold text-primary">
        Voltar para a loja
      </Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6">
      <Link to="/loja" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar para a loja
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="enter-up relative overflow-hidden rounded-2xl border border-border bg-card">
          <img
            src={product.image}
            alt={product.name}
            width={1254}
            height={1254}
            className="aspect-square size-full object-cover transition-transform duration-700 hover:scale-105"
          />
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-sm bg-primary px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-primary-foreground">
              {product.badge}
            </span>
          )}
        </div>

        <div className="enter-up flex flex-col" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {categoryLabel(product.category)} · {product.condition}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-tight sm:text-5xl">
            {product.name}
          </h1>
          <div className="mt-5 flex items-end gap-3">
            <p className="font-display text-4xl font-bold text-primary">{formatBRL(product.price)}</p>
            {product.oldPrice && (
              <p className="pb-1 text-lg text-muted-foreground line-through">{formatBRL(product.oldPrice)}</p>
            )}
          </div>
          <p className="mt-6 text-lg text-muted-foreground">{product.description}</p>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {product.specs.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm">
                <Check className="size-4 text-primary" /> {s}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center rounded-lg border border-border">
              <button
                type="button"
                aria-label="Diminuir quantidade"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-full w-11 place-items-center hover:text-primary"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button
                type="button"
                aria-label="Aumentar quantidade"
                onClick={() => setQty((q) => q + 1)}
                className="grid h-full w-11 place-items-center hover:text-primary"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                add(product, qty);
                toast.success(`${qty}x ${product.name} no carrinho!`);
              }}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-primary px-5 font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <ShoppingBag className="size-4" /> Adicionar ao carrinho
            </button>
            <button
              type="button"
              onClick={() => {
                add(product, qty);
                setOpen(true);
              }}
              className="inline-flex h-12 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-5 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
            >
              Comprar agora
            </button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            O pedido é finalizado pelo WhatsApp: combinamos pagamento, entrega ou retirada por lá.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <h2 className="font-display text-3xl font-bold uppercase">Você também pode curtir</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 100}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
