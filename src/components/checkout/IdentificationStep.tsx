import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { UserRound, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckout } from "@/features/checkout/CheckoutProvider";
import { customerSchema, maskPhone, type CustomerFormValues } from "@/features/checkout/schemas";
import { CustomerService } from "@/services/CustomerService";

/** Kero Mais — Etapa 1: identificação (cliente cadastrado ou visitante) */
export function IdentificationStep() {
  const { customer, setCustomer, next, isAuthenticated } = useCheckout();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: customer?.name ?? "", phone: customer?.phone ?? "", email: customer?.email ?? "" },
    mode: "onTouched",
  });

  React.useEffect(() => {
    if (!isAuthenticated || customer) return;
    void CustomerService.getCurrent().then((found) => {
      if (!found) return;
      form.reset({ name: found.name, phone: maskPhone(found.phone), email: found.email ?? "" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const onSubmit = form.handleSubmit((values) => {
    setCustomer({ name: values.name, phone: values.phone, email: values.email || undefined });
    next();
  });

  const errors = form.formState.errors;

  return (
    <section aria-labelledby="identificacao-title" className="space-y-6">
      <header className="space-y-1">
        <h2 id="identificacao-title" className="font-display text-h4 font-extrabold">
          Quem está pedindo?
        </h2>
        <p className="text-small text-muted-foreground">
          Precisamos apenas do essencial para avisar quando o pedido sair.
        </p>
      </header>

      {!isAuthenticated ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-muted/40 p-4">
          <p className="flex items-center gap-2 text-small">
            <UserRound className="size-4 text-primary" aria-hidden="true" />
            Você está continuando como visitante.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/auth">
              <LogIn /> Já tenho cadastro
            </Link>
          </Button>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...form.register("name")} />
          {errors.name ? <p className="text-caption text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone (WhatsApp)</Label>
          <Input
            id="phone"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            aria-invalid={!!errors.phone}
            {...form.register("phone", {
              onChange: (e) => form.setValue("phone", maskPhone(e.target.value)),
            })}
          />
          {errors.phone ? <p className="text-caption text-destructive">{errors.phone.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail (opcional)</Label>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...form.register("email")} />
          {errors.email ? <p className="text-caption text-destructive">{errors.email.message}</p> : null}
        </div>

        <Button type="submit" size="lg" className="w-full">
          Continuar
        </Button>
      </form>
    </section>
  );
}
