import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, Boxes, LogOut, ReceiptText, ShoppingBag, UsersRound } from "lucide-react";
import { useState } from "react";

import { InventoryPanel } from "@/components/admin/inventory-panel";
import { OverviewPanel } from "@/components/admin/overview-panel";
import {
  control,
  Feedback,
  Field,
  Form,
  mutate,
  secondary,
  textField,
  usePanel,
} from "@/components/admin/panel-ui";
import { SalesPanel } from "@/components/admin/sales-panel";
import { ExpensesPanel, TeamPanel } from "@/components/admin/team-expenses";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (import.meta.env.MODE === "sites") {
      throw redirect({ href: "https://gameland-game-hub.vercel.app/admin" });
    }
  },
  head: () => ({
    meta: [{ title: "Painel · GameLandia" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Admin,
});

type Account = {
  name: string;
  username: string;
  role: "dono" | "funcionario";
  mustChangePassword: boolean;
};
const areas = [
  { id: "overview", title: "Visão geral", icon: BarChart3, ownerOnly: true },
  { id: "sales", title: "Vendas", icon: ShoppingBag },
  { id: "products", title: "Estoque", icon: Boxes },
  { id: "expenses", title: "Gastos", icon: ReceiptText, ownerOnly: true },
  { id: "team", title: "Equipe", icon: UsersRound, ownerOnly: true },
] as const;
type Area = (typeof areas)[number]["id"];

function Brand() {
  return (
    <Link to="/" className="inline-flex items-center gap-3" aria-label="GameLandia, ir para a loja">
      <img src="/gamelandia-mark.webp" width={44} height={44} alt="" />
      <span className="font-display text-xl font-bold">
        Game<span className="text-primary">Landia</span>
      </span>
    </Link>
  );
}

function Access({ changing, done }: { changing: boolean; done: () => void }) {
  return (
    <div className="grid min-h-svh place-items-center bg-background p-5">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-9">
        <Brand />
        <h1 className="mt-7 font-display text-3xl font-bold">
          {changing ? "Crie sua nova senha" : "Painel da loja"}
        </h1>
        <p className="mb-6 mt-2 text-sm text-muted-foreground">
          {changing
            ? "Use pelo menos 12 caracteres. Depois, entre novamente com a nova senha."
            : "Entre com seu usuário e senha."}
        </p>
        <Form
          key={String(changing)}
          submit={changing ? "Trocar senha" : "Entrar"}
          onDone={done}
          onSave={(data) => {
            const password = textField(data, "password");
            if (changing && password !== textField(data, "confirmation"))
              throw new Error("As duas senhas precisam ser iguais.");
            return mutate(
              changing
                ? { action: "password", password }
                : { action: "login", username: textField(data, "username"), password },
            );
          }}
        >
          {!changing && (
            <Field label="Usuário">
              <input
                className={control}
                name="username"
                autoComplete="username"
                required
                maxLength={40}
              />
            </Field>
          )}
          <Field label={changing ? "Nova senha" : "Senha"}>
            <input
              className={control}
              name="password"
              type="password"
              autoComplete={changing ? "new-password" : "current-password"}
              minLength={changing ? 12 : undefined}
              maxLength={128}
              required
            />
          </Field>
          {changing && (
            <Field label="Confirme a nova senha">
              <input
                className={control}
                name="confirmation"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
              />
            </Field>
          )}
        </Form>
        <div className="mt-6">
          {changing ? (
            <Form submit="Sair" onSave={() => mutate({ action: "logout" })} onDone={done}>
              {null}
            </Form>
          ) : (
            <Link
              to="/"
              className="inline-flex text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Voltar à loja
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ account, signedOut }: { account: Account; signedOut: () => void }) {
  const owner = account.role === "dono";
  const [area, setArea] = useState<Area>(owner ? "overview" : "sales");
  const [month, setMonth] = useState(() =>
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
    }).format(new Date()),
  );
  const [signingOut, setSigningOut] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const title = areas.find((entry) => entry.id === area)?.title;

  async function signOut() {
    setSigningOut(true);
    try {
      await mutate({ action: "logout" });
      signedOut();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível sair.");
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-svh md:grid md:grid-cols-[13.5rem_minmax(0,1fr)]">
      <aside className="border-b border-border bg-card px-4 py-4 md:border-b-0 md:border-r md:p-5">
        <Brand />
        <nav
          aria-label="Navegação do painel"
          className="mt-4 flex flex-wrap gap-1.5 md:mt-8 md:flex-col"
        >
          {areas
            .filter((entry) => owner || !("ownerOnly" in entry))
            .map(({ id, icon: Icon, title: label }) => (
              <button
                key={id}
                aria-current={area === id ? "page" : undefined}
                onClick={() => setArea(id)}
                className={`flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${area === id ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Icon size={17} aria-hidden />
                {label}
              </button>
            ))}
        </nav>
      </aside>
      <main className="min-w-0 px-4 py-5 sm:px-7 sm:py-7 lg:px-9">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {account.name} · {owner ? "Dono" : "Funcionário"}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold">{title}</h1>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            {(area === "overview" || area === "sales" || area === "expenses") && (
              <Field label="Mês">
                <input
                  className={control}
                  type="month"
                  value={month}
                  onChange={(event) => {
                    if (event.target.value) setMonth(event.target.value);
                  }}
                />
              </Field>
            )}
            <button className={secondary} onClick={() => setChangingPassword(!changingPassword)}>
              {changingPassword ? "Fechar" : "Alterar senha"}
            </button>
            <button className={secondary} disabled={signingOut} onClick={() => void signOut()}>
              <LogOut size={17} /> Sair
            </button>
          </div>
        </header>
        {error && (
          <p role="alert" className="mb-4 text-sm text-destructive">
            {error}
          </p>
        )}
        {changingPassword && (
          <div className="mb-5 max-w-lg rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-4 font-display text-xl font-bold">Alterar senha</h2>
            <Form
              submit="Salvar nova senha"
              onDone={signedOut}
              onSave={(data) => {
                const password = textField(data, "password");
                if (password !== textField(data, "confirmation"))
                  throw new Error("As duas senhas precisam ser iguais.");
                return mutate({
                  action: "password",
                  currentPassword: textField(data, "currentPassword"),
                  password,
                });
              }}
            >
              <Field label="Senha atual">
                <input
                  className={control}
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </Field>
              <Field label="Nova senha">
                <input
                  className={control}
                  name="password"
                  type="password"
                  required
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirme a nova senha">
                <input
                  className={control}
                  name="confirmation"
                  type="password"
                  required
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </Field>
            </Form>
          </div>
        )}
        {area === "overview" && owner && <OverviewPanel month={month} />}
        {area === "sales" && <SalesPanel month={month} />}
        {area === "products" && <InventoryPanel owner={owner} />}
        {area === "expenses" && owner && <ExpensesPanel key={month} month={month} />}
        {area === "team" && owner && <TeamPanel />}
      </main>
    </div>
  );
}

function Admin() {
  const query = usePanel<{ account: Account | null }>("session");
  const client = useQueryClient();
  function reload() {
    client.removeQueries({
      queryKey: ["admin"],
      predicate: ({ queryKey }) => queryKey[1] !== "session",
    });
    void query.refetch();
  }

  if (!query.data)
    return (
      <div className="mx-auto max-w-md p-6">
        <Feedback error={query.error} loading={query.isPending} />
      </div>
    );
  if (!query.data.account || query.data.account.mustChangePassword)
    return <Access changing={Boolean(query.data.account)} done={reload} />;
  return (
    <Dashboard key={query.data.account.username} account={query.data.account} signedOut={reload} />
  );
}
