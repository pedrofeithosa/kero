import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bike, Store, Loader2, MapPin, AlertTriangle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/components/ui/price-tag";
import { cn } from "@/lib/utils";
import { useCheckout } from "@/features/checkout/CheckoutProvider";
import { addressSchema, maskZip, type AddressFormValues } from "@/features/checkout/schemas";
import { useAddress } from "@/features/checkout/hooks/useAddress";
import { DeliveryService, type StreetSuggestion } from "@/services/DeliveryService";
import { ADDRESS_LINE, BUSINESS } from "@/lib/business";

/** Kero Mais — Etapa 2: entrega ou retirada + endereço */
export function DeliveryStep() {
  const {
    deliveryType,
    setDeliveryType,
    address,
    setAddress,
    setAddressId,
    saveAddress,
    setSaveAddress,
    isAuthenticated,
    area,
    isCheckingArea,
    summary,
    next,
    back,
  } = useCheckout();

  const { addresses, lookupZip, isLookingUp, isLoading } = useAddress();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      zip: address?.zip ?? "",
      street: address?.street ?? "",
      number: address?.number ?? "",
      complement: address?.complement ?? "",
      district: address?.district ?? "",
      // A Kero Mais só entrega em Pedreira/SP: já vem preenchido (o cliente pode alterar).
      city: address?.city ?? BUSINESS.address.city,
      state: address?.state ?? BUSINESS.address.state,
      reference: address?.reference ?? "",
    },
    mode: "onTouched",
  });
  const errors = form.formState.errors;

  // Sugestões de rua enquanto o cliente digita (só aparecem depois que ele começa a digitar).
  const [suggestions, setSuggestions] = React.useState<StreetSuggestion[]>([]);
  const [suggestOpen, setSuggestOpen] = React.useState(false);
  const streetValue = form.watch("street");
  const cityValue = form.watch("city");
  const stateValue = form.watch("state");

  React.useEffect(() => {
    const q = (streetValue ?? "").trim();
    if (!suggestOpen || q.length < 3) {
      setSuggestions([]);
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      void DeliveryService.searchStreets(
        q,
        (cityValue || BUSINESS.address.city).trim(),
        (stateValue || BUSINESS.address.state).trim().toUpperCase(),
      ).then((found) => {
        if (active) setSuggestions(found);
      });
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [streetValue, cityValue, stateValue, suggestOpen]);

  const pickStreet = (s: StreetSuggestion) => {
    form.setValue("street", s.street, { shouldValidate: true });
    if (s.district) form.setValue("district", s.district, { shouldValidate: true });
    form.setValue("city", s.city, { shouldValidate: true });
    form.setValue("state", s.state, { shouldValidate: true });
    if (s.zip.length === 8) form.setValue("zip", maskZip(s.zip), { shouldValidate: true });
    setSuggestOpen(false);
    setSuggestions([]);
    setAddress({ ...(form.getValues() as AddressFormValues) } as never);
    document.getElementById("number")?.focus();
  };

  const handleZipBlur = async (value: string) => {
    const found = await lookupZip(value);
    if (!found) return;
    form.setValue("street", found.street ?? "");
    form.setValue("district", found.district ?? "");
    form.setValue("city", found.city ?? "");
    form.setValue("state", found.state ?? "");
    setAddress({ ...(form.getValues() as AddressFormValues), ...found } as never);
  };

  const onSubmit = form.handleSubmit((values) => {
    setAddress(values);
    next();
  });

  const blocked = deliveryType === "delivery" && area && !area.available;

  return (
    <section aria-labelledby="entrega-title" className="space-y-6">
      <header className="space-y-1">
        <h2 id="entrega-title" className="font-display text-h4 font-extrabold">
          Como você quer receber?
        </h2>
        <p className="text-small text-muted-foreground">Entregamos rápido ou você retira no balcão.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Tipo de pedido">
        {(
          [
            { id: "delivery", label: "Entrega", desc: "Levamos até você", icon: Bike },
            { id: "pickup", label: "Retirada no balcão", desc: "Pronto em ~20 min", icon: Store },
          ] as const
        ).map((option) => {
          const active = deliveryType === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setDeliveryType(option.id)}
              className={cn(
                "flex items-center gap-3 rounded-card border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
              )}
            >
              <option.icon className={cn("size-6", active ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
              <span>
                <span className="block font-display font-bold">{option.label}</span>
                <span className="block text-caption text-muted-foreground">{option.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {deliveryType === "pickup" ? (
        <div className="space-y-6">
          <div className="rounded-card border border-border bg-muted/40 p-4">
            <p className="flex items-center gap-2 font-display font-bold">
              <MapPin className="size-4 text-primary" aria-hidden="true" /> {BUSINESS.name} — {ADDRESS_LINE}
            </p>
            <p className="mt-1 text-small text-muted-foreground">
              Sem taxa de entrega. Retirada estimada em 20 minutos após a confirmação.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={back} className="flex-1">
              Voltar
            </Button>
            <Button size="lg" className="flex-1" onClick={next}>
              Continuar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {isAuthenticated && addresses.length > 0 ? (
            <div className="space-y-2">
              <p className="font-display text-small font-bold">Endereços salvos</p>
              <div className="grid gap-2">
                {addresses.map((saved) => (
                  <button
                    key={saved.id}
                    type="button"
                    onClick={() => {
                      form.reset({
                        zip: saved.zip,
                        street: saved.street,
                        number: saved.number,
                        complement: saved.complement ?? "",
                        district: saved.district,
                        city: saved.city,
                        state: saved.state,
                        reference: saved.reference ?? "",
                      });
                      setAddressId(saved.id);
                      setAddress({ ...saved });
                    }}
                    className="flex items-center justify-between gap-3 rounded-card border border-border p-3 text-left text-small hover:border-primary/50"
                  >
                    <span>
                      {saved.street}, {saved.number} — {saved.district}
                    </span>
                    {saved.is_favorite ? (
                      <Badge variant="new">
                        <Star className="size-3" aria-hidden="true" /> Favorito
                      </Badge>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {isLoading ? null : null}

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <div className="space-y-2">
                <Label htmlFor="zip">CEP</Label>
                <div className="relative">
                  <Input
                    id="zip"
                    inputMode="numeric"
                    placeholder="00000-000"
                    aria-invalid={!!errors.zip}
                    {...form.register("zip", {
                      onChange: (e) => form.setValue("zip", maskZip(e.target.value)),
                      onBlur: (e) => void handleZipBlur(e.target.value),
                    })}
                  />
                  {isLookingUp ? (
                    <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />
                  ) : null}
                </div>
                {errors.zip ? <p className="text-caption text-destructive">{errors.zip.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Rua</Label>
                <div className="relative">
                  <Input
                    id="street"
                    autoComplete="off"
                    aria-invalid={!!errors.street}
                    aria-expanded={suggestOpen && suggestions.length > 0}
                    aria-controls="street-suggestions"
                    placeholder="Digite o nome da rua"
                    {...form.register("street", {
                      onChange: () => setSuggestOpen(true),
                      onBlur: () => setTimeout(() => setSuggestOpen(false), 150),
                    })}
                  />
                  {suggestOpen && suggestions.length > 0 ? (
                    <ul
                      id="street-suggestions"
                      role="listbox"
                      aria-label="Ruas encontradas"
                      className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-card border border-border bg-card shadow-card"
                    >
                      {suggestions.map((s) => (
                        <li key={`${s.street}-${s.district}`} role="option" aria-selected="false">
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pickStreet(s)}
                            className="flex w-full flex-col px-3 py-2 text-left text-small hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                          >
                            <span className="font-semibold">{s.street}</span>
                            <span className="text-caption text-muted-foreground">
                              {s.district ? `${s.district} · ` : ""}
                              {s.city}/{s.state}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {errors.street ? <p className="text-caption text-destructive">{errors.street.message}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input id="number" inputMode="numeric" aria-invalid={!!errors.number} {...form.register("number")} />
                {errors.number ? <p className="text-caption text-destructive">{errors.number.message}</p> : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="complement">Complemento (opcional)</Label>
                <Input id="complement" {...form.register("complement")} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_6rem]">
              <div className="space-y-2">
                <Label htmlFor="district">Bairro</Label>
                <Input
                  id="district"
                  aria-invalid={!!errors.district}
                  {...form.register("district", {
                    onBlur: (e) =>
                      setAddress({ ...(form.getValues() as AddressFormValues), district: e.target.value } as never),
                  })}
                />
                {errors.district ? <p className="text-caption text-destructive">{errors.district.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" aria-invalid={!!errors.city} {...form.register("city")} />
                {errors.city ? <p className="text-caption text-destructive">{errors.city.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">UF</Label>
                <Input id="state" maxLength={2} aria-invalid={!!errors.state} {...form.register("state")} />
                {errors.state ? <p className="text-caption text-destructive">{errors.state.message}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Ponto de referência (opcional)</Label>
              <Input id="reference" placeholder="Portão azul, ao lado da padaria" {...form.register("reference")} />
            </div>

            {isAuthenticated ? (
              <label className="flex items-center gap-3 text-small">
                <Checkbox checked={saveAddress} onCheckedChange={(v) => setSaveAddress(Boolean(v))} />
                Salvar este endereço na minha conta
              </label>
            ) : null}

            <div aria-live="polite" className="space-y-2">
              {isCheckingArea ? (
                <p className="flex items-center gap-2 text-small text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Consultando área de entrega…
                </p>
              ) : null}
              {blocked ? (
                <p className="flex items-center gap-2 rounded-card border border-destructive/40 bg-destructive/10 p-3 text-small text-destructive">
                  <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
                  {area?.reason ?? "Ainda não entregamos neste bairro."}
                </p>
              ) : null}
              {area?.available ? (
                <p className="rounded-card border border-success/40 bg-success/10 p-3 text-small text-success">
                  Entregamos em {area.district}! Taxa {summary.deliveryFee === 0 ? "grátis" : formatPrice(summary.deliveryFee)} · {area.eta_minutes} min
                  {summary.belowMinimum
                    ? ` · Pedido mínimo ${formatPrice(summary.minOrderTotal)}`
                    : ""}
                </p>
              ) : null}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" size="lg" onClick={back} className="flex-1">
                Voltar
              </Button>
              <Button type="submit" size="lg" className="flex-1" disabled={Boolean(blocked) || summary.belowMinimum}>
                Continuar
              </Button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
