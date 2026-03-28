import { Link } from "next/link";

const plans = [
  {
    label: "Starter Slug", price: "$300", sub: "/year",
    desc: "Own a premium slug and get a basic directory listing. Your keyword, locked to you.",
    descPt: "Tenha um slug premium e apareça no diretório. Sua palavra-chave, só sua.",
    feats: [
      { text: "Premium slug ownership", on: true },
      { text: "Basic directory listing", on: true },
      { text: "Boost eligible", on: true },
      { text: "Mini-site builder", on: false },
      { text: "AI assistant", on: false },
      { text: "Paywall & YouTube", on: false },
    ],
    btn: "ghost",
  },
  {
    label: "Mini Plan", price: "$29.90", sub: "/month", star: true,
    desc: "The full experience. Slug included — build your luxury profile and start earning from day one.",
    descPt: "A experiência completa. Slug incluso — construa seu perfil premium e comece a ganhar.",
    feats: [
      { text: "Slug included (your choice)", on: true },
      { text: "Full mini-site builder", on: true },
      { text: "AI assistant", on: true },
      { text: "Paywall & YouTube feed", on: true },
      { text: "CV lockable (50/50 split)", on: true },
      { text: "SEO keywords & indexing", on: true },
      { text: "Map, links & contact", on: true },
      { text: "7-day activity feed", on: true },
    ],
    btn: "turq",
  },
  {
    label: "Extra Slugs", price: "$12.90", sub: "/yr each",
    desc: "Hold as many slugs as you want. Park, build, or sell. Active Mini Plan required.",
    descPt: "Tenha quantos slugs quiser. Estacione, construa ou venda. Requer Mini Plan ativo.",
    feats: [
      { text: "Unlimited extra slugs", on: true },
      { text: "Acquisition cost + $12.90/yr", on: true },
      { text: "P2P marketplace access", on: true },
      { text: "Buy & sell between users", on: true },
      { text: "Requires active Mini Plan", on: false },
      { text: "Lapse plan = slugs inactive", on: false },
    ],
    btn: "ghost",
  },
];

const PricingSection = () => (
  <section className="relative py-28 px-6 md:px-12" style={{ background: "#050508" }}>
    <div className="max-w-[1200px] mx-auto">
      <span className="block mb-4 text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#00C9B1" }}>
        Pricing
      </span>
      <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(34px,4.5vw,62px)", fontWeight: 700, lineHeight: 1.05 }}>
        <span style={{ color: "#f2f2f8" }}>Own it.</span><br />
        <em className="not-italic" style={{ background: "linear-gradient(135deg,#ff6b2b,#F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Keep it active.
        </em>
      </h2>
      <p className="text-sm mt-3" style={{ color: "#8888aa" }}>
        Possua. Mantenha ativo. <span className="opacity-60">/ Own it. Keep it active.</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14">
        {plans.map((p) => (
          <div key={p.label}
            className={`relative rounded-2xl p-10 border transition-all hover:-translate-y-1 ${p.star ? "border-[rgba(0,201,177,.4)]" : ""}`}
            style={{ background: p.star ? "#13131e" : "#0d0d14", borderColor: p.star ? "rgba(0,201,177,.4)" : "#1e1e2e" }}>
            {p.star && (
              <div className="absolute -top-px left-1/2 -translate-x-1/2 px-4 py-1 text-[9px] tracking-[0.2em] uppercase font-extrabold rounded-b-lg"
                style={{ background: "#00C9B1", color: "#000" }}>Most Popular</div>
            )}
            <div className="text-[10px] tracking-[0.25em] uppercase mb-4" style={{ fontFamily: "'DM Mono', monospace", color: "#5a5a7a" }}>{p.label}</div>
            <div style={{ fontFamily: "'Clash Display', sans-serif", color: "#00C9B1", fontSize: 48, fontWeight: 700, lineHeight: 1 }}>
              <sup className="text-xl align-top mt-2.5 inline-block">$</sup>
              {p.price.replace("$", "")}
              <sub className="text-[13px] font-normal ml-1" style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: "#8888aa" }}>{p.sub}</sub>
            </div>
            <p className="text-[12px] leading-[1.8] mt-4 mb-2" style={{ color: "#8888aa" }}>{p.desc}</p>
            <p className="text-[11px] italic mb-7" style={{ color: "#5a5a7a" }}>{p.descPt}</p>
            <ul className="flex flex-col">
              {p.feats.map((f) => (
                <li key={f.text} className={`text-[12px] py-2.5 border-b flex items-start gap-2.5 leading-[1.5] ${!f.on ? "opacity-50" : ""}`}
                  style={{ borderColor: "#1e1e2e", color: f.on ? "#f2f2f8" : "#5a5a7a" }}>
                  <span className="shrink-0" style={{ color: f.on ? "#00C9B1" : "#5a5a7a" }}>{f.on ? "✓" : "–"}</span>
                  {f.text}
                </li>
              ))}
            </ul>
            <Link to="/site/edit"
              className={`block mt-7 w-full py-3.5 text-center text-[11px] font-extrabold tracking-[0.18em] uppercase rounded-lg transition-colors ${
                p.btn === "turq" ? "border-none" : "border"
              }`}
              style={p.btn === "turq"
                ? { background: "#00C9B1", color: "#000" }
                : { background: "none", color: "#f2f2f8", borderColor: "#1e1e2e" }}>
              {p.star ? "Start Mini Plan" : p.label === "Extra Slugs" ? "Add More Slugs" : "Get Starter"}
            </Link>
          </div>
        ))}
      </div>

      {/* Addons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex items-center justify-between gap-5 p-6 rounded-xl border" style={{ background: "#0d0d14", borderColor: "#1e1e2e" }}>
          <div>
            <h4 className="text-[13px] font-bold mb-1" style={{ color: "#f2f2f8" }}>Homepage Spotlight</h4>
            <p className="text-[11px] leading-[1.6]" style={{ color: "#8888aa" }}>#1 position on TrustBank.xyz for 7 days. After: $50/day.</p>
            <p className="text-[10px] italic" style={{ color: "#5a5a7a" }}>Posição #1 por 7 dias. Depois: $50/dia.</p>
          </div>
          <div className="shrink-0 text-right" style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 22, color: "#ff6b2b" }}>
            $1,000<small className="block text-[11px]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: "#8888aa" }}>/ 7 days</small>
          </div>
        </div>
        <div className="flex items-center justify-between gap-5 p-6 rounded-xl border" style={{ background: "#0d0d14", borderColor: "#1e1e2e" }}>
          <div>
            <h4 className="text-[13px] font-bold mb-1" style={{ color: "#f2f2f8" }}>Position Boost</h4>
            <p className="text-[11px] leading-[1.6]" style={{ color: "#8888aa" }}>Move up the rankings. Each position is a fixed cost — hold until outbid.</p>
            <p className="text-[10px] italic" style={{ color: "#5a5a7a" }}>Suba no ranking. Custo fixo por posição.</p>
          </div>
          <div className="shrink-0 text-right" style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 22, color: "#ff6b2b" }}>
            $1.50<small className="block text-[11px]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: "#8888aa" }}>/ position</small>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default PricingSection;
