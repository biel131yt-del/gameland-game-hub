export type OrderLineInput = { productId: string; quantity: number };

export const MAX_QTY_PER_LINE = 20;
export const MAX_LINES = 30;

/** Merges repeated products and rejects quantities outside 1..MAX_QTY_PER_LINE. */
export function normalizeOrderLines(lines: OrderLineInput[]): OrderLineInput[] {
  if (!Array.isArray(lines) || lines.length === 0) throw new Error("O pedido está vazio.");
  const merged = new Map<string, number>();
  for (const line of lines) {
    const id = String(line?.productId ?? "").trim();
    const qty = Number(line?.quantity);
    if (!id || id.length > 80) throw new Error("Produto inválido.");
    if (!Number.isInteger(qty) || qty < 1) throw new Error("Quantidade inválida.");
    merged.set(id, (merged.get(id) ?? 0) + qty);
  }
  if (merged.size > MAX_LINES) throw new Error("Itens demais em um pedido.");
  const result = [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }));
  if (result.some((l) => l.quantity > MAX_QTY_PER_LINE)) {
    throw new Error(`Máximo de ${MAX_QTY_PER_LINE} unidades por produto.`);
  }
  return result;
}

export const SALE_STATUSES = ["pendente", "concluida", "cancelada"] as const;
export type SaleStatus = (typeof SALE_STATUSES)[number];
export const SALE_CHANNELS = ["site", "loja", "whatsapp", "instagram"] as const;
export type SaleChannel = (typeof SALE_CHANNELS)[number];

export const STATUS_LABEL: Record<SaleStatus, string> = {
  pendente: "Pendente",
  concluida: "Concluída",
  cancelada: "Cancelada",
};
export const CHANNEL_LABEL: Record<SaleChannel, string> = {
  site: "Site",
  loja: "Loja física",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
};

export const EXPENSE_CATEGORIES = [
  "Compra de mercadoria",
  "Aluguel",
  "Água e luz",
  "Internet e telefone",
  "Frete e envios",
  "Marketing",
  "Salários",
  "Impostos e taxas",
  "Manutenção",
  "Outros",
] as const;

export const PAYMENT_METHODS = ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Transferência", "Outro"] as const;

/** Stock change applied when a sale moves between statuses (negative = leaves stock). */
export function stockDeltaForStatusChange(from: SaleStatus, to: SaleStatus, quantity: number): number {
  if (from !== "concluida" && to === "concluida") return -quantity;
  if (from === "concluida" && to !== "concluida") return quantity;
  return 0;
}
