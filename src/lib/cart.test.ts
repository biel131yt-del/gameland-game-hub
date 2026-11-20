import { describe, expect, it } from "vitest";

import {
  addItem,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  cartCount,
  cartTotal,
  setQuantity,
} from "./cart";
import { STORE } from "./store-config";

const ps5 = { id: "ps5", name: "PS5 Slim", price: 379990 };
const controle = { id: "ctrl", name: "Controle Pro", price: 34990 };

describe("carrinho", () => {
  it("soma quantidades do mesmo produto e calcula o total", () => {
    let items = addItem([], ps5);
    items = addItem(items, ps5);
    items = addItem(items, controle);
    expect(cartCount(items)).toBe(3);
    expect(cartTotal(items)).toBe(379990 * 2 + 34990);
  });

  it("remove o item quando a quantidade chega a zero", () => {
    const items = setQuantity(addItem([], ps5), "ps5", 0);
    expect(items).toHaveLength(0);
  });

  it("envia o pedido para o WhatsApp da Gameland com o total", () => {
    const items = addItem(addItem([], ps5), controle, 2);
    const msg = buildWhatsAppMessage(items, { name: "Ana", delivery: "retirada" });
    const url = buildWhatsAppUrl(STORE.whatsappNumber, msg);
    expect(url.startsWith("https://wa.me/5551999400656?text=")).toBe(true);
    expect(msg).toContain("R$ 4.499,70");
    expect(msg).toContain("2x Controle Pro");
  });
});
