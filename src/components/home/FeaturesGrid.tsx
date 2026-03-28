const cards = [
  {
    icon: "🔑", title: "Exclusive Ownership",
    body: <>No two people share the same slug. Your keyword is locked to you — <strong>as long as your plan is active</strong>. Let it go, and it's available again.</>,
    tag: "🔑 One of a Kind", glow: "0,201,177",
    titlePt: "Propriedade Exclusiva",
    bodyPt: "Ninguém mais pode ter o mesmo slug. Sua palavra-chave é só sua — enquanto seu plano estiver ativo.",
  },
  {
    icon: "🌐", title: "Luxury Mini-Site",
    body: <>Bio, videos, paywall, AI assistant, CV, links, map, contact form — all at <strong>one premium address</strong>. Indexed on Google from day one.</>,
    tag: "🌐 Full Profile", glow: "255,107,43",
    titlePt: "Mini-Site Premium",
    bodyPt: "Bio, vídeos, paywall, CV, links, mapa, contato — tudo em um endereço premium. Indexado no Google desde o dia 1.",
  },
  {
    icon: "🚀", title: "Rise in Rankings",
    body: <>Boost your position inside the directory. Every <strong>$1.50 climbs one spot</strong>. The top puts you in front of every visitor — worldwide.</>,
    tag: "🚀 Boost System", glow: "0,232,121",
    titlePt: "Suba no Ranking",
    bodyPt: "Impulsione sua posição no diretório. Cada $1.50 sobe uma posição. O topo coloca você na frente de todos.",
  },
];

const FeaturesGrid = () => (
  <section className="relative py-28 px-6 md:px-12" style={{ background: "#0d0d14" }}>
    <div className="max-w-[1200px] mx-auto">
      <span className="block mb-4 text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#00C9B1" }}>
        Why TrustBank
      </span>
      <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(34px,4.5vw,62px)", fontWeight: 700, lineHeight: 1.05 }}>
        <span style={{ color: "#f2f2f8" }}>One keyword.</span><br />
        <em className="not-italic" style={{ background: "linear-gradient(135deg,#ff6b2b,#F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Infinite authority.
        </em>
      </h2>
      <p className="text-sm mt-4 leading-relaxed max-w-lg" style={{ color: "#8888aa" }}>
        Uma palavra-chave. Autoridade infinita. <span className="opacity-60">/ One keyword. Infinite authority.</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14">
        {cards.map((c, i) => (
          <div key={c.title} className="relative rounded-2xl p-8 border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group"
            style={{
              background: "#0d0d14",
              borderColor: "#1e1e2e",
              animationDelay: `${i * 0.05}s`,
              ["--card-glow" as any]: `rgba(${c.glow},.06)`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `rgba(${c.glow},.4)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e1e2e"; }}
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ background: `radial-gradient(ellipse at top left, rgba(${c.glow},.05), transparent 70%)` }} />
            <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-2xl mb-5"
              style={{ background: `rgba(${c.glow},.1)`, border: `1px solid rgba(${c.glow},.2)` }}>
              {c.icon}
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Clash Display', sans-serif", color: "#f2f2f8" }}>{c.title}</h3>
            <p className="text-[10px] font-medium mb-2" style={{ color: "#8888aa" }}>{c.titlePt}</p>
            <p className="text-[13px] leading-[1.8]" style={{ color: "#8888aa" }}>{c.body}</p>
            <p className="text-[11px] mt-1 italic" style={{ color: "#5a5a7a" }}>{c.bodyPt}</p>
            <span className="inline-flex items-center gap-[5px] mt-5 text-[11px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full"
              style={{ color: `rgb(${c.glow})`, border: `1px solid rgba(${c.glow},.3)` }}>
              {c.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesGrid;
