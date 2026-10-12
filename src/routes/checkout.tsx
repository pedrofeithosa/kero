import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Button } from "@/components/ui/button";
import { CheckoutProvider, useCheckout } from "@/features/checkout/CheckoutProvider";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { StoreStatusBanner } from "@/components/checkout/StoreStatusBanner";
import { IdentificationStep } from "@/components/checkout/IdentificationStep";
import { DeliveryStep } from "@/components/checkout/DeliveryStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { ReviewStep } from "@/components/checkout/ReviewStep";
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Finalize seu pedido | Kero Mais" },
      { name: "description", content: "Identificação, entrega, pagamento e confirmação em menos de 60 segundos." },
      { property: "og:title", content: "Checkout — Kero Mais" },
      { property: "og:description", content: "Finalize seu pedido Kero Mais em poucos passos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutBody() {
  const { step, isEmpty } = useCheckout();

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-20 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="size-7" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-h3 font-extrabold">Seu carrinho está vazio</h1>
          <p className="mt-2 text-small text-muted-foreground">
            Adicione itens do cardápio para finalizar um pedido.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/cardapio">Ver cardápio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:py-12">
      <SectionTitle eyebrow="Pedido" title="Finalizar compra" />
      <StepIndicator />
      <StoreStatusBanner />
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          {step === 0 ? <IdentificationStep /> : null}
          {step === 1 ? <DeliveryStep /> : null}
          {step === 2 ? <PaymentStep /> : null}
          {step === 3 ? <ReviewStep /> : null}
        </div>
        <OrderSummaryCard />
      </div>
    </div>
  );
}

function CheckoutPage() {
  return (
    <PublicShell>
      <CheckoutProvider>
        <CheckoutBody />
      </CheckoutProvider>
    </PublicShell>
  );
}
