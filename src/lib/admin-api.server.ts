import { adminDb, field, integer, PanelError } from "./admin-db.server";
import {
  changePassword,
  login,
  logout,
  passwordHash,
  readAccount,
  sessionCookie,
  usernameFrom,
} from "./admin-auth.server";
import { slugify } from "./products";
import { currentMonth, monthRange } from "./money";
import { EXPENSE_CATEGORIES, SALE_STATUSES } from "./orders";
import { handleError, jsonObject, recordSale, respond, uuid } from "./sales-api.server";

type Account = NonNullable<Awaited<ReturnType<typeof readAccount>>>;

function ownerOnly(account: Account) {
  if (account.role !== "dono") throw new PanelError("Acesso exclusivo do dono.", 403);
}

function monthFrom(value: string | null) {
  if (value === null) return currentMonth();
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(value)) throw new PanelError("Mês inválido.");
  return value;
}

function dateFrom(value: unknown) {
  const date = field(value, 10, true);
  if (
    !/^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date) ||
    isNaN(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  ) {
    throw new PanelError("Data inválida.");
  }
  return date;
}

function idFrom(value: unknown) {
  const id = field(value, 80, true);
  if (!/^[a-z0-9-]+$/.test(id)) throw new PanelError("Identificador de produto inválido.");
  return id;
}

function photoFrom(data: Record<string, unknown>) {
  if (data["photo"] === undefined) return null;
  const encoded = field(data["photo"], 2_500_000, true);
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(encoded);
  if (!match?.[1] || !match[2])
    throw new PanelError("Escolha uma imagem JPG, PNG ou WebP de até 1,8 MB.");
  try {
    const signature = atob(match[2].slice(0, 16));
    const mime = match[1];
    if (
      (mime === "image/jpeg" && signature.startsWith("\xff\xd8\xff")) ||
      (mime === "image/png" && signature.startsWith("\x89PNG\r\n\x1a\n")) ||
      (mime === "image/webp" && signature.startsWith("RIFF") && signature.slice(8, 12) === "WEBP")
    ) {
      return { mime, encoded: match[2] };
    }
  } catch {
    // Invalid base64 is handled below.
  }
  throw new PanelError("O arquivo não corresponde ao formato da foto.");
}

async function saveProduct(data: Record<string, unknown>, actor: Account) {
  const db = adminDb();
  const name = field(data["name"], 120, true);
  const creating = data["id"] === undefined;
  const id = creating ? idFrom(slugify(name)) : idFrom(data["id"]);
  const category = field(data["category"], 60, true);
  if (!(await db`select id from categories where id = ${category}`).length)
    throw new PanelError("Escolha uma categoria disponível.");
  const condition = data["condition"];
  if (condition !== "Novo" && condition !== "Seminovo") throw new PanelError("Condição inválida.");
  const price = integer(data["price"], 0, 100_000_000);
  const cost = integer(data["cost"], 0, 100_000_000);
  const oldPrice = data["oldPrice"] == null ? null : integer(data["oldPrice"], 0, 100_000_000);
  const description = field(data["description"], 1200);
  const specs = field(data["specs"], 800)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const badge = field(data["badge"], 40) || null;
  const minStock = integer(data["minStock"], 0, 100_000);
  const photo = photoFrom(data);
  const image = photo
    ? `/api/product-photo/${id}?v=${crypto.randomUUID()}`
    : field(data["image"], 450);
  if (
    image &&
    !/^\/products\/[a-z0-9._-]+$/i.test(image) &&
    !image.startsWith(`/api/product-photo/${id}`) &&
    !/^https:\/\/[^\s]+$/i.test(image)
  ) {
    throw new PanelError("Informe uma URL HTTPS ou envie a foto.");
  }
  const active = data["active"] === true;
  const featured = data["featured"] === true;

  const queries = creating
    ? [
        db`insert into products (id, name, category, price_cents, old_price_cents, cost_cents, image_url, condition, badge,
          featured, active, description, specs, min_stock)
        values (${id}, ${name}, ${category}, ${price}, ${oldPrice}, ${cost}, ${image}, ${condition}, ${badge},
          ${featured}, ${active}, ${description}, ${specs}::text[], ${minStock})`,
        db`select adjust_gameland_stock(${id}, ${integer(data["stock"], 0, 100_000)}, ${actor.username})`,
      ]
    : [
        db`update products set name=${name}, category=${category}, price_cents=${price}, old_price_cents=${oldPrice},
         cost_cents=${cost}, image_url=${image}, condition=${condition}, badge=${badge}, featured=${featured}, active=${active},
         description=${description}, specs=${specs}::text[], min_stock=${minStock}, updated_at=now() where id=${id} returning id`,
      ];

  if (photo)
    queries.push(db`insert into product_images (product_id, mime, data_base64) values (${id}, ${photo.mime}, ${photo.encoded})
    on conflict (product_id) do update set mime=excluded.mime, data_base64=excluded.data_base64, updated_at=now()`);
  const [saved] = await db.transaction(queries);
  if (!creating && !saved?.length) throw new PanelError("Produto não encontrado.", 404);
  return { id };
}

