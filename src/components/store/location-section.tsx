import { ArrowUpRight, MapPin, MessageCircle, Package, Truck } from "lucide-react";

import { STORE } from "@/lib/store-config";

import { Reveal } from "./reveal";

const ROUTE = "M 110 240 C 190 90, 330 60, 440 150 S 640 250, 700 70";

const PERKS = [
  { icon: Truck, title: "Para todo o Brasil", text: "Do RS ao AM, seu pedido chega até você." },
  { icon: Package, title: "Retirada na loja", text: `Prefere buscar? Retire em ${STORE.city}.` },
  { icon: MessageCircle, title: "Frete no WhatsApp", text: "Combinamos valor e prazo direto com você." },
];

export function LocationSection() {
  return (
    <section className="relative overflow-hidden border-y border-border">
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="absolute -left-32 top-10 size-96 animate-glow-pulse rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -right-24 bottom-0 size-96 animate-glow-pulse rounded-full bg-accent/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent backdrop-blur">
              <span aria-hidden>✈️</span> Entregas
            </p>
            <h2 className="mt-5 font-display text-5xl font-bold uppercase leading-[0.95] sm:text-6xl">
              Enviamos para
              <br />
              <span className="text-primary">todo Brasil</span>
            </h2>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Saímos de {STORE.city}-{STORE.state} direto para a sua casa, em qualquer canto do país.
            </p>
          </Reveal>

          {/* Animated flight route */}
          <Reveal delay={120}>
            <div className="relative mt-8 rounded-2xl border border-border bg-card/70 p-4 backdrop-blur">
              <svg viewBox="0 0 760 300" className="h-auto w-full" role="img" aria-label="Rota de envio saindo de São Jerônimo para todo o Brasil">
                <path d={ROUTE} fill="none" stroke="var(--border)" strokeWidth="3" />
                <path
                  d={ROUTE}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="10 14"
                  className="route-flow"
                />
                {/* Origin */}
                <circle cx="110" cy="240" r="22" fill="var(--accent)" opacity="0.18" className="pin-ping" />
                <circle cx="110" cy="240" r="9" fill="var(--accent)" />
                <text x="110" y="284" textAnchor="middle" className="fill-foreground font-display text-[20px] font-bold uppercase">
                  {STORE.city}
                </text>
                {/* Destinations */}
                {[
                  [250, 105],
                  [440, 150],
                  [580, 205],
                  [700, 70],
                ].map(([x, y], i) => (
                  <g key={i}>
                    <circle cx={x} cy={y} r="14" fill="var(--primary)" opacity="0.15" className="pin-ping" style={{ animationDelay: `${i * 0.5}s` }} />
                    <circle cx={x} cy={y} r="6" fill="var(--primary)" />
                  </g>
                ))}
                {/* Plane */}
                <g>
                  <text fontSize="34" textAnchor="middle" dominantBaseline="central">✈️</text>
                  <animateMotion dur="6s" repeatCount="indefinite" rotate="auto" path={ROUTE} />
                </g>
              </svg>
            </div>
          </Reveal>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {PERKS.map((perk, i) => (
              <Reveal key={perk.title} delay={200 + i * 100}>
                <div className="h-full rounded-xl border border-border bg-card/80 p-4 backdrop-blur transition-colors hover:border-primary/60">
                  <perk.icon className="size-5 text-primary" />
                  <p className="mt-2 font-display font-bold uppercase">{perk.title}</p>
                  <p className="text-sm text-muted-foreground">{perk.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Map card */}
        <Reveal delay={150}>
          <div className="group relative overflow-hidden rounded-3xl border border-primary/40 bg-card shadow-glow">
            <div className="relative aspect-[4/5] sm:aspect-square">
              <iframe
                title={`Mapa de ${STORE.city}-${STORE.state}`}
                src={STORE.mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="map-dark absolute inset-0 size-full border-0"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
              <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-full">
                <span className="absolute left-1/2 top-full size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/40 pin-ping-css" />
                <MapPin className="relative size-12 animate-float fill-accent text-background drop-shadow-lg" />
              </div>
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-border bg-background/85 p-5 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                <span aria-hidden>📍</span> Nossa base
              </p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-bold uppercase leading-none sm:text-3xl">
                    {STORE.city}
                    <span className="text-primary">-{STORE.state}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Rio Grande do Sul · Brasil</p>
                </div>
                <a
                  href={STORE.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
                >
                  Ver no mapa <ArrowUpRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
