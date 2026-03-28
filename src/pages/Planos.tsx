import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import PaymentModal from "@/components/PaymentModal";
import { useState } from "react";
import { useCart } from "@/store/useCart";
import { ShoppingCart } from "lucide-react";

export default function PlanosPage() {
  const { items, total, isOpen: cartOpen, open: openCart, close: closeCart } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Planos — TrustBank"
        description="Escolha o plano ideal. Mensal ou anual com desconto. Mini sites, slugs premium, imóveis, carros e muito mais."
        path="/planos"
      />
      <Header />

      <SubscriptionPlans />

      {/* Floating cart button */}
      {items.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => openCart()}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl font-black text-sm text-white transition-transform hover:scale-105"
            style={{ background: "hsl(30, 100%, 55%)" }}
          >
            <ShoppingCart className="w-5 h-5" />
            {items.length} {items.length === 1 ? "item" : "itens"} · ${total().toFixed(2)}
          </button>
        </div>
      )}

      <PaymentModal open={cartOpen} onClose={() => closeCart()} />
    </div>
  );
}
