import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";

const PremiumFooter = () => {
  const { data: settings } = useSettings();

  return (
    <footer style={{ background: "#050508", borderTop: "1px solid #1e1e2e" }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="text-[19px] font-bold no-underline" style={{ fontFamily: "'Clash Display', sans-serif", color: "#00C9B1" }}>
            Trust<span style={{ color: "#F59E0B" }}>Bank</span>.xyz
          </Link>
          <p className="text-[12px] leading-[1.8] mt-3" style={{ color: "#5a5a7a" }}>
            The premium identity directory for professionals and brands.
          </p>
          <p className="text-[10px] mt-1 italic" style={{ color: "#3a3a5a" }}>
            O diretório de identidade premium para profissionais e marcas.
          </p>
        </div>
        {[
          { title: "Slugs", links: [{ to: "/slugs", label: "Search Slugs" }, { to: "/slugs", label: "Live Auctions" }, { to: "/slugs", label: "Direct Sales" }, { to: "/dashboard", label: "My Slugs" }] },
          { title: "Directory", links: [{ to: "/", label: "Mini Sites" }, { to: "/careers", label: "Jobs" }, { to: "/marketplace", label: "Marketplace" }] },
          { title: "Mini-Sites", links: [{ to: "/site/edit", label: "Features" }, { to: "/site/edit", label: "Paywall" }, { to: "/site/edit", label: "Boost" }] },
          { title: "Company", links: [{ to: "/how-it-works", label: "How It Works" }, { to: "/", label: "About" }] },
        ].map((col) => (
          <div key={col.title}>
            <h5 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "#f2f2f8" }}>{col.title}</h5>
            {col.links.map((l) => (
              <Link key={l.label} to={l.to} className="block text-[12px] py-1.5 no-underline transition-colors hover:opacity-80" style={{ color: "#5a5a7a" }}>
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-6 md:px-12 py-5 border-t" style={{ borderColor: "#1e1e2e" }}>
        <p className="text-[10px]" style={{ color: "#5a5a7a" }}>
          {(settings as any)?.footer_text || "© 2026 TrustBank.xyz — All rights reserved."}
        </p>
        <span className="text-[10px] font-bold tracking-[0.1em]" style={{ fontFamily: "'DM Mono', monospace", color: "#5a5a7a" }}>
          trustbank.xyz
        </span>
      </div>
    </footer>
  );
};

export default PremiumFooter;
