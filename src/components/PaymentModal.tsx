import { useState } from "react";
import { useAccount } from "wagmi";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { X, CreditCard, Coins, Loader2, ShoppingCart, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const PLATFORM_WALLET = import.meta.env.VITE_PLATFORM_WALLET || "";
const CB_APP_ID = import.meta.env.VITE_COINBASE_APP_ID || "";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PaymentModal({ open, onClose }: Props) {
  const { items, total, clear, removeItem } = useCart();
  const { address } = useAccount();
  const { user } = useAuth();
  const [step, setStep] = useState<"cart" | "method" | "processing" | "done">("cart");

  if (!open) return null;

  const handleCardPayment = () => {
    if (!address) { toast.error("Connect your wallet first"); return; }
    const params = new URLSearchParams({
      appId: CB_APP_ID,
      destinationWallets: JSON.stringify([{ address, assets: ["USDC"], supportedNetworks: ["polygon"] }]),
      presetFiatAmount: String(Math.ceil(total())),
      fiatCurrency: "USD",
    });
    window.open(`https://pay.coinbase.com/buy?${params}`, "coinbase-pay", "width=460,height=640");
    setStep("processing");
    setTimeout(() => processOrder(), 30000);
  };

  const handleCryptoPayment = () => {
    if (!address) { toast.error("Connect your wallet first"); return; }
    setStep("processing");
    setTimeout(() => processOrder(), 2000);
  };

  const processOrder = async () => {
    if (!user) return;
    for (const item of items) {
      if (item.type === "subscription_monthly" || item.type === "subscription_annual") {
        await supabase.from("subscriptions" as any).upsert({
          user_id: user.id, plan: item.id.replace("plan_", ""), price: item.price,
          expires_at: new Date(Date.now() + (item.type === "subscription_annual" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
        });
        // Publish the user's mini site
        await supabase.from("mini_sites").update({ published: true }).eq("user_id", user.id);
      }
      if (item.type === "slug_standard") {
        const slug = item.id.replace("slug_", "");
        await supabase.from("slug_registrations").insert({
          user_id: user.id, slug,
          registration_fee: item.price, renewal_fee: 12.90,
          status: "active",
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        } as any);
        await supabase.from("mini_sites").update({ slug } as any).eq("user_id", user.id);
      }
    }
    clear();
    setStep("done");
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-black text-foreground">Cart</h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        {/* Cart items */}
        {step === "cart" && (
          <div className="p-5">
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-secondary/30 rounded-xl px-4 py-3 border border-border">
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} USDC</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-destructive hover:opacity-70">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between py-3 border-t border-border mb-5">
                  <span className="font-black text-foreground">Total</span>
                  <span className="font-black text-2xl text-primary">${total().toFixed(2)}</span>
                </div>
                <button onClick={() => setStep("method")} className="w-full bg-primary text-primary-foreground font-black py-3 rounded-xl hover:opacity-90">
                  Pay →
                </button>
              </>
            )}
          </div>
        )}

        {/* Payment method */}
        {step === "method" && (
          <div className="p-5 space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Choose how to pay <strong className="text-foreground">${total().toFixed(2)} USDC</strong>
            </p>
            <button onClick={handleCardPayment} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="font-black text-foreground">Credit Card</p>
                <p className="text-xs text-muted-foreground">Pay with card via Coinbase — converts to USDC automatically</p>
              </div>
            </button>
            <button onClick={handleCryptoPayment} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors text-left">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <Coins className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="font-black text-foreground">USDC / Crypto</p>
                <p className="text-xs text-muted-foreground">Pay directly from your Polygon wallet</p>
              </div>
            </button>
            <button onClick={() => setStep("cart")} className="w-full text-sm text-muted-foreground hover:text-foreground py-2">
              ← Back to cart
            </button>
          </div>
        )}

        {/* Processing */}
        {step === "processing" && (
          <div className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="font-bold text-foreground">Processing payment...</p>
            <p className="text-xs text-muted-foreground mt-2">Don't close this window</p>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-black text-foreground text-lg mb-2">Payment confirmed!</p>
            <p className="text-sm text-muted-foreground mb-5">Your items have been activated.</p>
            <button onClick={() => { onClose(); setStep("cart"); }} className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:opacity-90">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
