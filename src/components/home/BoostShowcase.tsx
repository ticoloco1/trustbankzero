const ranks = [
  { pos: 1, name: "Marcus Wealth Group — Dubai", url: "trustbank.xyz/s/marcus-dubai", boost: "$1,000", tag: "Homepage", top: true },
  { pos: 2, name: "Chen & Partners Law", url: "trustbank.xyz/s/chen-law", boost: "$412", tag: "Boosted", top: false },
  { pos: 3, name: "CryptoFund Alpha SG", url: "trustbank.xyz/s/cryptofund-alpha", boost: "$255", tag: "Boosted", top: false },
  { pos: 4, name: "Dr. Renata Silva", url: "trustbank.xyz/s/dra-renata", boost: "$90", tag: "Boosted", top: false },
  { pos: 5, name: "Victoria James — Analyst", url: "trustbank.xyz/s/victoria-analyst", boost: "—", tag: "Free", top: false },
];

const BoostShowcase = () => (
  <section className="relative py-28 px-6 md:px-12" style={{ background: "#0d0d14" }}>
    <div className="max-w-[1200px] mx-auto">
      <span className="block mb-4 text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#00C9B1" }}>
        Boost System
      </span>
      <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(34px,4.5vw,62px)", fontWeight: 700, lineHeight: 1.05 }}>
        <span style={{ color: "#f2f2f8" }}>Climb the</span><br />
        <em className="not-italic" style={{ background: "linear-gradient(135deg,#ff6b2b,#F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          rankings live.
        </em>
      </h2>
      <p className="text-sm mt-3 max-w-lg" style={{ color: "#8888aa" }}>
        Every $1.50 moves you one position up. Pay once — hold until someone outbids you.
        <br /><span className="text-[11px] italic" style={{ color: "#5a5a7a" }}>Cada $1.50 sobe uma posição. Pague uma vez — mantenha até alguém superar.</span>
      </p>

      <div className="mt-14 border rounded-[14px] overflow-hidden" style={{ borderColor: "#1e1e2e" }}>
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b" style={{ background: "#13131e", borderColor: "#1e1e2e", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a5a7a" }}>
          <span className="w-[7px] h-[7px] rounded-full animate-pulse" style={{ background: "#F87171" }} />
          Live Rankings — trustbank.xyz/finance
        </div>
        {ranks.map((r) => (
          <div key={r.pos}
            className="grid grid-cols-[44px_1fr_100px_90px] items-center gap-4 px-5 py-4 border-b last:border-b-0 transition-colors hover:bg-[rgba(0,201,177,.03)]"
            style={{ borderColor: "#1e1e2e", background: r.top ? "rgba(0,201,177,.04)" : "transparent" }}>
            <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 28, fontWeight: 700, color: r.pos <= 2 ? "#F59E0B" : "#5a5a7a", textAlign: "center" }}>
              {r.pos}
            </div>
            <div>
              <div className="text-[13px] font-bold" style={{ color: "#f2f2f8" }}>{r.name}</div>
              <div className="text-[10px]" style={{ fontFamily: "'DM Mono', monospace", color: "#00C9B1" }}>{r.url}</div>
            </div>
            <div className="text-[13px] font-bold" style={{ color: "#00C9B1" }}>{r.boost}</div>
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-1 text-center rounded"
              style={{
                background: r.tag === "Homepage" ? "rgba(0,201,177,.1)" : r.tag === "Boosted" ? "rgba(245,158,11,.1)" : "rgba(255,255,255,.04)",
                color: r.tag === "Homepage" ? "#00C9B1" : r.tag === "Boosted" ? "#F59E0B" : "#5a5a7a",
                border: `1px solid ${r.tag === "Homepage" ? "rgba(0,201,177,.25)" : r.tag === "Boosted" ? "rgba(245,158,11,.25)" : "rgba(255,255,255,.08)"}`,
              }}>
              {r.tag}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BoostShowcase;
