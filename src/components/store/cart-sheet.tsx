import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { buildWhatsAppMessage, buildWhatsAppUrl, formatBRL, type CustomerInfo } from "@/lib/cart";
import type { Product } from "@/lib/products";
import { STORE } from "@/lib/store-config";
import { cn } from "@/lib/utils";

import { useCart } from "./cart-provider";

export function CartSheet({ products }: { products: Product[] }) {
  const { items, total, isOpen, setOpen, setQuantity, remove, clear } = useCart();
  const [name, setName] = useState("");
  const [delivery, setDelivery] = useState<CustomerInfo["delivery"]>("retirada");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function checkout() {
    if (!name.trim()) return setError("Digite seu nome para enviar o pedido.");
    if (delivery === "entrega" && !address.trim())
      return setError("Informe o endereço de entrega.");
    setError("");
    const message = buildWhatsAppMessage(items, { name, delivery, address, note });
    window.open(buildWhatsAppUrl(STORE.whatsappNumber, message), "_blank", "noopener");
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5 text-left">
          <SheetTitle className="font-display text-2xl uppercase tracking-wider">
            Seu carrinho
          </SheetTitle>
          <SheetDescription>Revise os itens e finalize o pedido pelo WhatsApp.</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBag className="size-12 text-muted-foreground" />
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Button onClick={() => setOpen(false)} variant="outline">
              Continuar comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-border">
                {items.map((item) => {
                  const product = products.find((entry) => entry.id === item.id);
                  return (
                    <li key={item.id} className="flex gap-3 p-4">
                      {product && (
                        <img
                          src={product.image}
                          alt=""
                          className="size-16 shrink-0 rounded-md object-cover"
                        />
                      )}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{formatBRL(item.price)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Diminuir quantidade"
                            onClick={() => setQuantity(item.id, item.quantity - 1)}
                            className="grid size-7 place-items-center rounded border border-border hover:border-primary"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Aumentar quantidade"
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            className="grid size-7 place-items-center rounded border border-border hover:border-primary"
                          >
                            <Plus className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remover ${item.name}`}
                            onClick={() => remove(item.id)}
                            className="ml-auto text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-4 border-t border-border p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cart-name">Seu nome</Label>
                  <Input
                    id="cart-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como devemos te chamar?"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Como quer receber?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["retirada", "entrega"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDelivery(opt)}
                        className={cn(
                          "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                          delivery === opt
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {opt === "retirada" ? "Retirar na loja" : "Entrega"}
                      </button>
                    ))}
                  </div>
                </div>
                {delivery === "entrega" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="cart-address">Endereço</Label>
                    <Textarea
                      id="cart-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, número, bairro e cidade"
                      rows={2}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="cart-note">Observação (opcional)</Label>
                  <Input
                    id="cart-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ex.: quero parcelar, troca de console..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-bold text-primary">
                  {formatBRL(total)}
                </span>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={checkout}
                className="h-12 w-full bg-whatsapp text-base font-semibold text-whatsapp-foreground hover:bg-whatsapp/90"
              >
                Finalizar pelo WhatsApp
              </Button>
              <button
                type="button"
                onClick={clear}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Esvaziar carrinho
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
