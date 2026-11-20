import { useState, type FormEvent, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { parseBRLToCents } from "@/lib/money";
import { PAYMENT_METHODS } from "@/lib/orders";

export async function api<T>(
  view?: string,
  month?: string,
  payload?: Record<string, unknown>,
): Promise<T> {
  const query = new URLSearchParams();
  if (view) query.set("view", view);
  if (month) query.set("month", month);
  const result = await fetch(
    `/api/admin?${query}`,
    payload
      ? {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }
      : { cache: "no-store" },
  );
  const body = await result.json();
  if (!result.ok) throw new Error(body.error || "Não foi possível carregar o painel.");
  return body as T;
}

export function usePanel<T>(view: string, month?: string) {
  return useQuery({
    queryKey: ["admin", view, month],
    queryFn: () => api<T>(view, month),
    retry: false,
  });
}

export async function mutate(payload: Record<string, unknown>) {
  await api(undefined, undefined, payload);
}

export const control =
  "min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary";
export const primary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:cursor-wait disabled:opacity-60";
export const secondary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-primary disabled:opacity-60";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export function Panel({
  title,
  children,
  description,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Feedback({ error, loading }: { error: unknown; loading: boolean }) {
  if (error)
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm"
      >
        {error instanceof Error ? error.message : "Não foi possível carregar os dados."}
      </p>
    );
  if (loading)
    return (
      <p role="status" className="p-4 text-sm text-muted-foreground">
        Carregando…
      </p>
    );
  return null;
}

export function Form({
  children,
  submit,
  onSave,
  onDone,
  reset = true,
}: {
  children: ReactNode;
  submit: string;
  onSave: (data: FormData) => Promise<void>;
  onDone?: () => void;
  reset?: boolean;
}) {
  const [state, setState] = useState({ busy: false, error: "", success: false });
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState({ busy: true, error: "", success: false });
    try {
      await onSave(new FormData(form));
      if (reset) form.reset();
      setState({ busy: false, error: "", success: true });
      onDone?.();
    } catch (error) {
      setState({
        busy: false,
        error: error instanceof Error ? error.message : "Tente novamente.",
        success: false,
      });
    }
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <fieldset disabled={state.busy} className="min-w-0 space-y-4">
        {children}
        <button className={primary} type="submit">
          {state.busy ? "Salvando…" : submit}
        </button>
      </fieldset>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-primary">
          Salvo.
        </p>
      )}
    </form>
  );
}

export function Payment() {
  return (
    <Field label="Pagamento">
      <select className={control} name="payment">
        <option value="">Selecione</option>
        {PAYMENT_METHODS.map((method) => (
          <option key={method}>{method}</option>
        ))}
      </select>
    </Field>
  );
}

export function price(data: FormData, name: string, optional = false) {
  const raw = String(data.get(name) ?? "");
  if (optional && !raw.trim()) return null;
  const cents = parseBRLToCents(raw);
  if (cents === null) throw new Error("Preencha os preços usando o formato 0,00.");
  return cents;
}

export const textField = (data: FormData, name: string) => String(data.get(name) ?? "");
export const day = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" }).format(
    new Date(value),
  );
