import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { formatBRL } from "@/lib/cart";
import { EXPENSE_CATEGORIES } from "@/lib/orders";

import {
  control,
  Feedback,
  Field,
  Form,
  mutate,
  Panel,
  Payment,
  price,
  secondary,
  textField,
  usePanel,
} from "./panel-ui";

type Expense = {
  id: string;
  expense_date: string;
  description: string;
  category: string;
  amount_cents: number;
  payment_method: string | null;
  notes: string | null;
};

export function ExpensesPanel({ month }: { month: string }) {
  const query = usePanel<{ expenses: Expense[] }>("expenses", month);
  const client = useQueryClient();
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(
    new Date(),
  );
  if (!query.data) return <Feedback error={query.error} loading={query.isPending} />;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.8fr)]">
      <Panel title="Gastos do mês">
        {query.data.expenses.length ? (
          <ul className="divide-y divide-border">
            {query.data.expenses.map((expense) => (
              <li key={expense.id} className="flex justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {expense.expense_date.split("-").reverse().join("/")} · {expense.category}
                  </p>
                  {(expense.payment_method || expense.notes) && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[expense.payment_method, expense.notes].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <p className="shrink-0 text-sm tabular-nums">{formatBRL(expense.amount_cents)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum gasto registrado no mês.</p>
        )}
      </Panel>
      <Panel title="Registrar gasto">
        <Form
          submit="Salvar gasto"
          onDone={() => void client.invalidateQueries({ queryKey: ["admin"] })}
          onSave={(data) =>
            mutate({
              action: "expense",
              date: textField(data, "date"),
              description: textField(data, "description"),
              category: textField(data, "category"),
              amount: price(data, "amount"),
              payment: textField(data, "payment"),
              notes: textField(data, "notes"),
            })
          }
        >
          <Field label="Descrição">
            <input className={control} name="description" required maxLength={180} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Data">
              <input
                className={control}
                name="date"
                type="date"
                required
                defaultValue={today.startsWith(month) ? today : `${month}-01`}
              />
            </Field>
            <Field label="Valor (R$)">
              <input className={control} name="amount" required inputMode="decimal" />
            </Field>
          </div>
          <Field label="Categoria">
            <select className={control} name="category" required defaultValue="">
              <option value="" disabled>
                Selecione
              </option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </Field>
          <Payment />
          <Field label="Observações">
            <textarea className={control} name="notes" rows={2} maxLength={400} />
          </Field>
        </Form>
      </Panel>
    </div>
  );
}

type Member = {
  id: string;
  name: string;
  username: string;
  role: "dono" | "funcionario";
  active: boolean;
};

function MemberRow({ member, done }: { member: Member; done: () => void }) {
  const [resetting, setResetting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function toggle() {
    setBusy(true);
    setError("");
    try {
      await mutate({ action: "member-access", id: member.id, active: !member.active });
      done();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível alterar o acesso.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">{member.name}</p>
          <p className="text-xs text-muted-foreground">
            {member.username} ·{" "}
            {member.role === "dono"
              ? "Dono"
              : member.active
                ? "Funcionário ativo"
                : "Funcionário desativado"}
          </p>
        </div>
        {member.role !== "dono" && (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={secondary} onClick={() => setResetting(!resetting)}>
              {resetting ? "Fechar" : "Redefinir senha"}
            </button>
            <button
              type="button"
              className={secondary}
              onClick={() => void toggle()}
              disabled={busy}
            >
              {member.active ? "Desativar acesso" : "Reativar"}
            </button>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {resetting && (
        <div className="mt-3">
          <Form
            submit="Salvar senha temporária"
            onDone={() => setResetting(false)}
            onSave={(data) =>
              mutate({
                action: "member-password",
                id: member.id,
                password: textField(data, "password"),
              })
            }
          >
            <Field label="Senha temporária">
              <input
                className={control}
                name="password"
                type="password"
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                required
              />
            </Field>
          </Form>
        </div>
      )}
    </li>
  );
}

export function TeamPanel() {
  const query = usePanel<{ members: Member[] }>("team");
  const client = useQueryClient();
  function done() {
    void client.invalidateQueries({ queryKey: ["admin", "team"] });
  }
  if (!query.data) return <Feedback error={query.error} loading={query.isPending} />;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
      <Panel title="Acessos da equipe">
        <ul className="divide-y divide-border">
          {query.data.members.map((member) => (
            <MemberRow key={member.id} member={member} done={done} />
          ))}
        </ul>
      </Panel>
      <Panel
        title="Novo funcionário"
        description="Funcionários podem registrar vendas e ajustar estoque. A senha temporária deve ser trocada no primeiro acesso."
      >
        <Form
          submit="Criar acesso"
          onDone={done}
          onSave={(data) =>
            mutate({
              action: "member",
              name: textField(data, "name"),
              username: textField(data, "username"),
              password: textField(data, "password"),
            })
          }
        >
          <Field label="Nome">
            <input className={control} name="name" required maxLength={100} />
          </Field>
          <Field label="Usuário">
            <input
              className={control}
              name="username"
              required
              minLength={3}
              maxLength={40}
              autoComplete="off"
            />
          </Field>
          <Field label="Senha temporária">
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
        </Form>
      </Panel>
    </div>
  );
}
