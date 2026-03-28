import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AvatarMenu from "@/components/AvatarMenu";
import WalletButton from "@/components/WalletButton";
import NotificationBell from "@/components/NotificationBell";
import VerificationModal from "@/components/VerificationModal";
import PaymentModal from "@/components/PaymentModal";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useCart } from "@/store/useCart";
import trustbankLogo from "@/assets/trustbank-logo.png";
import { Globe, Briefcase, HelpCircle, ShoppingBag, Crown, Globe2, BadgeCheck, ShoppingCart, Car, Home } from "lucide-react";

const Header = () => {
  const { user } = useAuth();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const { items, isOpen, open, close } = useCart();

  return (
    <>
      <header className="h-14 flex items-center justify-between px-6 sticky top-0 z-50 bg-primary border-b-2 border-accent">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={trustbankLogo} alt="TrustBank" className="h-8 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-primary-foreground font-black text-lg tracking-tight font-mono leading-none">TrustBank</span>
            <span className="text-accent text-[8px] font-mono uppercase tracking-[0.2em] leading-none font-bold">Videos • Mini Sites • Jobs</span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link to="/how-it-works" className="hidden md:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <HelpCircle className="w-3.5 h-3.5" /> How It Works
          </Link>
          <Link to="/marketplace" className="hidden md:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <ShoppingBag className="w-3.5 h-3.5" /> Marketplace
          </Link>
          <Link to="/imoveis" className="hidden md:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <Home className="w-3.5 h-3.5" /> Properties
          </Link>
          <Link to="/carros" className="hidden md:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <Car className="w-3.5 h-3.5" /> Cars
          </Link>
          <Link to="/careers" className="hidden sm:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <Briefcase className="w-3.5 h-3.5" /> Jobs
          </Link>
          <Link to="/slugs" className="hidden lg:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <Crown className="w-3.5 h-3.5" /> Slugs
          </Link>
          <Link to="/domains" className="hidden lg:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <Globe2 className="w-3.5 h-3.5" /> Domains
          </Link>
          <Link to="/planos" className="hidden md:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            💎 Plans
          </Link>
          <Link to="/site/edit" className="hidden lg:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
            <Globe className="w-3.5 h-3.5" /> Mini Site
          </Link>
          {user && (
            <button onClick={() => setVerifyOpen(true)} className="hidden sm:flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-xs font-extrabold transition-colors">
              <BadgeCheck className="w-4 h-4" style={{ color: "#1D9BF0" }} />
            </button>
          )}

          {/* Cart button */}
          <button
            onClick={() => open()}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-white transition-transform hover:scale-105"
            style={{ background: "hsl(30, 100%, 55%)" }}
          >
            <ShoppingCart className="w-4 h-4" />
            {items.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                {items.length}
              </span>
            )}
            Cart
          </button>

          <LanguageSwitcher />
          <WalletButton />
          <NotificationBell />
          <AvatarMenu />
        </nav>
      </header>

      <VerificationModal open={verifyOpen} onClose={() => setVerifyOpen(false)} />
      <PaymentModal open={isOpen} onClose={() => close()} />
    </>
  );
};

export default Header;
