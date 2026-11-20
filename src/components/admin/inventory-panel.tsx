import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { formatBRL } from "@/lib/cart";
import { centsToInput } from "@/lib/money";
import { categoryLabel, type Category, type CategoryId } from "@/lib/products";

import {
  control,
  day,
  Feedback,
  Field,
  Form,
  mutate,
  Panel,
  price,
  readPhoto,
  secondary,
  textField,
  usePanel,
} from "./panel-ui";

type Product = {
  id: string;
  name: string;
  category: CategoryId;
  stock: number;
  min_stock: number;
  active: boolean;
  price_cents: number;
  image_url: string;
  old_price_cents?: number | null;
  cost_cents?: number;
  condition?: string;
  badge?: string | null;
  featured?: boolean;
  description?: string;
  specs?: string[];
};
type Inventory = {
  categories: Category[];
  products: Product[];
  movements: { created_at: string; name: string; delta: number; reason: string }[];
};

function ProductEditor({
  product,
  categories,
  done,
}: {
  product?: Product | undefined;
  categories: Category[];
  done: () => void;
}) {
  return (
    <Form
      submit={product ? "Salvar produto" : "Cadastrar produto"}
      reset={!product}
      onDone={done}
      onSave={async (data) =>
        mutate({
          action: "product",
          ...(product ? { id: product.id } : { stock: Number(data.get("stock")) }),
          name: textField(data, "name"),
          category: textField(data, "category"),
          condition: textField(data, "condition"),
          price: price(data, "price"),
          oldPrice: price(data, "oldPrice", true),
          cost: price(data, "cost"),
          image: textField(data, "image"),
          photo: await readPhoto(data),
          badge: textField(data, "badge"),
          minStock: Number(data.get("minStock")),
          description: textField(data, "description"),
          specs: textField(data, "specs"),
          featured: data.has("featured"),
          active: data.has("active"),
        })
      }
    >
      <Field label="Nome do produto">
        <input
          className={control}
          name="name"
          required
          maxLength={120}
          defaultValue={product?.name}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Categoria">
          <select className={control} name="category" defaultValue={product?.category}>
            {categories.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Condição">
          <select className={control} name="condition" defaultValue={product?.condition}>
            <option>Novo</option>
            <option>Seminovo</option>
          </select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Preço (R$)">
          <input
            className={control}
            name="price"
            inputMode="decimal"
            required
            defaultValue={centsToInput(product?.price_cents)}
          />
        </Field>
        <Field label="Custo (R$)">
          <input
            className={control}
            name="cost"
            inputMode="decimal"
            required
            defaultValue={centsToInput(product?.cost_cents ?? 0)}
          />
        </Field>
        <Field label="Preço anterior">
          <input
            className={control}
            name="oldPrice"
            inputMode="decimal"
            defaultValue={centsToInput(product?.old_price_cents)}
          />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {!product && (
          <Field label="Estoque inicial">
            <input
              className={control}
              name="stock"
              type="number"
              required
              min="0"
              defaultValue="0"
            />
          </Field>
        )}
        <Field label="Alerta de estoque">
          <input
            className={control}
            name="minStock"
            type="number"
            required
            min="0"
            defaultValue={product?.min_stock ?? 2}
          />
        </Field>
      </div>
      <Field label="Foto JPG, PNG ou WebP (até 1,8 MB)">
        <input
          className={control}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          name="photo"
        />
      </Field>
      <Field label="Endereço da foto">
        <input
          className={control}
          name="image"
          maxLength={450}
          defaultValue={product?.image_url}
          placeholder="https://…"
        />
      </Field>
      <Field label="Descrição">
        <textarea
          className={control}
          name="description"
          rows={3}
          maxLength={1200}
          defaultValue={product?.description}
        />
      </Field>
      <Field label="Especificações (uma por linha)">
        <textarea
          className={control}
          name="specs"
          rows={3}
          maxLength={800}
          defaultValue={product?.specs?.join("\n")}
        />
      </Field>
      <Field label="Etiqueta">
        <input
          className={control}
          name="badge"
          maxLength={40}
          defaultValue={product?.badge ?? ""}
        />
      </Field>
      <div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Na
          vitrine
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Em
          destaque
        </label>
      </div>
    </Form>
  );
}

function StockEditor({ product, done }: { product: Product; done: () => void }) {
  return (
    <Form
      submit="Salvar estoque"
      onDone={done}
      reset={false}
      onSave={(data) =>
        mutate({
          action: "stock",
          id: product.id,
          stock: Number(data.get("stock")),
        })
      }
    >
      <Field label="Quantidade disponível">
        <input
          className={control}
          name="stock"
          type="number"
          required
          min="0"
          max="100000"
          defaultValue={product.stock}
        />
      </Field>
    </Form>
  );
}

export function InventoryPanel({ owner }: { owner: boolean }) {
  const query = usePanel<Inventory>("products");
  const client = useQueryClient();
  const [editing, setEditing] = useState<{ mode: "new" | "product" | "stock"; id?: string } | null>(
    null,
  );
  const [search, setSearch] = useState("");
  function done() {
    setEditing(null);
    void client.invalidateQueries({ queryKey: ["admin"] });
  }
  if (!query.data) return <Feedback error={query.error} loading={query.isPending} />;
  const product = query.data.products.find((item) => item.id === editing?.id);
  const products = query.data.products.filter((item) =>
    item.name.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")),
  );
  return (
    <div className="space-y-5">
      {editing && (
        <Panel
          title={
            editing.mode === "stock"
              ? `Ajustar estoque de ${product?.name ?? ""}`
              : editing.mode === "new"
                ? "Novo produto"
                : `Editar ${product?.name ?? ""}`
          }
        >
          <div className="mb-4">
            <button className={secondary} onClick={() => setEditing(null)}>
              Voltar à lista
            </button>
          </div>
          {editing.mode === "stock" && product ? (
            <StockEditor key={product.id} product={product} done={done} />
          ) : (
            <ProductEditor
              key={product?.id ?? "new"}
              product={product}
              categories={query.data.categories}
              done={done}
            />
          )}
        </Panel>
      )}
      <Panel title="Estoque e catálogo">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Buscar no estoque">
            <input
              className={control}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Field>
          {owner && (
            <button
              className={secondary}
              disabled={!query.data.categories.length}
              onClick={() => {
                setEditing({ mode: "new" });
                window.scrollTo(0, 0);
              }}
            >
              Novo produto
            </button>
          )}
        </div>
        {products.length === 0 && (
          <p className="mt-5 text-sm text-muted-foreground">Nenhum produto encontrado.</p>
        )}
        <ul className="mt-3 divide-y divide-border">
          {products.map((item) => (
            <li className="flex flex-wrap items-center gap-3 py-4" key={item.id}>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  className="size-12 rounded-lg object-cover"
                />
              )}
              <div className="min-w-36 flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {categoryLabel(item.category, query.data.categories)} ·{" "}
                  {formatBRL(item.price_cents)}
                  {!item.active && " · Oculto"}
                </p>
              </div>
              <p
                className={`mr-3 text-sm font-medium ${item.stock <= item.min_stock ? "text-accent" : ""}`}
              >
                {item.stock ? `${item.stock} un.` : "Esgotado"}
              </p>
              <div className="flex gap-2">
                <button
                  className={secondary}
                  onClick={() => {
                    setEditing({ mode: "stock", id: item.id });
                    window.scrollTo(0, 0);
                  }}
                  aria-label={`Ajustar estoque de ${item.name}`}
                >
                  Ajustar
                </button>
                {owner && (
                  <button
                    className={secondary}
                    onClick={() => {
                      setEditing({ mode: "product", id: item.id });
                      window.scrollTo(0, 0);
                    }}
                    aria-label={`Editar ${item.name}`}
                  >
                    Editar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Movimentações recentes">
        {query.data.movements.length ? (
          <ul className="divide-y divide-border">
            {query.data.movements.map((entry, index) => (
              <li
                key={`${entry.created_at}-${index}`}
                className="flex flex-wrap justify-between gap-2 py-2.5 text-sm"
              >
                <span>
                  {entry.name} <span className="text-muted-foreground">· {entry.reason}</span>
                </span>
                <span className="tabular-nums">
                  {day(entry.created_at)} · {entry.delta > 0 ? "+" : ""}
                  {entry.delta} un.
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
        )}
      </Panel>
    </div>
  );
}
