import { useState } from "react";
import { useCart } from "@/store/useCart";
import { Check, Crown, Building2 } from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
    monthly: 29.90,
    annual: 239.90,
    popular: true,
    features: [
      "Mini sites ilimitados",
      "1 slug padrão grátis",
      "Links ilimitados",
      "Vídeos com paywall",
      "CV desbloqueável",
      "Galeria de fotos",
      "Imóveis e Carros",
      "Analytics detalhado",
      "Sem marca d'água",
    ],
  },
  {
    id: "business",
    name: "Business",
    icon: Building2,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    monthly: 99.90,
    annual: 799.90,
    features: [
      "Tudo do Pro",
      "10 slugs premium inclusos",
      "Domínio próprio",
      "Admin multi-sites",
      "API access",
      "Suporte prioritário",
      "White label",
    ],
  },
];

export default function SubscriptionPlans() {
  const [annual, setAnnual] = useState(false);
  const { addItem, addItemAndOpen, items } = useCart();

  const handleAdd = (plan: typeof PLANS[0]) => {
    const price = annual ? plan.annual : plan.monthly;
    const type = annual ? "subscription_annual" : "subscription_monthly";
    const already = items.find((i) => i.id === `plan_${plan.id}`);
    if (already) { toast.info("Plano já está no carrinho"); return; }
    addItemAndOpen({
      id: `plan_${plan.id}`,
      type,
      label: `Plano ${plan.name} ${annual ? "(Anual)" : "(Mensal)"}`,
      price,
    });
  };

  const saving = (plan: typeof PLANS[0]) =>
    Math.round(100 - (plan.annual / (plan.monthly * 12)) * 100);

  return (
    <div className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-center text-foreground mb-2">Planos e Preços</h2>
        <p className="text-center text-muted-foreground mb-6">Escolha o plano ideal para você</p>

        {/* Toggle mensal/anual */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-sm font-bold ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Mensal</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-colors ${annual ? "bg-primary" : "bg-secondary"}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${annual ? "left-8" : "left-1"}`} />
          </button>
          <span className={`text-sm font-bold ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            Anual <span className="text-green-500 text-xs ml-1">até 33% off</span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const price = annual ? plan.annual : plan.monthly;
            const inCart = items.find((i) => i.id === `plan_${plan.id}`);

            return (
              <div
                key={plan.id}
                className={`relative bg-card border-2 ${plan.popular ? "border-primary" : "border-border"} rounded-2xl p-6 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-black px-4 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}

                <div className={`w-12 h-12 ${plan.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${plan.color}`} />
                </div>

                <h3 className="text-xl font-black text-foreground mb-1">{plan.name}</h3>

                <div className="mb-1">
                  <span className="text-4xl font-black text-foreground">${price.toFixed(2)}</span>
                  <span className="text-muted-foreground text-sm ml-1">{annual ? "/ano" : "/mês"}</span>
                </div>

                {annual && (
                  <p className="text-green-500 text-xs font-bold mb-4">
                    Economize {saving(plan)}% vs mensal
                  </p>
                )}

                <ul className="space-y-2 flex-1 mb-6 mt-2">
                  {(t(`plans.${plan.id}.features`, { returnObjects: true }) as string[]).map((f: string) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleAdd(plan)}
                  className={`w-full py-3 rounded-xl font-black text-sm transition-opacity ${
                    inCart
                      ? "bg-green-500/10 text-green-500 border border-green-500/30"
                      : plan.popular
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-secondary text-foreground hover:bg-secondary/70"
                  }`}
                >
                  {inCart ? "✓ No carrinho" : "Adicionar ao carrinho"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
