import { useEffect, useRef, useState } from "react";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import type { Category } from "@/lib/products";

import {
  control,
  Feedback,
  Field,
  Form,
  mutate,
  Panel,
  primary,
  readPhoto,
  secondary,
  textField,
  usePanel,
} from "./panel-ui";

type Entry = Category & { productCount: number };

function CategoryEditor({ category, done }: { category: Entry | null; done: () => void }) {
  const [image, setImage] = useState(category?.image ?? "");
  return (
    <Form
      submit={category ? "Salvar categoria" : "Cadastrar categoria"}
      onDone={done}
      onSave={async (data) =>
        mutate({
          action: "category",
          id: category?.id,
          label: textField(data, "label"),
          tagline: textField(data, "tagline"),
          position: Number(data.get("position")),
          image: textField(data, "image"),
          photo: await readPhoto(data),
        })
      }
    >
      <Field label="Nome da categoria">
        <input
          className={control}
          name="label"
          required
          maxLength={60}
          defaultValue={category?.label}
        />
      </Field>
      <Field label="Descrição curta">
        <input
          className={control}
          name="tagline"
          maxLength={120}
          defaultValue={category?.tagline}
        />
      </Field>
      <Field label="Ordem na vitrine (menor aparece primeiro)">
        <input
          className={control}
          name="position"
          type="number"
          min="0"
          max="10000"
          required
          defaultValue={category?.position ?? 100}
        />
      </Field>
      {category?.image && image === category.image && (
        <div className="flex flex-wrap items-center gap-3">
          <img
            src={category.image}
            alt="Foto atual da categoria"
            className="size-20 rounded-lg border border-border object-cover"
          />
          <button className={secondary} type="button" onClick={() => setImage("")}>
            Remover foto atual
          </button>
        </div>
      )}
      <Field label="Endereço da foto">
        <input
          className={control}
          name="image"
          maxLength={450}
          value={image}
          onChange={(event) => setImage(event.target.value)}
          placeholder="https://…"
        />
      </Field>
      <Field label="Enviar ou trocar foto (JPG, PNG ou WebP até 1,8 MB)">
        <input
          className={control}
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
      </Field>
    </Form>
  );
}

function CategoryRemoval({
  category,
  options,
  done,
}: {
  category: Entry;
  options: Entry[];
  done: () => void;
}) {
  return (
    <Form
      submit="Confirmar remoção"
      onDone={done}
      onSave={(data) =>
        mutate({
          action: "category-delete",
          id: category.id,
          destination: textField(data, "destination"),
        })
      }
    >
      {category.productCount > 0 ? (
        <Field label={`Mover ${category.productCount} produto(s) para`}>
          <select className={control} name="destination" required defaultValue="">
            <option value="" disabled>
              Escolha a categoria de destino
            </option>
            {options.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <p className="text-sm text-muted-foreground">
          A categoria e sua foto serão removidas da vitrine.
        </p>
      )}
    </Form>
  );
}

export function CategoriesPanel() {
  const query = usePanel<{ categories: Entry[] }>("categories");
  const client = useQueryClient();
  const [selection, setSelection] = useState<{
    mode: "new" | "edit" | "remove";
    category: Entry | null;
  } | null>(null);
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selection) editor.current?.focus();
  }, [selection]);
  function done() {
    setSelection(null);
    void client.invalidateQueries({ queryKey: ["admin"] });
  }
  if (!query.data) return <Feedback error={query.error} loading={query.isPending} />;
  const categories = query.data.categories;
  const selected = selection?.category ?? null;
  const alternatives = categories.filter((category) => category.id !== selected?.id);

  return (
    <div
      className={
        selection
          ? "grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]"
          : "max-w-4xl"
      }
    >
      <Panel
        title="Categorias da vitrine"
        description="Organize as seções que os clientes veem na loja."
      >
        <button
          type="button"
          className={primary}
          onClick={() => setSelection({ mode: "new", category: null })}
        >
          <Plus size={17} /> Nova categoria
        </button>
        {categories.length ? (
          <ul className="mt-4 divide-y divide-border">
            {categories.map((category) => (
              <li key={category.id} className="flex flex-wrap items-center gap-3 py-4">
                {category.image ? (
                  <img
                    src={category.image}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                    className="size-14 rounded-lg object-cover"
                  />
                ) : (
                  <span className="grid size-14 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <ImageIcon size={20} aria-hidden />
                  </span>
                )}
                <div className="min-w-32 flex-1">
                  <p className="break-words font-medium">{category.label}</p>
                  {category.tagline && (
                    <p className="break-words text-sm text-muted-foreground">{category.tagline}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {category.productCount} produto(s) · ordem {category.position}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={secondary}
                    aria-label={`Editar ${category.label}`}
                    onClick={() => setSelection({ mode: "edit", category })}
                  >
                    <Pencil size={15} /> Editar
                  </button>
                  <button
                    type="button"
                    className={secondary}
                    aria-label={`Remover ${category.label}`}
                    onClick={() => setSelection({ mode: "remove", category })}
                  >
                    <Trash2 size={15} /> Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>
        )}
      </Panel>
      {selection && (
        <div ref={editor} tabIndex={-1} className="scroll-mt-6 outline-none">
          <Panel
            title={
              selection.mode === "new"
                ? "Nova categoria"
                : selection.mode === "edit"
                  ? `Editar ${selected?.label}`
                  : `Remover ${selected?.label}`
            }
          >
            <div className="mb-4">
              <button className={secondary} type="button" onClick={() => setSelection(null)}>
                Voltar à lista
              </button>
            </div>
            {selection.mode === "remove" && selected ? (
              selected.productCount && !alternatives.length ? (
                <p className="text-sm text-muted-foreground">
                  Cadastre outra categoria para mover os produtos antes de remover esta.
                </p>
              ) : (
                <CategoryRemoval
                  key={selected.id}
                  category={selected}
                  options={alternatives}
                  done={done}
                />
              )
            ) : (
              <CategoryEditor key={selected?.id ?? "new"} category={selected} done={done} />
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
