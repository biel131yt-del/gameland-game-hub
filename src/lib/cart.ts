// Prices are integer cents to avoid floating-point rounding in totals.
export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type CartProductInput = { id: string; name: string; price: number };

export type CustomerInfo = {
  name: string;
  delivery: "retirada" | "entrega";
  address?: string;
  note?: string;
};

export function addItem(items: CartItem[], product: CartProductInput, quantity = 1): CartItem[] {
  if (quantity <= 0) return items;
  const existing = items.find((i) => i.id === product.id);
  if (existing) {
    return items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
  }
  return [...items, { id: product.id, name: product.name, price: product.price, quantity }];
}

export function setQuantity(items: CartItem[], id: string, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter((i) => i.id !== id);
  return items.map((i) => (i.id === id ? { ...i, quantity } : i));
}

export function removeItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((i) => i.id !== id);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(cents / 100)
    .replace(/\u00a0/g, " ");
}

export function buildWhatsAppMessage(items: CartItem[], customer: CustomerInfo): string {
  const lines = [
    "Olá, GameLandia! Quero fazer este pedido:",
    "",
    ...items.map(
      (i) => `• ${i.quantity}x ${i.name} — ${formatBRL(i.price * i.quantity)}`,
    ),
    "",
    `*Total: ${formatBRL(cartTotal(items))}*`,
    "",
    `Nome: ${customer.name.trim()}`,
    `Recebimento: ${customer.delivery === "entrega" ? "Entrega" : "Retirada na loja"}`,
  ];
  if (customer.delivery === "entrega" && customer.address?.trim()) {
    lines.push(`Endereço: ${customer.address.trim()}`);
  }
  if (customer.note?.trim()) lines.push(`Observação: ${customer.note.trim()}`);
  return lines.join("\n");
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
