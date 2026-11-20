import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/store/product-card";
import { Reveal } from "@/components/store/reveal";
import { cn } from "@/lib/utils";

type LojaSearch = { categoria?: string };

export const Route = createFileRoute("/loja")({
  validateSearch: (search: Record<string, unknown>): LojaSearch => {
    const c = search["categoria"];
    return typeof c === "string" && /^[a-z0-9-]{1,60}$/.test(c) ? { categoria: c } : {};
  },
  head: () => ({
    meta: [
      { title: "Loja GameLandia — Consoles, jogos, controles e retrô" },
      {
        name: "description",
        content: "Veja todos os produtos da GameLandia e monte seu carrinho para pedir pelo WhatsApp.",
      },
      { property: "og:title", content: "Loja GameLandia — Vitrine completa" },
      {
        property: "og:description",
        content: "Consoles, jogos, controles, acessórios e retrô em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LojaPage,
});

function LojaPage() {
  const { categoria: requested } = Route.useSearch();
  const [query, setQuery] = useState("");

  const { products: catalog, categories } = getRouteApi("__root__").useLoaderData();
  const categoria = categories.find(({ id }) => id === requested)?.id;
  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter(
      (p) => (!categoria || p.category === categoria) && (!q || p.name.toLowerCase().includes(q)),
    );
  }, [catalog, categoria, query]);

  const chip =
    "rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:border-primary";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-36 sm:px-6">
      <div className="enter-up">
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-accent">Vitrine</p>
        <h1 className="mt-2 font-display text-5xl font-bold uppercase sm:text-6xl">
          Loja <span className="text-primary">GameLandia</span>
        </h1>
      </div>

      <div className="enter-up mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" style={{ animationDelay: "120ms" }}>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/loja"
            search={{}}
            className={cn(chip, !categoria ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to="/loja"
              search={{ categoria: cat.id }}
              className={cn(
                chip,
                categoria === cat.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              {cat.label}
            </Link>
          ))}
        </div>
        <label className="relative block w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto..."
            aria-label="Buscar produto"
            className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">Nenhum produto encontrado.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={`${categoria ?? "all"}-${p.id}`} delay={(i % 4) * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