async function saveCategory(data: Record<string, unknown>) {
  const db = adminDb();
  const label = field(data["label"], 60, true);
  const creating = data["id"] === undefined;
  const id = creating ? idFrom(slugify(label)) : idFrom(data["id"]);
  const position = integer(data["position"], 0, 10000);
  const tagline = field(data["tagline"], 120);
  const photo = photoFrom(data);
  const uploadedPath = `/api/category-photo/${id}`;
  const image = photo ? `${uploadedPath}?v=${crypto.randomUUID()}` : field(data["image"], 450);
  const keepsUpload =
    image.startsWith(`${uploadedPath}?v=`) &&
    /^[a-f0-9-]{36}$/.test(image.slice(uploadedPath.length + 3));
  if (
    image &&
    !keepsUpload &&
    !/^\/products\/[a-z0-9._-]+$/i.test(image) &&
    !/^https:\/\/[^\s]+$/i.test(image)
  ) {
    throw new PanelError("Informe uma URL HTTPS ou envie a foto.");
  }
  const write = creating
    ? db`insert into categories (id,label,tagline,image,position)
        values (${id},${label},${tagline},${image},${position}) returning id`
    : db`update categories set label=${label}, tagline=${tagline}, image=${image}, position=${position}
        where id=${id} returning id`;
  const queries = [write];
  if (photo) {
    queries.push(db`insert into category_images (category_id,mime,data_base64) values (${id},${photo.mime},${photo.encoded})
      on conflict (category_id) do update set mime=excluded.mime,data_base64=excluded.data_base64`);
  } else if (!keepsUpload) {
    queries.push(db`delete from category_images where category_id=${id}`);
  }
  const [saved] = await db.transaction(queries);
  if (!saved?.length) throw new PanelError("Categoria não encontrada.", 404);
  return { id };
}

async function deleteCategory(data: Record<string, unknown>) {
  const db = adminDb();
  const id = idFrom(data["id"]);
  const destination = field(data["destination"], 60);
  if (destination === id) throw new PanelError("Escolha outra categoria.");
  if (destination && !(await db`select id from categories where id=${destination}`).length) {
    throw new PanelError("A categoria de destino não está mais disponível.", 409);
  }

  try {
    const queries = destination
      ? [db`update products set category=${destination},updated_at=now() where category=${id}`]
      : [];
    queries.push(db`delete from categories where id=${id} returning id`);
    const results = await db.transaction(queries);
    if (!results.at(-1)?.length) throw new PanelError("Categoria não encontrada.", 404);
    return { ok: true };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23503") {
      throw new PanelError(
        "Escolha uma categoria válida para transferir os produtos antes de remover.",
        409,
      );
    }
    throw error;
  }
}

export async function getAdmin(request: Request) {
  try {
    const account = await readAccount(request);
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "session";
    if (view === "session") {
      return respond({
        account: account
          ? {
              name: account.name,
              username: account.username,
              role: account.role,
              mustChangePassword: account.must_change_password,
            }
          : null,
      });
    }
    if (!account) throw new PanelError("Entre para acessar o painel.", 401);
    if (account.must_change_password) throw new PanelError("Troque a senha temporária.", 403);
    const db = adminDb();

    if (view === "products") {
      const products =
        account.role === "dono"
          ? await db`select id, name, category, price_cents, old_price_cents, cost_cents, stock, min_stock, image_url,
                     condition, badge, featured, active, description, specs from products order by active desc, name`
          : await db`select id, name, category, stock, min_stock, image_url, active, price_cents from products order by active desc, name`;
      const movements = await db`select sm.created_at, p.name, sm.delta, sm.reason
        from stock_movements sm join products p on p.id = sm.product_id order by sm.created_at desc limit 30`;
      const categories =
        await db`select id, label, tagline, image, position from categories order by position, label, id`;
      return respond({ products, movements, categories });
    }
    if (view === "categories") {
      ownerOnly(account);
      return respond({
        categories: await db`
        select c.id, c.label, c.tagline, c.image, c.position, count(p.id)::int as "productCount"
        from categories c left join products p on p.category = c.id
        group by c.id order by c.position, c.label, c.id
      `,
      });
    }
    if (view === "team") {
      ownerOnly(account);
      return respond({
        members:
          await db`select id, username, name, role, active from admin_accounts order by role, name`,
      });
    }

    const month = monthFrom(searchParams.get("month"));
    const { start, end } = monthRange(month);
    if (view === "sales") {
      const [sales, products] = await db.transaction([
        db`select s.id, s.created_at, s.status, s.channel, s.customer_name, s.delivery, s.address, s.notes, s.payment_method, s.total_cents,
          coalesce((select jsonb_agg(jsonb_build_object('name', si.product_name, 'quantity', si.quantity) order by si.product_name)
          from sale_items si where si.sale_id=s.id), '[]'::jsonb) items
          from sales s where sale_date between ${start}::date and ${end}::date order by s.created_at desc limit 200`,
        db`select id, name, stock from products where active and stock > 0 order by name`,
      ]);
      return respond({ sales, products });
    }

    ownerOnly(account);
    if (view === "expenses") {
      return respond({
        expenses:
          await db`select id, expense_date::text, description, category, amount_cents, payment_method, notes
        from expenses where expense_date between ${start}::date and ${end}::date order by expense_date desc, created_at desc`,
      });
    }
    if (view === "overview") {
      const [daily, totals, spending, lowStock] = await db.transaction([
        db`select to_char(sale_date, 'DD/MM') as "day", sum(total_cents)::bigint revenue
          from sales where status='concluida' and sale_date between ${start}::date and ${end}::date
          group by sale_date order by sale_date`,
        db`select count(*) filter (where status='concluida') completed, count(*) filter (where status='pendente') pending,
          coalesce(sum(total_cents) filter (where status='concluida'),0) revenue,
          coalesce(sum((select sum(si.quantity::bigint * si.unit_cost_cents) from sale_items si where si.sale_id=s.id))
            filter (where status='concluida'),0) cost
          from sales s where sale_date between ${start}::date and ${end}::date`,
        db`select category, sum(amount_cents)::bigint amount from expenses
          where expense_date between ${start}::date and ${end}::date group by category order by amount desc`,
        db`select id,name,stock,min_stock from products where active and stock <= min_stock order by stock, name limit 25`,
      ]);
      return respond({ daily, totals: totals?.[0], spending, lowStock });
    }
    throw new PanelError("Área não encontrada.", 404);
  } catch (error) {
    return handleError(error);
  }
}

