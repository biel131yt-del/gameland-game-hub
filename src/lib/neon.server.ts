import { neon } from "@neondatabase/serverless";

import { SAMPLE_PRODUCTS, type Product } from "./products";

export async function readCatalog(): Promise<Product[]> {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    if (import.meta.env.DEV) return SAMPLE_PRODUCTS;
    throw new Error("DATABASE_URL must be configured.");
  }

  const sql = neon(connectionString);
  const rows = await sql`
    select id, name, category, price_cents as price, old_price_cents as "oldPrice",
           image_url as image, condition, badge, featured, description, specs, stock
    from products
    where active
    order by featured desc, created_at, id
  `;
  return rows as Product[];
}
