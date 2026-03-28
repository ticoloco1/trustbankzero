import { useParams, Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { usePublicSite, useSiteLinks, useSiteVideos, useBuyNft } from "@/hooks/useMiniSite";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { useIsFollowing, useToggleFollow } from "@/hooks/useSocial";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import {
  ExternalLink, Play, Gem, Lock, ChevronDown, ChevronUp, Globe, Mail, Phone, RefreshCw, Rss, DollarSign, MapPin, Heart, UserPlus, UserCheck, Share2, BadgeCheck
} from "lucide-react";
import { useUserBadge } from "@/hooks/useVerification";
import VerifiedBadge from "@/components/VerifiedBadge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import NftFlipCard from "@/components/NftFlipCard";
import Feed from "@/components/FeedPost";
import CountdownTimer from "@/components/CountdownTimer";
import { SOCIAL_NETWORKS } from "@/components/SocialLinkPicker";
import { PhotoCarousel, ClassifiedCard } from "@/components/ClassifiedForm";

const THEME_GRADIENTS: Record<string, string> = {
  cosmic: "from-purple-900 via-indigo-900 to-violet-800",
  ocean: "from-blue-900 via-cyan-900 to-teal-800",
  forest: "from-emerald-900 via-green-900 to-teal-900",
  sunset: "from-orange-900 via-amber-900 to-yellow-800",
  midnight: "from-slate-900 via-gray-900 to-zinc-900",
  neon: "from-fuchsia-900 via-pink-900 to-rose-900",
  cyber: "from-cyan-900 via-blue-900 to-indigo-900",
  ember: "from-red-900 via-orange-900 to-amber-900",
  aurora: "from-teal-900 via-emerald-900 to-cyan-900",
  noir: "from-neutral-950 via-neutral-900 to-neutral-800",
};

const THEME_LIGHT_BG: Record<string, string> = {
  white: "bg-white",
  beige: "bg-amber-50",
  rose: "bg-rose-50",
  mint: "bg-emerald-50",
  lavender: "bg-violet-50",
  sky: "bg-sky-50",
  cream: "bg-orange-50",
  pearl: "bg-gray-50",
  lemon: "bg-yellow-50",
  peach: "bg-red-50",
};

const THEME_ACCENTS: Record<string, string> = {
  cosmic: "#a855f7", ocean: "#06b6d4", forest: "#10b981", sunset: "#f59e0b", midnight: "#64748b",
  white: "#2563eb", beige: "#b45309", rose: "#e11d48", mint: "#059669", lavender: "#7c3aed", sky: "#0284c7",
  neon: "#f472b6", cyber: "#22d3ee", ember: "#ef4444", aurora: "#2dd4bf", noir: "#a3a3a3",
  cream: "#ea580c", pearl: "#4b5563", lemon: "#ca8a04", peach: "#dc2626",
};

const DARK_THEMES = new Set(["cosmic", "ocean", "forest", "sunset", "midnight", "neon", "cyber", "ember", "aurora", "noir"]);

const FONT_SIZE_MAP: Record<string, { title: string; body: string; small: string }> = {
  sm: { title: "text-2xl", body: "text-xs", small: "text-[10px]" },
  md: { title: "text-3xl", body: "text-sm", small: "text-xs" },
  lg: { title: "text-4xl", body: "text-base", small: "text-sm" },
  xl: { title: "text-5xl", body: "text-lg", small: "text-base" },
};

const PHOTO_SIZE_MAP: Record<string, string> = {
  sm: "w-16 h-16", md: "w-24 h-24", lg: "w-32 h-32", xl: "w-40 h-40",
};

const MiniSitePublic = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: site, isLoading } = usePublicSite(slug || "");
  const { data: links } = useSiteLinks(site?.id);
  const { data: videos } = useSiteVideos(site?.id);

  // Classified listings (imóveis e carros)
  const { data: classifieds } = useQuery({
    queryKey: ["classifieds-public", site?.id],
    queryFn: async () => {
      if (!site?.id) return [];
      const { data } = await supabase
        .from("classified_listings" as any)
        .select("*")
        .eq("site_id", site.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!site?.id,
  });
  const imoveis = (classifieds || []).filter((c: any) => c.type === "imovel");
  const carros = (classifieds || []).filter((c: any) => c.type === "carro");
  const { user } = useAuth();
  const buyNft = useBuyNft();
  const qc = useQueryClient();
  const [cvOpen, setCvOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [buyConfirm, setBuyConfirm] = useState<any>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [unlockConfirm, setUnlockConfirm] = useState(false);
  const [paywallConfirm, setPaywallConfirm] = useState<any>(null);
  const [liked, setLiked] = useState(false);

  const { data: isFollowing } = useIsFollowing(site?.user_id ?? null);
  const toggleFollow = useToggleFollow();
  const { data: userBadge } = useUserBadge(site?.user_id ?? null);

  const { data: followerCount } = useQuery({
    queryKey: ["follower-count", site?.user_id],
    queryFn: async () => {
      const { count } = await supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", site!.user_id);
      return count || 0;
    },
    enabled: !!site,
  });

  const { data: myPurchases } = useQuery({
    queryKey: ["my-nft-access", user?.id, site?.id],
    queryFn: async () => {
      const { data } = await supabase.from("nft_purchases").select("*, mini_site_videos(youtube_video_id)").eq("buyer_id", user!.id);
      return data || [];
    },
    enabled: !!user && !!site,
  });

  const { data: myPaywallUnlocks } = useQuery({
    queryKey: ["my-paywall-unlocks", user?.id, site?.id],
    queryFn: async () => {
      const { data } = await supabase.from("paywall_unlocks").select("video_id, created_at").eq("user_id", user!.id);
      return (data || []).map((d: any) => d.video_id as string);
    },
    enabled: !!user && !!site,
  });

  const { data: profile } = useQuery({
    queryKey: ["site-profile", site?.user_id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", site!.user_id).single();
      return data;
    },
    enabled: !!site,
  });

  const { data: contactUnlocked } = useQuery({
    queryKey: ["cv-unlock", user?.id, site?.id],
    queryFn: async () => {
      const { data } = await supabase.from("cv_unlocks").select("id").eq("buyer_id", user!.id).eq("site_id", site!.id).limit(1);
      return (data || []).length > 0;
    },
    enabled: !!user && !!site,
  });

  const unlockContact = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cv_unlocks").insert({
        buyer_id: user!.id, creator_id: site!.user_id, site_id: site!.id,
        amount_paid: (site as any).contact_price || 20,
        creator_share: ((site as any).contact_price || 20) / 2,
        platform_share: ((site as any).contact_price || 20) / 2,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cv-unlock"] }); toast.success("Contact unlocked!"); setUnlockConfirm(false); },
  });

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  if (!site) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">Site not found</div>;

  const hasNftAccess = (videoId: string) => myPurchases?.some((p: any) => p.video_id === videoId && p.views_used < p.views_allowed);
  const hasPaywallAccess = (videoId: string) => myPaywallUnlocks?.includes(videoId);

  const handleBuy = async () => {
    if (!buyConfirm) return;
    try { await buyNft.mutateAsync(buyConfirm); toast.success("NFT purchased!"); setBuyConfirm(null); }
    catch (e: any) { toast.error(e.message); }
  };

  const handlePaywallBuy = async () => {
    if (!paywallConfirm || !user) return;
    const price = (paywallConfirm as any).paywall_price || 0.15;
    try {
      const { error } = await supabase.from("paywall_unlocks").insert({
        user_id: user.id, video_id: paywallConfirm.id, amount_paid: price,
        platform_fee: price * 0.4, net_to_holders: price * 0.6,
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["my-paywall-unlocks"] });
      toast.success("Video unlocked!"); setPaywallConfirm(null); setPlayingId(paywallConfirm.id);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.href,
    });
    if (error) toast.error(error.message);
  };

  const handlePlay = async (video: any) => {
    if (!video.nft_enabled && !(video as any).paywall_enabled) { setPlayingId(video.id); return; }
    if ((video as any).paywall_enabled) {
      if (hasPaywallAccess(video.id)) { setPlayingId(video.id); return; }
      if (!user) { setShowLoginPrompt(true); return; }
      setPaywallConfirm(video); return;
    }
    if (video.nft_enabled) {
      if (hasNftAccess(video.id)) {
        const purchase = myPurchases?.find((p: any) => p.video_id === video.id && p.views_used < p.views_allowed);
        if (purchase) await supabase.from("nft_purchases").update({ views_used: purchase.views_used + 1 }).eq("id", purchase.id);
        setPlayingId(video.id);
      } else {
        if (!user) { setShowLoginPrompt(true); return; }
        setBuyConfirm(video);
      }
    }
  };

  const siteAny = site as any;
  const isDark = DARK_THEMES.has(site.theme);
  const themeGrad = THEME_GRADIENTS[site.theme] || THEME_GRADIENTS.cosmic;
  const themeLightBg = THEME_LIGHT_BG[site.theme] || "bg-white";
  const themeAccent = THEME_ACCENTS[site.theme] || THEME_ACCENTS.cosmic;
  const colClass = site.layout_columns === 1 ? "grid-cols-1" : site.layout_columns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";
  const avatarUrl = siteAny.avatar_url || profile?.avatar_url || "";
  const initial = siteAny.site_name?.[0]?.toUpperCase() || "H";
  const fs = FONT_SIZE_MAP[siteAny.font_size] || FONT_SIZE_MAP.md;
  const photoSizeCls = PHOTO_SIZE_MAP[siteAny.photo_size] || PHOTO_SIZE_MAP.md;
  const photoShapeCls = siteAny.photo_shape === "square" ? "rounded-none" : siteAny.photo_shape === "rounded" ? "rounded-xl" : "rounded-full";

  // ── Cores adaptativas baseadas no tema ──────────────────────────────────────
  const customTextColor = siteAny.text_color || "";
  // Temas claros usam texto escuro, temas escuros usam texto branco
  const colorText     = customTextColor || (isDark ? "#ffffff"  : "#111827");
  const colorTextSub  = customTextColor ? customTextColor + "cc" : (isDark ? "rgba(255,255,255,0.7)" : "#374151");
  const colorTextMuted = isDark ? "rgba(255,255,255,0.35)" : "#9ca3af";
  const cardBg    = isDark ? "bg-white/10 border-white/10" : "bg-white border-gray-200";
  const cardHover = isDark ? "hover:bg-white/20" : "hover:bg-gray-50";
  const cardShadow = isDark ? "" : "shadow-sm";

  const bgImageUrl = siteAny.bg_image_url || "";
  const presentationVideoUrl = siteAny.presentation_video_url || "";
  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return match?.[1] || url;
  };
  const moduleOrder: string[] = Array.isArray(siteAny.module_order) ? siteAny.module_order : ["feed", "links", "videos"];

  // ── Módulos ─────────────────────────────────────────────────────────────────
  const renderFeed = () => (
    <div key="feed" className="max-w-3xl mx-auto px-6 pb-8">
      <div className="flex items-center gap-2 mb-3">
        <Rss className="w-4 h-4" style={{ color: colorTextMuted }} />
        <h2 className={`${fs.small} font-bold uppercase tracking-wider`} style={{ color: colorTextSub }}>Feed</h2>
      </div>
      <Feed siteId={site.id} userId={site.user_id} isOwner={user?.id === site.user_id} isDark={isDark} textColor={customTextColor || colorText} />
    </div>
  );

  const renderLinks = () => (
    links && links.length > 0 ? (
      <div key="links" className="max-w-md mx-auto px-6 pb-8 space-y-2">
        {links.map((l: any) => {
          const social = SOCIAL_NETWORKS.find(s => s.id === l.icon);
          return (
            <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-between w-full px-5 py-3 ${cardBg} ${cardShadow} backdrop-blur-sm border rounded-xl ${fs.body} font-bold ${cardHover} transition-all group`}
              style={{ color: colorText, borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb" }}
            >
              <div className="flex items-center gap-3">
                {social ? <span style={{ color: social.color }}>{social.icon}</span> : null}
                <span>{l.title}</span>
              </div>
              <ExternalLink className="w-4 h-4 transition-colors" style={{ color: colorTextMuted }} />
            </a>
          );
        })}
      </div>
    ) : <div key="links" />
  );

  const renderVideos = () => (
    videos && videos.length > 0 ? (
      <div key="videos" className="max-w-5xl mx-auto px-6 pb-16">
        <div className={`grid ${colClass} gap-4`}>
          {videos.map((v: any) => {
            const isPlaying = playingId === v.id;
            const canPlay = !v.nft_enabled || hasNftAccess(v.id);
            const soldOut = v.nft_max_editions && v.nft_editions_sold >= v.nft_max_editions;
            if (v.nft_enabled) {
              return <NftFlipCard key={v.id} video={v} canPlay={canPlay} isPlaying={isPlaying} onPlay={() => handlePlay(v)} onBuy={() => setBuyConfirm(v)} soldOut={soldOut} themeAccent={themeAccent} />;
            }
            return (
              <div key={v.id} className={`${cardBg} ${cardShadow} backdrop-blur-sm border rounded-xl overflow-hidden group ${cardHover} transition-all`}
                style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb" }}>
                <div className="relative aspect-video bg-black/20">
                  {isPlaying ? (
                    <iframe src={`https://www.youtube.com/embed/${v.youtube_video_id}?autoplay=1`} allow="autoplay; encrypted-media" allowFullScreen className="w-full h-full" />
                  ) : (
                    <>
                      {v.preview_url
                        ? <video src={v.preview_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        : <img src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_video_id}/hqdefault.jpg`} alt={v.title} className="w-full h-full object-cover" />
                      }
                      <button onClick={() => handlePlay(v)} className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-12 h-12 text-white fill-white drop-shadow-lg" />
                      </button>
                    </>
                  )}
                </div>
                <div className="p-3">
                  <p className={`${fs.body} font-bold line-clamp-2`} style={{ color: colorText }}>{v.title}</p>
                  {(v as any).paywall_enabled && (
                    <span className={`${fs.small} font-bold mt-1 inline-flex items-center gap-1`} style={{ color: themeAccent }}>
                      <DollarSign className="w-3 h-3" /> {hasPaywallAccess(v.id) ? "Unlocked" : `$${(v as any).paywall_price} para assistir`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ) : <div key="videos" />
  );

  const renderPresentation = () => (
    presentationVideoUrl ? (
      <div key="presentation" className="max-w-3xl mx-auto px-6 pb-8">
        <div className="aspect-video w-full rounded-xl overflow-hidden border shadow-lg" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb" }}>
          <iframe src={`https://www.youtube.com/embed/${extractYouTubeId(presentationVideoUrl)}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen className="w-full h-full" />
        </div>
      </div>
    ) : <div key="presentation" />
  );

  const renderMap = () => {
    if (!siteAny.cv_location) return <div key="map" />;
    return (
      <div key="map" className="max-w-3xl mx-auto px-6 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4" style={{ color: colorTextMuted }} />
          <h2 className={`${fs.small} font-bold uppercase tracking-wider`} style={{ color: colorTextSub }}>Localização</h2>
        </div>
        <div className="aspect-[16/9] w-full rounded-xl overflow-hidden border shadow-lg" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb" }}>
          <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(siteAny.cv_location)}&output=embed`}
            className="w-full h-full border-0" allowFullScreen loading="lazy" />
        </div>
      </div>
    );
  };

  const renderImoveis = () => {
    if (!imoveis.length) return <div key="imoveis" />;
    return (
      <div key="imoveis" className="max-w-5xl mx-auto px-6 pb-10">
        <h3 className="font-black text-lg mb-4 flex items-center gap-2" style={{ color: themeAccent }}>
          🏠 Imóveis à Venda
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {imoveis.map((item: any) => <ClassifiedCard key={item.id} item={item} />)}
        </div>
      </div>
    );
  };

  const renderCarros = () => {
    if (!carros.length) return <div key="carros" />;
    return (
      <div key="carros" className="max-w-5xl mx-auto px-6 pb-10">
        <h3 className="font-black text-lg mb-4 flex items-center gap-2" style={{ color: themeAccent }}>
          🚗 Carros à Venda
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {carros.map((item: any) => <ClassifiedCard key={item.id} item={item} />)}
        </div>
      </div>
    );
  };

  const moduleRenderers: Record<string, () => JSX.Element> = {
    feed: renderFeed, links: renderLinks, videos: renderVideos,
    presentation: renderPresentation, map: renderMap,
    imoveis: renderImoveis, carros: renderCarros,
  };

  return (
    <div
      className={`min-h-screen ${isDark ? `bg-gradient-to-b ${themeGrad}` : themeLightBg} relative`}
      style={bgImageUrl ? { backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" } : {}}
    >
      {bgImageUrl && <div className="fixed inset-0 bg-black/50 z-0" />}
      <div className="relative z-10">
        <SEOHead
          title={`${site?.site_name || slug} – TrustBank Creator`}
          description={site?.bio || `Explore ${site?.site_name || slug}'s content on TrustBank.`}
          path={`/s/${slug}`}
          image={site?.banner_url || avatarUrl || undefined}
          jsonLd={{ "@context": "https://schema.org", "@type": "ProfilePage", name: site?.site_name || slug, description: site?.bio || "", url: `${window.location.origin}/s/${slug}`, ...(avatarUrl ? { image: avatarUrl } : {}) }}
        />

        {/* Login prompt dialog */}
        <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Sign in to continue</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">Sign in with Google to access videos and premium content.</p>
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-3 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground uppercase">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <Link to="/auth" className="block w-full text-center bg-primary text-primary-foreground rounded-lg px-4 py-2.5 font-bold text-sm hover:bg-primary/90 transition-colors">
                    Sign in with Email
                  </Link>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialogs */}
        <AlertDialog open={!!buyConfirm} onOpenChange={o => !o && setBuyConfirm(null)}>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><Gem className="w-5 h-5 text-primary" /> Purchase Video NFT</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2 text-sm">
                  <p><strong>{buyConfirm?.title}</strong></p>
                  <p>Price: <span className="font-mono font-bold text-primary">${buyConfirm?.nft_price}</span></p>
                  <p>You'll get <strong>{buyConfirm?.nft_max_views} view(s)</strong>.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBuy} className="bg-primary text-primary-foreground">Buy for ${buyConfirm?.nft_price}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!paywallConfirm} onOpenChange={o => !o && setPaywallConfirm(null)}>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-accent" /> Unlock Video</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2 text-sm">
                  <p><strong>{paywallConfirm?.title}</strong></p>
                  <p>Price: <span className="font-mono font-bold text-accent">${(paywallConfirm as any)?.paywall_price || 0.15} USDC</span></p>
                  <p>Pay once for <strong>12 hours</strong> of access.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handlePaywallBuy} className="bg-accent text-accent-foreground">Unlock for ${(paywallConfirm as any)?.paywall_price || 0.15}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={unlockConfirm} onOpenChange={setUnlockConfirm}>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Unlock Contact Info</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2 text-sm">
                  <p>Unlock contact info for <strong>${siteAny.contact_price || 20} USDC</strong>.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => unlockContact.mutate()} className="bg-primary text-primary-foreground">Unlock for ${siteAny.contact_price || 20}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* X.com-style Banner */}
        <div className="relative">
          {/* Cover banner */}
          <div className="h-40 sm:h-52 w-full overflow-hidden" style={{ backgroundColor: themeAccent + "30" }}>
            {siteAny.banner_url ? (
              <img src={siteAny.banner_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-r ${themeGrad}`} />
            )}
          </div>

          {/* Avatar + action buttons row */}
          <div className="max-w-3xl mx-auto px-6 relative">
            <div className="flex items-end justify-between -mt-12 sm:-mt-16">
              {/* Avatar overlapping banner */}
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className={`w-20 h-20 sm:w-28 sm:h-28 ${photoShapeCls} object-cover border-4 shadow-lg`}
                  style={{ borderColor: isDark ? "#0f172a" : "#ffffff", backgroundColor: isDark ? "#0f172a" : "#ffffff" }} />
              ) : (
                <div className={`w-20 h-20 sm:w-28 sm:h-28 ${photoShapeCls} flex items-center justify-center text-2xl sm:text-4xl font-black shadow-lg text-white border-4`}
                  style={{ backgroundColor: themeAccent, borderColor: isDark ? "#0f172a" : "#ffffff" }}>
                  {initial}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 pb-2">
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                  className={`p-2 rounded-full border transition-colors ${cardBg} ${cardHover}`}
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "#d1d5db" }}>
                  <Share2 className="w-4 h-4" style={{ color: colorText }} />
                </button>
                <button onClick={() => setLiked(!liked)}
                  className={`p-2 rounded-full border transition-colors ${cardBg} ${cardHover}`}
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "#d1d5db" }}>
                  <Heart className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : ""}`}
                    style={!liked ? { color: colorText } : {}} />
                </button>
                {user && user.id !== site.user_id && (
                  <button
                    onClick={() => toggleFollow.mutate({ creatorId: site.user_id, isFollowing: !!isFollowing })}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all"
                    style={isFollowing
                      ? { backgroundColor: "transparent", border: `1px solid ${isDark ? "rgba(255,255,255,0.3)" : "#d1d5db"}`, color: colorText }
                      : { backgroundColor: colorText, color: isDark ? "#0f172a" : "#ffffff" }
                    }>
                    {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    {isFollowing ? "Seguindo" : "Seguir"}
                  </button>
                )}
              </div>
            </div>

            {/* Name, bio, stats */}
            <div className="pt-3 pb-6 space-y-2">
              <h1 className={`${fs.title} font-black flex items-center gap-2`} style={{ color: colorText }}>
                {site.site_name || "My Site"}
                {userBadge?.status === "active" && (
                  <VerifiedBadge type={userBadge.badge_type as any} size="lg" />
                )}
              </h1>

              {siteAny.cv_headline && (
                <p className={`${fs.body}`} style={{ color: colorTextSub }}>{siteAny.cv_headline}</p>
              )}

              {site.bio && (
                <p className={`${fs.body} leading-relaxed`} style={{ color: colorTextSub }}>
                  {site.bio}
                </p>
              )}

              <div className="flex items-center gap-4 pt-1">
                {siteAny.cv_location && (
                  <span className={`${fs.small} flex items-center gap-1`} style={{ color: colorTextMuted }}>
                    <MapPin className="w-3 h-3" /> {siteAny.cv_location}
                  </span>
                )}
                <span className={`${fs.small}`} style={{ color: colorTextMuted }}>
                  <strong style={{ color: colorText }}>{followerCount || 0}</strong> seguidores
                </span>
              </div>

              {/* CV section */}
              {site.show_cv && (
                <div className="pt-2">
                  <button onClick={() => setCvOpen(!cvOpen)} className={`flex items-center gap-1.5 ${fs.small} font-bold hover:underline`} style={{ color: themeAccent }}>
                    {cvOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {cvOpen ? "Ocultar CV" : "Ver CV / Currículo"}
                  </button>
                  {cvOpen && (
                    <div className={`mt-3 ${cardBg} ${cardShadow} backdrop-blur-sm border rounded-xl p-6 text-left ${fs.body} animate-in slide-in-from-top-2 space-y-4`}
                      style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb", color: colorTextSub }}>

                      {site.cv_content && (
                        <div>
                          <p className={`${fs.small} font-bold uppercase tracking-wider mb-1.5`} style={{ color: colorTextMuted }}>About</p>
                          <p className="whitespace-pre-wrap">{site.cv_content}</p>
                        </div>
                      )}

                      {siteAny.cv_skills && siteAny.cv_skills.length > 0 && (
                        <div>
                          <p className={`${fs.small} font-bold uppercase tracking-wider mb-2`} style={{ color: colorTextMuted }}>Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {siteAny.cv_skills.map((skill: string, i: number) => (
                              <span key={i} className={`${fs.small} font-bold px-2.5 py-1 rounded-full`}
                                style={{ backgroundColor: themeAccent + "20", color: themeAccent }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {Array.isArray(siteAny.cv_experience) && siteAny.cv_experience.length > 0 && (
                        <div>
                          <p className={`${fs.small} font-bold uppercase tracking-wider mb-2`} style={{ color: colorTextMuted }}>Experience</p>
                          <div className="space-y-3">
                            {siteAny.cv_experience.map((exp: any, i: number) => (
                              <div key={i} className="border-l-2 pl-3" style={{ borderColor: themeAccent + "40" }}>
                                <p className={`${fs.body} font-bold`} style={{ color: colorText }}>{exp.title}</p>
                                <p className={`${fs.small}`} style={{ color: themeAccent }}>{exp.company}</p>
                                <p className={`${fs.small}`} style={{ color: colorTextMuted }}>{exp.period}</p>
                                {exp.description && <p className={`${fs.small} mt-1`} style={{ color: colorTextSub }}>{exp.description}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {Array.isArray(siteAny.cv_education) && siteAny.cv_education.length > 0 && (
                        <div>
                          <p className={`${fs.small} font-bold uppercase tracking-wider mb-2`} style={{ color: colorTextMuted }}>Education</p>
                          <div className="space-y-2">
                            {siteAny.cv_education.map((edu: any, i: number) => (
                              <div key={i} className="flex items-baseline justify-between gap-2">
                                <div>
                                  <p className={`${fs.body} font-bold`} style={{ color: colorText }}>{edu.degree}</p>
                                  <p className={`${fs.small}`} style={{ color: colorTextSub }}>{edu.institution}</p>
                                </div>
                                <span className={`${fs.small} font-mono`} style={{ color: colorTextMuted }}>{edu.year}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(siteAny.contact_email || siteAny.contact_phone) && (
                        <div className="pt-4" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}` }}>
                          <p className={`${fs.small} font-bold mb-2 flex items-center gap-1.5`} style={{ color: colorTextSub }}>
                            <Lock className="w-3 h-3" /> Contact Information
                          </p>
                          {contactUnlocked ? (
                            <div className="space-y-1.5">
                              {siteAny.contact_email && (
                                <a href={`mailto:${siteAny.contact_email}`} className={`flex items-center gap-2 ${fs.small} hover:underline`} style={{ color: themeAccent }}>
                                  <Mail className="w-3.5 h-3.5" /> {siteAny.contact_email}
                                </a>
                              )}
                              {siteAny.contact_phone && (
                                <a href={`tel:${siteAny.contact_phone}`} className={`flex items-center gap-2 ${fs.small} hover:underline`} style={{ color: themeAccent }}>
                                  <Phone className="w-3.5 h-3.5" /> {siteAny.contact_phone}
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f9fafb" }}>
                              <p className={`text-[10px] mb-2`} style={{ color: colorTextSub }}>Contact info is locked.</p>
                              <button onClick={() => user ? setUnlockConfirm(true) : toast.error("Please sign in first")}
                                className="px-4 py-2 rounded-lg text-xs font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: themeAccent }}>
                                <Lock className="w-3 h-3 inline mr-1" /> Unlock for ${siteAny.contact_price || 20}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Separator line */}
          <div className="border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb" }} />
        </div>

        <div className="pt-6" />

        {/* Módulos na ordem customizada */}
        {moduleOrder.map(modId => moduleRenderers[modId]?.())}
        {Object.keys(moduleRenderers).filter(k => !moduleOrder.includes(k)).map(modId => moduleRenderers[modId]?.())}

        {/* Footer */}
        <div className="text-center pb-8">
          <a href="/" className="text-[10px] hover:opacity-70 transition-colors flex items-center gap-1 justify-center" style={{ color: colorTextMuted }}>
            <Globe className="w-3 h-3" /> Desenvolvido por TrustBank
          </a>
        </div>
      </div>
    </div>
  );
};

export default MiniSitePublic;
