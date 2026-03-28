import { Link } from "react-router-dom";

const CtaSection = () => (
  <section className="relative py-28 px-6 md:px-12" style={{ background: "#0d0d14" }}>
    <div className="max-w-[800px] mx-auto text-center relative rounded-2xl p-14 border overflow-hidden"
      style={{ borderColor: "rgba(0,201,177,.2)", background: "linear-gradient(135deg,rgba(0,201,177,.06),rgba(245,158,11,.04))" }}>
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center,rgba(0,201,177,.08),transparent 70%)" }} />
      <h2 className="relative z-10 mb-4" style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, lineHeight: 1.1 }}>
        <span style={{ color: "#f2f2f8" }}>Your keyword is</span><br />
        <span style={{ color: "#00C9B1" }}>available right now.</span>
      </h2>
      <p className="relative z-10 text-[14px] leading-[1.8] max-w-md mx-auto mb-2" style={{ color: "#8888aa" }}>
        There is one trustbank.xyz/s/your-name. One /your-city. One /your-niche.
        Yours as long as you hold it — someone else's the moment you don't.
      </p>
      <p className="relative z-10 text-[12px] italic mb-8" style={{ color: "#5a5a7a" }}>
        Existe apenas um trustbank.xyz/s/seu-nome. Seu enquanto mantiver — de outro no momento que largar.
      </p>
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/slugs"
          className="px-10 py-4 text-[13px] font-extrabold tracking-[0.14em] uppercase rounded-lg transition-colors"
          style={{ background: "#00C9B1", color: "#000" }}>
          Search My Slug →
        </Link>
        <Link to="/site/edit"
          className="px-10 py-4 text-[13px] font-extrabold tracking-[0.14em] uppercase rounded-lg border transition-colors"
          style={{ background: "none", color: "#f2f2f8", borderColor: "#1e1e2e" }}>
          Browse Directory
        </Link>
      </div>
    </div>
  </section>
);

export default CtaSection;
