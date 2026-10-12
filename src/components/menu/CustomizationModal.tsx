import * as React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { formatPrice } from "@/components/ui/price-tag";
import { PromotionBadge } from "./PromotionBadge";
import type { MenuOptionGroup, MenuProduct, SelectedOption } from "@/features/menu/types";

const MAX_NOTES = 200;

interface CustomizationModalProps {
  product: MenuProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    product: MenuProduct;
    options: SelectedOption[];
    notes: string;
    quantity: number;
  }) => void;
}

type Selection = Record<string, string[]>;

function initialSelection(product: MenuProduct | null): Selection {
  if (!product) return {};
  const sel: Selection = {};
  for (const group of product.optionGroups) {
    sel[group.id] =
      group.type === "single" && group.required && group.options[0]
        ? [group.options[0].id]
        : [];
  }
  return sel;
}

/** Kero Mais — Modal de personalização do produto */
export function CustomizationModal({
  product,
  open,
  onOpenChange,
  onConfirm,
}: CustomizationModalProps) {
  const [selection, setSelection] = React.useState<Selection>({});
  const [notes, setNotes] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (open && product) {
      setSelection(initialSelection(product));
      setNotes("");
      setQuantity(1);
    }
  }, [open, product]);

  const selectedOptions: SelectedOption[] = React.useMemo(() => {
    if (!product) return [];
    return product.optionGroups.flatMap((group) =>
      (selection[group.id] ?? []).flatMap((optionId) => {
        const option = group.options.find((o) => o.id === optionId);
        return option
          ? [{ groupId: group.id, optionId, name: option.name, priceDelta: option.priceDelta }]
          : [];
      }),
    );
  }, [product, selection]);

  const unitPrice = (product?.price ?? 0) + selectedOptions.reduce((s, o) => s + o.priceDelta, 0);
  const totalPrice = unitPrice * quantity;

  const missingGroup = product?.optionGroups.find((g) => {
    const count = (selection[g.id] ?? []).length;
    const min = g.required ? Math.max(1, g.min ?? 1) : (g.min ?? 0);
    return count < min;
  });

  const toggleOption = (group: MenuOptionGroup, optionId: string) => {
    setSelection((prev) => {
      const current = prev[group.id] ?? [];
      if (group.type === "single") return { ...prev, [group.id]: [optionId] };
      if (current.includes(optionId)) {
        return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
      }
      if (group.max != null && current.length >= group.max) return prev;
      return { ...prev, [group.id]: [...current, optionId] };
    });
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden rounded-modal p-0 sm:max-w-2xl">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="h-44 w-full object-cover sm:h-56"
          />
          <div className="absolute left-4 top-4">
            <PromotionBadge product={product} />
          </div>
        </div>

        <div className="max-h-[46vh] overflow-y-auto px-6 py-5 sm:max-h-[48vh]">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-h4 font-extrabold">
              {product.name}
            </DialogTitle>
            <DialogDescription className="text-small">{product.description}</DialogDescription>
          </DialogHeader>
          {product.ingredients.length > 0 ? (
            <p className="mt-3 text-small">
              <span className="font-semibold">Ingredientes: </span>
              <span className="text-muted-foreground">{product.ingredients.join(", ")}</span>
            </p>
          ) : null}

          <div className="mt-6 space-y-7">
            {product.optionGroups.map((group) => {
              const current = selection[group.id] ?? [];
              const reachedMax = group.max != null && current.length >= group.max;
              return (
                <fieldset key={group.id} className="space-y-3">
                  <legend className="flex w-full items-center justify-between gap-3">
                    <span className="font-display text-h6 font-bold">{group.name}</span>
                    <span className="text-caption font-semibold uppercase text-muted-foreground">
                      {group.required ? "Obrigatório" : "Opcional"}
                    </span>
                  </legend>
                  {group.description ? (
                    <p className="text-small text-muted-foreground">{group.description}</p>
                  ) : null}

                  {group.type === "single" ? (
                    <RadioGroup
                      value={current[0] ?? ""}
                      onValueChange={(v) => toggleOption(group, v)}
                      className="gap-2"
                    >
                      {group.options.map((option) => (
                        <Label
                          key={option.id}
                          htmlFor={`${group.id}-${option.id}`}
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-button border border-border px-4 py-3 transition-colors hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                        >
                          <span className="flex items-center gap-3">
                            <RadioGroupItem
                              id={`${group.id}-${option.id}`}
                              value={option.id}
                            />
                            <span className="text-small font-semibold">{option.name}</span>
                          </span>
                          {option.priceDelta > 0 ? (
                            <span className="text-small font-bold text-primary">
                              + {formatPrice(option.priceDelta)}
                            </span>
                          ) : null}
                        </Label>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.options.map((option) => {
                        const checked = current.includes(option.id);
                        return (
                          <Label
                            key={option.id}
                            htmlFor={`${group.id}-${option.id}`}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-button border border-border px-4 py-3 transition-colors hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                          >
                            <span className="flex items-center gap-3">
                              <Checkbox
                                id={`${group.id}-${option.id}`}
                                checked={checked}
                                disabled={!checked && reachedMax}
                                onCheckedChange={() => toggleOption(group, option.id)}
                              />
                              <span className="text-small font-semibold">{option.name}</span>
                            </span>
                            {option.priceDelta > 0 ? (
                              <span className="text-small font-bold text-primary">
                                + {formatPrice(option.priceDelta)}
                              </span>
                            ) : null}
                          </Label>
                        );
                      })}
                    </div>
                  )}
                </fieldset>
              );
            })}

            <div className="space-y-2">
              <Label htmlFor="kitchen-notes" className="font-display text-h6 font-bold">
                Observações para a cozinha
              </Label>
              <Textarea
                id="kitchen-notes"
                placeholder="Ex.: capriche no molho, embalar separado..."
                maxLength={MAX_NOTES}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
              <p className="text-right text-caption text-muted-foreground">
                {notes.length}/{MAX_NOTES}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-card px-6 py-4">
          {missingGroup ? (
            <p className="mb-3 flex items-center gap-2 text-caption font-semibold text-destructive">
              <AlertTriangle className="size-4" /> Selecione uma opção em “{missingGroup.name}”
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={20} />
            <Button
              size="lg"
              full
              disabled={Boolean(missingGroup) || product.availability !== "available"}
              onClick={() =>
                onConfirm({ product, options: selectedOptions, notes, quantity })
              }
              className="justify-between sm:flex-1"
            >
              <span>Adicionar ao Carrinho</span>
              <span>{formatPrice(totalPrice)}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
