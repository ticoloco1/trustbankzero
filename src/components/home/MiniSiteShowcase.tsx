import { Link } from "next/link";
import { ArrowRight } from "lucide-react";

const feats = [
  { ico: "🔍", title: "SEO Keywords", desc: "Custom title, description, keywords. Rank on Google for your name and niche automatically.", descPt: "Título, descrição e palavras-chave personalizadas. Ranqueie no Google automaticamente." },
  { ico: "🤖", title: "AI Assistant", desc: "Built-in advisor that answers visitor questions and converts them — 24/7, automatically.", descPt: "Assistente IA que responde perguntas dos visitantes 24/7." },
  { ico: "🔒", title: "Paywall Content", desc: "Lock articles, videos, or your CV. Visitors pay to unlock — you keep the revenue.", descPt: "Bloqueie artigos, vídeos ou CV. Visitantes pagam para desbloquear." },
  { ico: "▶️", title: "YouTube Feed", desc: "Connect your channel. Latest videos appear automatically — free or paywalled.", descPt: "Conecte seu canal. Vídeos aparecem automaticamente — grátis ou com paywall." },
  { ico: "📄", title: "CV — optional & lockable", desc: "Show or hide your résumé. Lock it behind a paywall — companies pay, you split 50/50.", descPt: "Mostre ou oculte seu currículo. Empresas pagam, você divide 50/50." },
  { ico: "📍", title: "Map, Links & Contact", desc: "Interactive map, all your social links, and a contact form with direct email forwarding.", descPt: "Mapa interativo, links sociais e formulário de contato." },
  { ico: "📰", title: "7-Day Activity Feed", desc: "A rolling feed of your latest updates. Keep visitors coming back every week.", descPt: "Feed rotativo dos seus últimos posts. Mantenha visitantes voltando toda semana." },
];

const MiniSiteShowcase = () => (
  <section className="relative py-28 px-6 md:px-12" style={{ background: "#0d0d14" }}>
    <div className="max-w-[1200px] mx-auto">
      <span className="block mb-4 text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#00C9B1" }}>
        Mini-Sites
      </span>
      <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(34px,4.5vw,62px)", fontWeight: 700, lineHeight: 1.05 }}>
        <span style={{ color: "#f2f2f8" }}>Your entire world.</span><br />
        <em className="not-italic" style={{ background: "linear-gradient(135deg,#ff6b2b,#F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          One URL.
        </em>
      </h2>
      <p className="text-sm mt-4 leading-relaxed max-w-lg" style={{ color: "#8888aa" }}>
        Everything a professional needs to be found, trusted, and hired — at one premium address.
        <br /><span className="text-[11px] italic" style={{ color: "#5a5a7a" }}>Tudo que um profissional precisa — em um endereço premium.</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-16">
        {/* Features list */}
        <div className="flex flex-col gap-0.5">
          {feats.map((f, i) => (
            <div key={f.title}
              className="grid grid-cols-[52px_1fr] items-start p-[18px_20px] border transition-colors cursor-default group"
              style={{ borderColor: "#1e1e2e", background: i === 0 ? "#13131e" : "#050508" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#13131e"; e.currentTarget.style.borderColor = "rgba(0,201,177,.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#050508"; e.currentTarget.style.borderColor = "#1e1e2e"; }}>
              <span className="text-[19px] pt-0.5">{f.ico}</span>
              <div>
                <div className="text-[13px] font-bold mb-0.5" style={{ color: "#f2f2f8" }}>{f.title}</div>
                <div className="text-[12px] leading-[1.7]" style={{ color: "#8888aa" }}>{f.desc}</div>
                <div className="text-[10px] italic mt-0.5" style={{ color: "#5a5a7a" }}>{f.descPt}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mockup */}
        <div className="border rounded-xl overflow-hidden sticky top-24" style={{ borderColor: "#1e1e2e", background: "#0d0d14" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: "#13131e", borderColor: "#1e1e2e" }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FFBD2E" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#27C840" }} />
            <div className="flex-1 ml-2 px-3 py-1 text-[10px]" style={{ background: "rgba(0,0,0,.4)", fontFamily: "'DM Mono', monospace", color: "#5a5a7a" }}>
              trustbank.xyz/s/your-slug
            </div>
          </div>
          <div className="p-6">
            <div className="w-[54px] h-[54px] rounded-full flex items-center justify-center text-2xl mb-3.5"
              style={{ background: "linear-gradient(135deg,#5C1530,#3D0F1E)" }}>👤</div>
            <div className="text-xl font-semibold mb-0.5" style={{ fontFamily: "'Clash Display', sans-serif", color: "#f2f2f8" }}>Your Name</div>
            <div className="text-[10px] tracking-[0.12em] mb-3" style={{ fontFamily: "'DM Mono', monospace", color: "#00C9B1" }}>trustbank.xyz/s/your-slug</div>
            <div className="text-[12px] leading-[1.75] mb-4" style={{ color: "#8888aa" }}>Your professional bio lives here. Trusted, indexed, and visible to the world from day one.</div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["Finance", "Advisory", "New York"].map(t => (
                <span key={t} className="text-[10px] px-2.5 py-0.5 rounded-full border tracking-[0.08em]" style={{ borderColor: "#1e1e2e", color: "#5a5a7a" }}>{t}</span>
              ))}
            </div>
            <div className="text-[9px] tracking-[0.2em] uppercase pb-2 mb-2.5 border-b" style={{ fontFamily: "'DM Mono', monospace", color: "#5a5a7a", borderColor: "#1e1e2e" }}>Premium Content</div>
            <div className="p-3.5 rounded-lg mb-3.5 border" style={{ borderColor: "rgba(245,158,11,.2)", background: "rgba(245,158,11,.04)" }}>
              <div className="text-base mb-1">🔒</div>
              <p className="text-[11px] mb-2.5" style={{ color: "#5a5a7a" }}>Exclusive reports & video analysis — subscribers only.</p>
              <button className="w-full py-2 px-3.5 text-[10px] tracking-[0.14em] uppercase font-extrabold rounded border-none cursor-pointer"
                style={{ background: "#F59E0B", color: "#000" }}>Unlock Access</button>
            </div>
            <div className="flex flex-col gap-1.5">
              {["🌐 Website", "▶️ YouTube", "📅 Book a Meeting"].map(l => (
                <div key={l} className="flex items-center gap-2.5 px-3 py-2 border rounded-md text-[12px] transition-colors"
                  style={{ borderColor: "#1e1e2e", color: "#8888aa" }}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-16">
        <Link to="/site/edit"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-extrabold tracking-[0.14em] uppercase transition-colors"
          style={{ background: "#00C9B1", color: "#000" }}>
          Build Your Mini-Site <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-[11px] mt-3 italic" style={{ color: "#5a5a7a" }}>Crie seu Mini-Site agora</p>
      </div>
    </div>
  </section>
);

export default MiniSiteShowcase;
