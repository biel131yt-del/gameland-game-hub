import { neon } from "@neondatabase/serverless";

import { field, PanelError } from "./admin-db.server";
import { normalizeOrderLines, SALE_CHANNELS, type OrderLineInput } from "./orders";
import type { CartItem } from "./cart";

type Database = ReturnType<typeof neon<false, false>>;
export type RecordedSale = { id: string; total: number; items: CartItem[] };
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export function uuid(value: unknown) {
  if (typeof value !== "string" || !UUID.test(value))
    throw new PanelError("Identificador inválido.");
  return value;
}

export async function recordSale(db: Database, data: Record<string, unknown>, username?: string) {
  let lines: OrderLineInput[];
  try {
    lines = normalizeOrderLines(data["lines"] as OrderLineInput[]);
  } catch (error) {
    throw new PanelError(error instanceof Error ? error.message : "Pedido inválido.");
  }

  const name = field(data["name"], 120, true);
  const delivery = data["delivery"];
  if (!username && delivery !== "retirada" && delivery !== "entrega")
    throw new PanelError("Escolha como receber o pedido.");
  const address = delivery === "entrega" ? field(data["address"], 250, true) : "";
  const channel = username ? field(data["channel"], 12, true) : "site";
  if (!SALE_CHANNELS.some((option) => option === channel)) throw new PanelError("Canal inválido.");

  const [sale] = await db`
    select * from record_gameland_sale(
      ${JSON.stringify(lines)}::jsonb, ${name}, ${channel}, ${delivery === "entrega" || delivery === "retirada" ? delivery : null},
      ${address || null}, ${field(data["note"], 400) || null}, ${username ? field(data["payment"], 40) || null : null},
      ${username ? null : uuid(data["key"])}::uuid, ${username ?? null}
    )
  `;
  if (!sale) throw new Error("Sale returned no data.");
  return sale as RecordedSale;
}

export function storefrontDb() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is required.");
  return neon(url);
}

export async function jsonObject(
  request: Request,
  maxBytes = 18_000,
): Promise<Record<string, unknown>> {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    throw new PanelError("Origem não autorizada.", 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    throw new PanelError("Envie os dados em JSON.", 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new PanelError("Dados inválidos.");
  const decoder = new TextDecoder();
  let size = 0;
  let body = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new PanelError("Arquivo ou pedido grande demais.", 413);
    }
    body += decoder.decode(value, { stream: true });
  }
  try {
    const parsed: unknown = JSON.parse(body + decoder.decode());
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new PanelError("Dados inválidos.");
  }
}

export const privateHeaders = { "cache-control": "no-store", "x-content-type-options": "nosniff" };

export function respond(data: unknown, status = 200, headers?: HeadersInit) {
  const responseHeaders = new Headers(headers);
  for (const [key, value] of Object.entries(privateHeaders)) responseHeaders.set(key, value);
  return Response.json(data, { status, headers: responseHeaders });
}

export function handleError(error: unknown) {
  if (error instanceof PanelError) return respond({ error: error.message }, error.status);
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P0001" &&
    "message" in error
  ) {
    return respond({ error: String(error.message) }, 409);
  }
  if (error && typeof error === "object" && "code" in error && error.code === "23505") {
    return respond({ error: "Já existe um registro com esse identificador." }, 409);
  }
  console.error(
    "Falha em operação da GameLandia",
    error instanceof Error ? error.name : "UnknownError",
    error && typeof error === "object" && "code" in error ? error.code : "",
  );
  return respond(
    { error: "Não foi possível concluir a operação. Tente novamente em instantes." },
    500,
  );
}
