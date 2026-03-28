import { useSettings } from "@/hooks/useSettings";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import trustbankLogo from "@/assets/trustbank-logo.png";

const CARDS = [
  {
    icon: "🚀", q: "What is TrustBank?",
    a: <>A platform where creators <strong className="text-white">launch video NFTs, sell exclusive content, and build a personal page</strong> — all in one place. Buyers collect, watch, and trade. Everyone wins.</>,
    tag: "⚡ The Big Picture", tagColor: "text-accent", borderColor: "border-accent/30",
    glowColor: "rgba(255,69,0,0.08)", borderHover: "rgba(255,69,0,0.4)", iconBg: "rgba(255,69,0,0.12)", iconBorder: "rgba(255,69,0,0.25)",
  },
  {
    icon: "🎬", q: "What's a Video NFT?",
    a: <>A digital token with a <strong className="text-white">video baked in forever</strong>. Stored on Arweave — a permanent blockchain — so the video can never be deleted or changed. You own it for real.</>,
    tag: "🔷 NFT", tagColor: "text-yellow-400", borderColor: "border-yellow-400/30",
    glowColor: "rgba(245,197,24,0.06)", borderHover: "rgba(245,197,24,0.4)", iconBg: "rgba(245,197,24,0.1)", iconBorder: "rgba(245,197,24,0.2)",
  },
  {
    icon: "🌐", q: "What's the Mini Site?",
    a: <>Every creator gets a <strong className="text-white">personal page</strong> — like a Linktree that actually does something. Videos, NFTs, portfolio, and premium content. All in one link.</>,
    showPrice: "minisite",
    glowColor: "rgba(0,229,255,0.06)", borderHover: "rgba(0,229,255,0.4)", iconBg: "rgba(0,229,255,0.08)", iconBorder: "rgba(0,229,255,0.2)",
  },
  {
    icon: "💸", q: "How do creators get paid?",
    a: <>Every sale is settled <strong className="text-white">automatically on-chain</strong>. No invoices. No waiting. No middlemen. Just money in your wallet the moment someone buys.</>,
    split: { you: "YOU 60–70%", us: "Platform 30–40%" },
    glowColor: "rgba(0,255,136,0.06)", borderHover: "rgba(0,255,136,0.4)", iconBg: "rgba(0,255,136,0.08)", iconBorder: "rgba(0,255,136,0.2)",
  },
  {
    icon: "📈", q: "Can I make money as a buyer?",
    a: <>Buy a Video NFT early, and if the creator blows up, <strong className="text-white">your NFT goes up in value</strong>. Resell it on the marketplace anytime. Like collecting vinyl — but with a live market.</>,
    tag: "📈 Speculate", tagColor: "text-accent", borderColor: "border-accent/30",
    glowColor: "rgba(255,69,0,0.08)", borderHover: "rgba(255,69,0,0.4)", iconBg: "rgba(255,69,0,0.12)", iconBorder: "rgba(255,69,0,0.25)",
  },
  {
    icon: "🔁", q: "How does reselling work?",
    a: <>List your NFT at any price. When it sells, <strong className="text-white">70% goes to you instantly</strong>. The platform takes 30% — and the original creator earns royalties automatically via smart contract.</>,
    split: { you: "SELLER 70%", us: "Platform 30%" },
    glowColor: "rgba(245,197,24,0.06)", borderHover: "rgba(245,197,24,0.4)", iconBg: "rgba(245,197,24,0.1)", iconBorder: "rgba(245,197,24,0.2)",
  },
  {
    icon: "🔓", q: "What's the Paywall?",
    a: <>Creators lock videos, posts, or files behind a paywall. Pay <strong className="text-white">once to unlock</strong> any item. No subscription required unless you want the full creator experience.</>,
    showPrice: "paywall",
    glowColor: "rgba(0,229,255,0.06)", borderHover: "rgba(0,229,255,0.4)", iconBg: "rgba(0,229,255,0.08)", iconBorder: "rgba(0,229,255,0.2)",
  },
  {
    icon: "🎞️", q: "What's a video recharge?",
    a: <>Pay a small fee to <strong className="text-white">rewatch any video NFT</strong> you hold. The creator earns 50% of every recharge — a recurring revenue stream that never existed before.</>,
    showPrice: "recharge",
    glowColor: "rgba(0,255,136,0.06)", borderHover: "rgba(0,255,136,0.4)", iconBg: "rgba(0,255,136,0.08)", iconBorder: "rgba(0,255,136,0.2)",
  },
  {
    icon: "🏗️", q: "How do I launch an NFT collection?",
    a: <>Upload your video, set quantity and price per token (e.g. 1,000,000 NFTs at $0.10). Pay a one-time launch fee — covers Arweave storage and smart contract deployment.</>,
    showPrice: "launch",
    glowColor: "rgba(255,69,0,0.08)", borderHover: "rgba(255,69,0,0.4)", iconBg: "rgba(255,69,0,0.12)", iconBorder: "rgba(255,69,0,0.25)",
  },
  {
    icon: "🔐", q: "Do I need a crypto wallet?",
    a: <>Yes — connect your existing wallet (MetaMask, Rabby, Coinbase Wallet). <strong className="text-white">No new accounts</strong>, no hidden seed phrases. Your wallet, your keys, your NFTs. Always.</>,
    tag: "🔐 Self-Custody", tagColor: "text-yellow-400", borderColor: "border-yellow-400/30",
    glowColor: "rgba(245,197,24,0.06)", borderHover: "rgba(245,197,24,0.4)", iconBg: "rgba(245,197,24,0.1)", iconBorder: "rgba(245,197,24,0.2)",
  },
  {
    icon: "🎭", q: "What goes on my Mini Site?",
    a: <>Your <strong className="text-white">video library</strong> (free + paid), your <strong className="text-white">NFT collection</strong> for sale, your <strong className="text-white">CV / portfolio</strong>, and social links. Netflix profile meets digital storefront — on one URL.</>,
    tag: "🌐 Mini Site", tagColor: "text-sky-400", borderColor: "border-sky-400/30",
    glowColor: "rgba(0,229,255,0.06)", borderHover: "rgba(0,229,255,0.4)", iconBg: "rgba(0,229,255,0.08)", iconBorder: "rgba(0,229,255,0.2)",
  },
  {
    icon: "⛓️", q: "Is this actually on the blockchain?",
    a: <>Yes. NFTs live on <strong className="text-white">Polygon</strong> (fast, cheap). Videos on <strong className="text-white">Arweave</strong> (permanent, uncensorable). Payments settle on-chain — no one can freeze your earnings.</>,
    tag: "⛓️ On-Chain", tagColor: "text-emerald-400", borderColor: "border-emerald-400/30",
    glowColor: "rgba(0,255,136,0.06)", borderHover: "rgba(0,255,136,0.4)", iconBg: "rgba(0,255,136,0.08)", iconBorder: "rgba(0,255,136,0.2)",
  },
];

