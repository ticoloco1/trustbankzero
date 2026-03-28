import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const TICKER_SLUGS = [
  "dubai", "lawyer-chicago", "crypto", "ceo", "doctor-miami",
  "analyst", "realestate-nyc", "wealth", "london-finance", "cfo",
  "architect", "private-equity",
];

const HeroSection = () => {
  const [slug, setSlug] = useState("");
  const [result, setResult] = useState<{ status: "ok" | "no" | "wait" | ""; text: string }>({ status: "", text: "" });
  const navigate = useNavigate();

  const checkSlug = async () => {
    const val = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!val) return;
    setResult({ status: "wait", text: "Checking availability…" });
    const { data } = await supabase.from("mini_sites").select("id").eq("slug", val).maybeSingle();
    if (data) {
      setResult({ status: "no", text: `✗  trustbank.xyz/s/${val} is already taken — view it or place a bid.` });
    } else {
      setResult({ status: "ok", text: `✓  trustbank.xyz/s/${val} is available — secure it before someone else does.` });
    }
  };

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#050508", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,201,177,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,201,177,.04) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
        maskImage: "radial-gradient(ellipse 70% 55% at 50% 45%,black,transparent)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 45%,black,transparent)",
      }} />
      {/* Orbs */}
      <div className="absolute -top-48 -left-48 w-[700px] h-[500px] rounded-full blur-[140px] opacity-20" style={{ background: "#5C1530" }} />
      <div className="absolute -bottom-36 -right-24 w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.07]" style={{ background: "#3B82F6" }} />
      <div className="absolute top-[45%] left-[55%] w-[380px] h-[380px] rounded-full blur-[140px] opacity-[0.05]" style={{ background: "#00C9B1" }} />

      <div className="relative z-10 text-center px-6 pt-28 pb-0 max-w-[960px] mx-auto w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 border px-5 py-1.5 mb-10 text-[10px] tracking-[0.28em] uppercase"
          style={{ borderColor: "rgba(0,201,177,.25)", background: "rgba(0,201,177,.07)", color: "#00C9B1", fontFamily: "'DM Mono', monospace" }}>
          <span className="w-[7px] h-[7px] rounded-full animate-pulse" style={{ background: "#00C9B1" }} />
          One keyword · One owner · Active while you hold it
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(48px,7.5vw,112px)", fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.02em" }}>
          <span style={{ color: "#f2f2f8" }}>The address that</span><br />
          <span style={{ color: "#00C9B1" }}>defines you.</span><br />
          <span style={{ color: "#F59E0B" }}>Claim it now.</span>
        </h1>

        {/* Slug search */}
        <div className="mt-12 w-full max-w-[740px] mx-auto">
          <span className="block mb-3 text-[10px] tracking-[0.22em] uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#5a5a7a" }}>
            Search your slug — if it's free, it's yours
          </span>
          <div className="flex items-stretch transition-all" style={{
            background: "rgba(0,0,0,.5)", border: "1px solid rgba(0,201,177,.22)",
          }}>
            <div className="px-5 py-5 whitespace-nowrap text-sm border-r shrink-0" style={{ fontFamily: "'DM Mono', monospace", color: "#5a5a7a", borderColor: "#1e1e2e", background: "rgba(0,0,0,.3)" }}>
              <b style={{ color: "#00C9B1" }}>trustbank.xyz</b> /s/
            </div>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkSlug()}
              placeholder="your-name-or-keyword"
              className="flex-1 bg-transparent border-none outline-none px-4 py-5 text-xl font-semibold"
              style={{ fontFamily: "'Clash Display', sans-serif", color: "#F59E0B", caretColor: "#00C9B1" }}
              spellCheck={false}
              autoComplete="off"
            />
            <button onClick={checkSlug}
              className="shrink-0 px-7 py-5 text-xs font-extrabold tracking-[0.14em] uppercase border-none cursor-pointer transition-colors"
              style={{ background: "#00C9B1", color: "#000", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              Check →
            </button>
          </div>
          {result.text && (
            <p className="mt-3 text-sm font-semibold tracking-wide px-1" style={{
              color: result.status === "ok" ? "#00e879" : result.status === "no" ? "#F87171" : "#5a5a7a"
            }}>
              {result.text}
            </p>
          )}
        </div>

        {/* Polygon hint */}
        <div className="mt-5 flex items-center justify-center gap-3 text-xs" style={{ color: "#5a5a7a" }}>
          <span className="inline-flex items-center gap-[7px] px-3.5 py-1 text-[11px] font-bold tracking-[0.1em] uppercase"
            style={{ background: "rgba(167,139,250,.1)", border: "1px solid rgba(167,139,250,.3)", color: "#A78BFA" }}>
            <span className="w-[7px] h-[7px] rounded-full" style={{ background: "#A78BFA" }} /> Polygon Pay
          </span>
          Pay with Polygon wallet — priority access &amp; lower fees
        </div>
      </div>

      {/* Ticker */}
      <div className="w-full overflow-hidden mt-16 py-3.5 relative z-10" style={{ borderTop: "1px solid #1e1e2e", borderBottom: "1px solid #1e1e2e", background: "rgba(0,0,0,.3)" }}>
        <div className="flex gap-12 animate-ticker whitespace-nowrap">
          {[...TICKER_SLUGS, ...TICKER_SLUGS].map((s, i) => (
            <span key={i} className="text-[11px] shrink-0" style={{ fontFamily: "'DM Mono', monospace", color: "#5a5a7a" }}>
              trustbank.xyz/<b style={{ color: "#00C9B1", fontWeight: 400 }}>{s}</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
