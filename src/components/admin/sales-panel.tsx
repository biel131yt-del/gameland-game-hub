import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { formatBRL } from "@/lib/cart";
import {
  CHANNEL_LABEL,
  SALE_STATUSES,
  STATUS_LABEL,
  type SaleChannel,
  type SaleStatus,
} from "@/lib/orders";

import {
  control,
  day,
  Feedback,
  Field,
  Form,
  mutate,
  Panel,
  Payment,
  secondary,
  textField,
  usePanel,
} from "./panel-ui";

type Sale = {
  id: string;
  created_at: string;
  status: SaleStatus;
  channel: SaleChannel;
  customer_name: string;
  delivery?: string;
  address?: string;
  notes?: string;
  payment_method?: string;
  total_cents: number;
  items: { name: string; quantity: number }[];
};
type SalesData = { sales: Sale[]; products: { id: string; name: string; stock: number }[] };

function SaleRow({ sale, refresh }: { sale: Sale; refresh: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function change(status: SaleStatus) {
    setBusy(true);
    setError("");
    try {
      await mutate({ action: "sale-status", id: sale.id, status });
      refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível atualizar a venda.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <li className="grid gap-3 border-b border-border py-4 last:border-0 sm:grid-cols-[1fr_auto]">
      <div>
        <p className="font-semibold">{sale.customer_name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {day(sale.created_at)} · {CHANNEL_LABEL[sale.channel]}
        </p>
        <p className="mt-2 text-sm">
          {sale.items.map((item) => `${item.quantity}× ${item.name}`).join(" · ")}
        </p>
        {(sale.delivery || sale.payment_method || sale.notes) && (
          <details className="mt-2 text-sm text-muted-foreground">
            <summary className="cursor-pointer">Dados do pedido</summary>
            {sale.delivery && (
              <p>
                {sale.delivery === "entrega" ? `Entrega · ${sale.address}` : "Retirada na loja"}
              </p>
            )}
            {sale.payment_method && <p>{sale.payment_method}</p>}
            {sale.notes && <p className="break-words">{sale.notes}</p>}
          </details>
        )}
      </div>
      <div className="grid content-start justify-items-start gap-2 sm:justify-items-end">
        <p className="font-semibold tabular-nums">{formatBRL(sale.total_cents)}</p>
        <select
          aria-label={`Status do pedido de ${sale.customer_name}`}
          className={control}
          disabled={busy}
          value={sale.status}
          onChange={(event) => void change(event.target.value as SaleStatus)}
        >
          {SALE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>
        {error && (
          <p role="alert" className="max-w-48 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}

function ManualSale({
  products,
  refresh,
}: {
  products: SalesData["products"];
  refresh: () => void;
}) {
  const [rows, setRows] = useState([0]);
  const [next, setNext] = useState(1);
  if (!products.length)
    return (
      <p className="text-sm text-muted-foreground">
        Ative um produto com estoque para registrar uma venda.
      </p>
    );
  return (
    <Form
      submit="Registrar venda pendente"
      onDone={() => {
        setRows([0]);
        refresh();
      }}
      onSave={(data) =>
        mutate({
          action: "sale",
          name: textField(data, "name"),
          channel: textField(data, "channel"),
          payment: textField(data, "payment"),
          note: textField(data, "note"),
          lines: rows.map((id) => ({
            productId: textField(data, `product-${id}`),
            quantity: Number(data.get(`quantity-${id}`)),
          })),
        })
      }
    >
      <Field label="Cliente">
        <input className={control} name="name" required maxLength={120} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Canal">
          <select className={control} name="channel">
            <option value="loja">Loja física</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
          </select>
        </Field>
        <Payment />
      </div>
      {rows.map((id, index) => (
        <div key={id} className="grid grid-cols-[minmax(0,1fr)_4.5rem_auto] items-end gap-2">
          <Field label={`Produto ${index + 1}`}>
            <select className={control} name={`product-${id}`} required defaultValue="">
              <option value="" disabled>
                Selecione
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.stock})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Qtd.">
            <input
              className={control}
              type="number"
              min="1"
              max="20"
              name={`quantity-${id}`}
              required
              defaultValue="1"
            />
          </Field>
          <button
            className={secondary}
            type="button"
            disabled={rows.length === 1}
            aria-label={`Remover produto ${index + 1}`}
            onClick={() => setRows(rows.filter((entry) => entry !== id))}
          >
            <Minus size={17} />
          </button>
        </div>
      ))}
      <button
        className={secondary}
        type="button"
        disabled={rows.length >= 30}
        onClick={() => {
          setRows([...rows, next]);
          setNext(next + 1);
        }}
      >
        <Plus size={17} /> Outro produto
      </button>
      <Field label="Observações">
        <textarea className={control} name="note" rows={2} maxLength={400} />
      </Field>
    </Form>
  );
}

export function SalesPanel({ month }: { month: string }) {
  const query = usePanel<SalesData>("sales", month);
  const client = useQueryClient();
  function refresh() {
    void client.invalidateQueries({ queryKey: ["admin"] });
  }
  if (!query.data) return <Feedback error={query.error} loading={query.isPending} />;
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
      <Panel
        title="Pedidos e vendas"
        description="Concluir uma venda baixa o estoque. Reabrir ou cancelar devolve as unidades."
      >
        {query.data.sales.length ? (
          <ul>
            {query.data.sales.map((sale) => (
              <SaleRow key={sale.id} sale={sale} refresh={refresh} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma venda registrada no mês.</p>
        )}
      </Panel>
      <Panel title="Venda manual">
        <ManualSale products={query.data.products} refresh={refresh} />
      </Panel>
    </div>
  );
}