export async function postAdmin(request: Request) {
  try {
    const data = await jsonObject(request, 2_520_000);
    const action = data["action"];
    if (action === "login") {
      const cookie = await login(usernameFrom(data["username"]), data["password"]);
      return respond({ ok: true }, 200, { "set-cookie": cookie });
    }
    if (action === "logout") {
      await logout(request);
      return respond({ ok: true }, 200, { "set-cookie": sessionCookie() });
    }
    const account = await readAccount(request);
    if (!account) throw new PanelError("Entre para acessar o painel.", 401);
    if (action === "password") {
      await changePassword(account, data["password"], data["currentPassword"]);
      return respond({ ok: true }, 200, { "set-cookie": sessionCookie() });
    }
    if (account.must_change_password) throw new PanelError("Troque a senha temporária.", 403);

    const db = adminDb();
    if (action === "sale") return respond(await recordSale(db, data, account.username), 201);
    if (action === "sale-status") {
      const status = field(data["status"], 12, true);
      if (!SALE_STATUSES.some((option) => option === status))
        throw new PanelError("Status inválido.");
      await db`select update_gameland_sale(${uuid(data["id"])}::uuid, ${status}, ${account.username})`;
      return respond({ ok: true });
    }
    if (action === "stock") {
      await db`select adjust_gameland_stock(${idFrom(data["id"])}, ${integer(data["stock"], 0, 100_000)}, ${account.username})`;
      return respond({ ok: true });
    }

    ownerOnly(account);
    if (action === "product") return respond(await saveProduct(data, account));
    if (action === "category") return respond(await saveCategory(data));
    if (action === "category-delete") return respond(await deleteCategory(data));
    if (action === "expense") {
      const category = field(data["category"], 60, true);
      if (!EXPENSE_CATEGORIES.some((option) => option === category))
        throw new PanelError("Categoria inválida.");
      await db`insert into expenses (expense_date, description, category, amount_cents, payment_method, notes)
        values (${dateFrom(data["date"])}::date, ${field(data["description"], 180, true)}, ${category},
          ${integer(data["amount"], 1, 100_000_000)}, ${field(data["payment"], 40) || null}, ${field(data["notes"], 400) || null})`;
      return respond({ ok: true }, 201);
    }
    if (action === "member") {
      await db`insert into admin_accounts (username, name, password_hash, role)
        values (${usernameFrom(data["username"])}, ${field(data["name"], 100, true)}, ${await passwordHash(data["password"])}, 'funcionario')`;
      return respond({ ok: true }, 201);
    }
    if (action === "member-access" || action === "member-password") {
      const id = uuid(data["id"]);
      const update =
        action === "member-access"
          ? db`update admin_accounts set active=${data["active"] === true} where id=${id}::uuid and role='funcionario' returning id`
          : db`update admin_accounts set password_hash=${await passwordHash(data["password"])}, must_change_password=true
          where id=${id}::uuid and role='funcionario' returning id`;
      const [updated] = await db.transaction([
        update,
        db`delete from admin_sessions where account_id in (select id from admin_accounts where id=${id}::uuid and role='funcionario')`,
        db`delete from admin_login_attempts where account_id in (select id from admin_accounts where id=${id}::uuid and role='funcionario')`,
      ]);
      if (!updated?.length) throw new PanelError("Funcionário não encontrado.", 404);
      return respond({ ok: true });
    }
    throw new PanelError("Operação inválida.");
  } catch (error) {
    return handleError(error);
  }
}
