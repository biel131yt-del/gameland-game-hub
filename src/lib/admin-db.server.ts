import { neon } from "@neondatabase/serverless";

export function adminDb() {
  const url = process.env["ADMIN_DATABASE_URL"];
  if (!url) throw new Error("ADMIN_DATABASE_URL is required.");
  return neon(url);
}

export class PanelError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export function field(value: unknown, max: number, required = false) {
  const result = typeof value === "string" ? value.trim() : "";
  if (result.length > max || (required && !result)) {
    throw new PanelError("Confira os campos preenchidos.");
  }
  return result;
}

export function integer(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new PanelError("Confira os valores numéricos.");
  }
  return value;
}
