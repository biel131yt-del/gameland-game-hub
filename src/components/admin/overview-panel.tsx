import { formatBRL } from "@/lib/cart";
import { Feedback, Panel, usePanel } from "./panel-ui";

type Overview = {
  daily: { day: string; revenue: string | number }[];
  totals: { completed: string; pending: string; revenue: string; cost: string };
  spending: { category: string; amount: string | number }[];
  lowStock: { id: string; name: string; stock: number; min_stock: number }[];
};

export function OverviewPanel({ month }: { month: string }) {
  const query = usePanel<Overview>("overview", month);
  const data = query.data;
  if (!data) return <Feedback error={query.error} loading={query.isPending} />;
  const revenue = Number(data.totals.revenue);
  const cost = Number(data.totals.cost);
  const spending = data.spending.reduce((total, entry) => total + Number(entry.amount), 0);
  const operating = data.spending
    .filter((entry) => entry.category !== "Compra de mercadoria")
    .reduce((total, entry) => total + Number(entry.amount), 0);
  const stats = [
    {
      name: "Faturamento",
      value: formatBRL(revenue),
      detail: `${data.totals.completed} vendas concluídas`,
    },
    {
      name: "Custo dos produtos",
      value: formatBRL(cost),
      detail: "Produtos das vendas concluídas",
    },
    {
      name: "Gastos registrados",
      value: formatBRL(spending),
      detail: `${data.spending.length} categorias no mês`,
    },
    {
      name: "Lucro estimado",
      value: formatBRL(revenue - cost - operating),
      detail: "Faturamento menos custo e gastos operacionais",
    },
  ];
  const highestDay = Math.max(1, ...data.daily.map((entry) => Number(entry.revenue)));
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className={`rounded-xl border p-4 ${index === 3 ? "border-primary/40 bg-primary/8" : "border-border bg-card"}`}
          >
            <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{stat.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{stat.detail}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel
          title="Vendas por dia"
          description={`${data.totals.pending} pedidos pendentes no mês.`}
        >
          {data.daily.length === 0 ? (
            <p className="text-sm text-muted-foreground">As vendas concluídas aparecem aqui.</p>
          ) : (
            <ul className="space-y-3">
              {data.daily.map((entry) => (
                <li
                  key={entry.day}
                  className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 text-sm"
                >
                  <span>{entry.day}</span>
                  <span
                    className="h-2.5 rounded bg-primary"
                    style={{ width: `${(Number(entry.revenue) / highestDay) * 100}%` }}
                  />
                  <span className="tabular-nums">{formatBRL(Number(entry.revenue))}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Gastos por categoria">
          {data.spending.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum gasto registrado no mês.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.spending.map((entry) => (
                <li key={entry.category} className="flex justify-between gap-3 py-2.5 text-sm">
                  <span>{entry.category}</span>
                  <span className="shrink-0 tabular-nums">{formatBRL(Number(entry.amount))}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <Panel title="Atenção ao estoque">
        {data.lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum produto no limite de estoque.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.lowStock.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 py-2.5 text-sm">
                <span>{item.name}</span>
                <span className="text-accent">
                  {item.stock === 0 ? "Esgotado" : `${item.stock} un.`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
