import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, MessageCircle, Repeat, ShoppingCart, Sparkles } from "lucide-react";

import heroImage from "@/assets/hero-gaming.jpg";
import { LocationSection } from "@/components/store/location-section";
import { ProductCard } from "@/components/store/product-card";
import { Reveal } from "@/components/store/reveal";
import { STORE } from "@/lib/store-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GameLandia — Consoles, jogos e retrô com pedido no WhatsApp" },
      {
        name: "description",
        content:
          "Vitrine da GameLandia: PlayStation, Nintendo Switch, jogos, controles e clássicos retrô. Monte seu carrinho e finalize pelo WhatsApp.",
      },
      { property: "og:title", content: "GameLandia — Seu próximo nível começa aqui" },
      {
        property: "og:description",
        content: "Consoles, jogos, controles e retrô. Monte o carrinho e peça pelo WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const MARQUEE = ["PlayStation", "Nintendo", "Xbox", "Retrô", "Controles", "Headsets", "Jogos", "Seminovos"];

const STEPS = [
  { icon: Sparkles, title: "Escolha", text: "Navegue pela vitrine e encontre seu próximo console ou jogo." },
  { icon: ShoppingCart, title: "Monte o carrinho", text: "Adicione quantos itens quiser e ajuste as quantidades." },
  { icon: MessageCircle, title: "Peça no WhatsApp", text: "Seu pedido chega pronto para a gente, é só confirmar." },
];

const PERKS = [
  { icon: BadgeCheck, title: "Produtos testados", text: "Seminovos revisados antes de chegar até você." },
  { icon: Repeat, title: "Compra e troca", text: "Traga seu console usado e saia com um novo." },
  { icon: MessageCircle, title: "Atendimento direto", text: "Tire dúvidas e negocie direto no WhatsApp." },
];

function Index() {
  const { products, categories } = getRouteApi("__root__").useLoaderData();
  const featured = products.filter((p) => p.featured);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-svh items-center overflow-hidden pb-14 pt-28 sm:pb-20 lg:pt-24">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 size-full object-cover object-[70%_center] opacity-30"
          width={1672}
          height={941}
        />
        <div className="hero-fade absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-4 px-4 sm:gap-8 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="enter-up order-last mx-auto w-full max-w-xl text-center lg:order-first lg:mx-0 lg:text-left">
            <h1
              className="font-display text-[clamp(2.25rem,5.5vw,4.75rem)] font-bold uppercase leading-[0.95]"
            >
              Seu próximo <span className="text-primary">nível</span>
              <br />
              começa <span className="text-outline">aqui</span>
            </h1>
            <p
              className="mt-5 max-w-lg text-base text-foreground/80 sm:mx-auto sm:text-lg lg:mx-0"
            >
              Consoles, jogos, controles e relíquias retrô. Monte seu carrinho e finalize o pedido
              direto no WhatsApp da GameLandia.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                to="/loja"
                className="group inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
              >
                Ver vitrine
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={`https://wa.me/${STORE.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-background/60 px-6 font-semibold backdrop-blur transition-colors hover:border-whatsapp hover:text-whatsapp"
              >
                <MessageCircle className="size-4" /> Falar no WhatsApp
              </a>
            </div>
          </div>
          <img
            src="/gamelandia-logo.webp"
            alt="GameLandia. Onde os mundos se conectam"
            width={1508}
            height={925}
            fetchPriority="high"
            className="enter-up mx-auto h-auto w-full max-w-[42rem] drop-shadow-[0_14px_30px_rgba(3,6,13,0.58)]"
          />
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-border bg-primary py-3 text-primary-foreground">
        <div className="animate-marquee flex w-max gap-10">
          {[...MARQUEE, ...MARQUEE].map((word, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-lg font-bold uppercase tracking-widest">
              {word} <span aria-hidden>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-accent">Categorias</p>
          <h2 className="mt-2 font-display text-4xl font-bold uppercase sm:text-5xl">Escolha seu mundo</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 80}>
              <Link
                to="/loja"
                search={{ categoria: cat.id }}
                className="group relative block aspect-[3/4] overflow-hidden rounded-xl border border-border bg-card"
              >
                {cat.image && <img
                  src={cat.image}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                />}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-xs text-muted-foreground">{cat.tagline}</p>
                  <p className="flex items-center justify-between font-display text-xl font-bold uppercase">
                    {cat.label}
                    <ArrowRight className="size-5 -translate-x-2 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>}

      {/* Featured */}
      <section className="bg-grid border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-widest text-accent">Destaques</p>
              <h2 className="mt-2 font-display text-4xl font-bold uppercase sm:text-5xl">Em alta na GameLandia</h2>
            </div>
            <Link to="/loja" className="group inline-flex items-center gap-2 font-semibold text-primary">
              Ver tudo <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 100}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How to buy */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal className="text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-accent">Como comprar</p>
          <h2 className="mt-2 font-display text-4xl font-bold uppercase sm:text-5xl">Simples como apertar start</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <div className="relative h-full rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/60">
                <span className="absolute right-5 top-4 font-display text-5xl font-bold text-muted">0{i + 1}</span>
                <step.icon className="size-8 text-primary" />
                <h3 className="mt-4 font-display text-xl font-bold uppercase">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <LocationSection />

      {/* Perks + Instagram */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <div className="grid gap-4">
            {PERKS.map((perk, i) => (
              <Reveal key={perk.title} delay={i * 100}>
                <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
                    <perk.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold uppercase">{perk.title}</h3>
                    <p className="text-sm text-muted-foreground">{perk.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={150}>
            <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-xl border border-primary/40 bg-card p-8 sm:p-10">
              <div className="absolute -right-20 -top-20 size-64 animate-glow-pulse rounded-full bg-primary/25 blur-3xl" />
              <div className="absolute -bottom-24 -left-10 size-64 animate-glow-pulse rounded-full bg-accent/20 blur-3xl" />
              <p className="relative font-display text-sm font-semibold uppercase tracking-widest text-primary">
                {STORE.instagramHandle}
              </p>
              <h2 className="relative mt-3 font-display text-4xl font-bold uppercase leading-tight">
                Novidades chegam primeiro no Instagram
              </h2>
              <p className="relative mt-3 text-muted-foreground">
                Siga a GameLandia para ver lançamentos, promoções e os achados retrô da semana.
              </p>
              <a
                href={STORE.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="relative mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-lg bg-accent px-6 font-semibold text-accent-foreground transition-transform hover:scale-105"
              >
                Seguir no Instagram <ArrowRight className="size-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
