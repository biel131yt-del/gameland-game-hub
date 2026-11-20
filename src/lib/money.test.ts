import { describe, expect, it } from "vitest";

import { monthRange, parseBRLToCents, previousMonth, profitMargin } from "./money";

describe("valores em reais", () => {
  it("entende o formato brasileiro com milhar e centavos", () => {
    expect(parseBRLToCents("1.299,90")).toBe(129990);
    expect(parseBRLToCents("R$ 49,9")).toBe(4990);
    expect(parseBRLToCents("120")).toBe(12000);
    expect(parseBRLToCents("abc")).toBeNull();
  });

  it("resumo do mês cobre do dia 1 ao último dia, inclusive fevereiro bissexto", () => {
    expect(monthRange("2028-02")).toEqual({ start: "2028-02-01", end: "2028-02-29" });
    expect(previousMonth("2027-01")).toBe("2026-12");
  });

  it("margem de lucro é lucro dividido pelo faturamento", () => {
    expect(profitMargin(100000, 25000)).toBe(25);
    expect(profitMargin(0, 0)).toBe(0);
  });
});
