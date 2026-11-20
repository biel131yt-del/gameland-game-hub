import { describe, expect, it } from "vitest";

import { normalizeOrderLines, stockDeltaForStatusChange } from "./orders";

describe("pedidos", () => {
  it("junta o mesmo produto repetido em uma linha só", () => {
    expect(
      normalizeOrderLines([
        { productId: "ps5", quantity: 1 },
        { productId: "ps5", quantity: 2 },
      ]),
    ).toEqual([{ productId: "ps5", quantity: 3 }]);
  });

  it("recusa quantidade zero ou acima de 20 por produto", () => {
    expect(() => normalizeOrderLines([{ productId: "ps5", quantity: 0 }])).toThrow();
    expect(() => normalizeOrderLines([{ productId: "ps5", quantity: 21 }])).toThrow();
  });

  it("venda concluída tira do estoque e cancelar uma concluída devolve", () => {
    expect(stockDeltaForStatusChange("pendente", "concluida", 2)).toBe(-2);
    expect(stockDeltaForStatusChange("concluida", "cancelada", 2)).toBe(2);
    expect(stockDeltaForStatusChange("pendente", "cancelada", 2)).toBe(0);
  });
});