const HowItWorks = () => {
  const { data: settings } = useSettings();
  const s = settings as any;

  const prices: Record<string, string> = {
    paywall: `$${s?.paywall_min_embed ?? 9.90}`,
    launch: `$${s?.nft_launch_fee ?? 300}`,
    recharge: `$2.90`,
    minisite: `$${s?.annual_plan_price ?? 80}/yr`,
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#050508" }}>
      <SEOHead title="How TrustBank Works – Video NFTs & Trading" description="Learn how TrustBank works: create video NFTs, trade shares, earn dividends, and build your creator mini-site. Step-by-step guide." path="/how-it-works" />

      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.10] blur-[120px] -top-[200px] -left-[200px] animate-pulse" style={{ background: "hsl(var(--accent))" }} />
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[120px] -bottom-[150px] -right-[150px] animate-pulse" style={{ background: "#00e5ff" }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-[0.06] blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ background: "hsl(var(--gold))" }} />
      </div>

      <div className="relative z-10 max-w-[1080px] mx-auto px-6 py-20">
        {/* Logo + back */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center gap-2">
            <img src={trustbankLogo} alt="TrustBank" className="h-8 w-auto" />
            <span className="font-black text-lg font-mono text-accent">TrustBank</span>
          </Link>
          <Link to="/" className="text-sm font-bold text-accent hover:underline">← Back</Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs uppercase tracking-[0.2em] font-bold mb-7 rounded-sm bg-accent/10 border border-accent/30 text-accent">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> How It Works
          </div>
          <h1 className="font-black text-5xl md:text-7xl leading-[1] tracking-tight mb-6 text-white">
            Your content.<br />
            <span className="bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">Your rules.</span><br />
            Your earnings.
          </h1>
          <p className="text-lg max-w-[560px] mx-auto leading-relaxed font-medium" style={{ color: "#8888aa" }}>
            TrustBank is the first platform where video, NFTs, and a personal mini site live in one place — and you keep the majority of every dollar.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group"
              style={{
                background: "#0d0d14",
                border: "1px solid #1e1e2e",
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top left, ${card.glowColor}, transparent 70%)` }}
              />

              <div className="relative z-10">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-[22px] mb-5"
                  style={{ background: card.iconBg, border: `1px solid ${card.iconBorder}` }}
                >
                  {card.icon}
                </div>
                <h3 className="font-bold text-[17px] leading-tight mb-3 text-white">{card.q}</h3>
                <p className="text-sm leading-relaxed font-medium" style={{ color: "#8888aa" }}>{card.a}</p>

                {card.split && (
                  <div className="inline-flex items-center rounded-lg overflow-hidden mt-4 text-xs font-extrabold tracking-wide">
                    <span className="bg-emerald-400 text-black px-3 py-1">{card.split.you}</span>
                    <span className="px-2.5 py-1" style={{ background: "#13131e", color: "#8888aa", border: "1px solid #1e1e2e" }}>{card.split.us}</span>
                  </div>
                )}

                {card.showPrice && prices[card.showPrice] && (
                  <div className="inline-flex items-center gap-2 mt-4 rounded-lg px-3.5 py-2" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)" }}>
                    <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#8888aa" }}>from</span>
                    <span className="font-black text-xl text-emerald-400">{prices[card.showPrice]}</span>
                  </div>
                )}

                {card.tag && (
                  <span className={`inline-flex items-center gap-1.5 mt-4 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${card.tagColor} ${card.borderColor}`}>
                    {card.tag}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8" style={{ background: "#0d0d14", border: "1px solid #1e1e2e" }}>
          <div>
            <h2 className="font-black text-3xl leading-tight text-white">
              Ready to own the <span className="text-accent">future of content?</span>
            </h2>
            <p className="text-sm mt-2 font-medium" style={{ color: "#8888aa" }}>Join now — creators and collectors welcome.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/site/edit" className="px-7 py-3.5 font-extrabold text-sm rounded-xl transition-all hover:-translate-y-0.5 bg-accent text-white">
              Launch My Collection →
            </Link>
            <Link to="/marketplace" className="bg-transparent text-white px-7 py-3.5 font-bold text-sm rounded-xl transition-all" style={{ border: "1px solid #1e1e2e" }}>
              Browse NFTs
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-12 text-[8px] uppercase tracking-widest font-bold" style={{ color: "#2a2a3a" }}>
          TRUSTBANK IS A TECH PLATFORM. CONTENT IS CREATOR RESPONSIBILITY. HIGH RISK ASSET.
        </p>
      </div>
    </div>
  );
};

export default HowItWorks;
