import { neon } from "@neondatabase/serverless";

import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS, type Category, type Product } from "./products";

export async function readCatalog(): Promise<{ products: Product[]; categories: Category[] }> {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    if (import.meta.env.DEV) return { products: SAMPLE_PRODUCTS, categories: SAMPLE_CATEGORIES };
    throw new Error("DATABASE_URL must be configured.");
  }

  const sql = neon(connectionString);
  const [rows, categories] = await sql.transaction([
    sql`
    select p.id, name, category, c.label as "categoryLabel", price_cents as price, old_price_cents as "oldPrice",
           image_url as image, condition, badge, featured, description, specs, stock
    from products p join categories c on c.id = p.category
    where active
    order by featured desc, created_at, p.id
  `,
    sql`select id, label, tagline, image, position from categories order by position, label, id`,
  ]);
  return { products: rows as Product[], categories: categories as Category[] };
}
