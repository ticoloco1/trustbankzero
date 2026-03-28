const steps = [
  { num: "01", title: "Search Your Slug", titlePt: "Busque seu Slug", desc: "Type the keyword you want. If it's free, it's yours. If taken, bid in the marketplace.", descPt: "Digite a palavra que deseja. Se estiver livre, é sua. Se ocupada, lance no marketplace." },
  { num: "02", title: "Build Your Mini-Site", titlePt: "Construa seu Mini-Site", desc: "Fill in your profile, add content, connect YouTube, enable paywall, set SEO keywords.", descPt: "Preencha seu perfil, adicione conteúdo, conecte YouTube, ative paywall e SEO." },
  { num: "03", title: "Appear in Directory", titlePt: "Apareça no Diretório", desc: "Your mini-site goes live in your category — searched, trusted, and Google-indexed from day one.", descPt: "Seu mini-site vai ao ar na sua categoria — indexado no Google desde o primeiro dia." },
  { num: "04", title: "Boost Your Position", titlePt: "Impulsione sua Posição", desc: "Pay to climb the rankings. Reach the homepage spotlight for maximum global visibility.", descPt: "Pague para subir no ranking. Alcance o destaque na homepage para visibilidade global." },
];

const StepsSection = () => (
  <section className="relative py-28 px-6 md:px-12" style={{ background: "#050508" }}>
    <div className="max-w-[1200px] mx-auto">
      <span className="block mb-4 text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#00C9B1" }}>
        How It Works
      </span>
      <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(34px,4.5vw,62px)", fontWeight: 700, lineHeight: 1.05 }}>
        <span style={{ color: "#f2f2f8" }}>Four steps to</span><br />
        <span style={{ color: "#00C9B1" }}>being found.</span>
      </h2>
      <p className="text-sm mt-3" style={{ color: "#8888aa" }}>
        Quatro passos para ser encontrado. <span className="opacity-60">/ Four steps to being found.</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 mt-16 relative">
        {/* Line */}
        <div className="absolute top-[27px] left-[12.5%] right-[12.5%] h-px hidden lg:block"
          style={{ background: "linear-gradient(90deg,rgba(0,201,177,.2),rgba(245,158,11,.3),rgba(0,201,177,.2))" }} />
        {steps.map((s) => (
          <div key={s.num} className="pr-7 mb-10 lg:mb-0">
            <div className="w-[54px] h-[54px] flex items-center justify-center mb-6 relative z-10 text-xs"
              style={{ border: "1px solid rgba(0,201,177,.25)", background: "#0d0d14", fontFamily: "'DM Mono', monospace", color: "#00C9B1" }}>
              {s.num}
            </div>
            <h3 className="text-[17px] font-semibold mb-1 leading-tight" style={{ fontFamily: "'Clash Display', sans-serif", color: "#f2f2f8" }}>{s.title}</h3>
            <p className="text-[10px] font-medium mb-2" style={{ color: "#00C9B1" }}>{s.titlePt}</p>
            <p className="text-[13px] leading-[1.8]" style={{ color: "#8888aa" }}>{s.desc}</p>
            <p className="text-[11px] mt-1 italic" style={{ color: "#5a5a7a" }}>{s.descPt}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StepsSection;
