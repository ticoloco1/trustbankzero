import { useParams, Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import PerpetualContract from "@/components/PerpetualContract";
import KYCModal from "@/components/KYCModal";
import RelatedVideos from "@/components/RelatedVideos";
import VideoActions from "@/components/VideoActions";
import { useVideo } from "@/hooks/useVideos";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { usePaywallUnlock } from "@/hooks/useDividends";
import { categories } from "@/data/mockDatabase";
import { useState, useRef } from "react";
import { TrendingUp, Lock, Shield, ArrowLeft, Play, Unlock, Maximize, Minimize } from "lucide-react";
import BoostPanel from "@/components/BoostPanel";
import ReportButton from "@/components/ReportButton";
import VideoOverlayAd from "@/components/VideoOverlayAd";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: video, isLoading } = useVideo(id!);
  const { data: settings } = useSettings();
  const { user, kycVerified } = useAuth();
  const { data: unlock, refetch: refetchUnlock } = usePaywallUnlock(id!);
  const [kycOpen, setKycOpen] = useState(false);
  const [processingPaywall, setProcessingPaywall] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <span className="text-muted-foreground text-sm">Loading asset...</span>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <span className="text-muted-foreground text-sm">Asset not found</span>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === video.category);
  const multiplier = settings?.valuation_multiplier ?? 50;
  const fairValuation = video.revenue * multiplier;
  const boostCount = video.boost_count ?? 0;

  const handlePaywall = async () => {
    if (!user) { toast.error("Sign in to unlock"); return; }
    if (!kycVerified) { setKycOpen(true); return; }
    if (unlock) { toast.info("Already unlocked!"); return; }
    setProcessingPaywall(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-paywall", {
        body: { video_id: video!.id, source: "Paywall Unlock" },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`Unlocked! $${data.net_distributed.toFixed(2)} distributed to ${data.holders_paid} shareholders.`);
        refetchUnlock();
      } else if (data?.unlocked) {
        toast.info("Already unlocked!");
      } else {
        toast.error(data?.error || "Payment failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Payment error");
    } finally {
      setProcessingPaywall(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${video.title} – TrustBank Exchange`}
        description={video.description || `Trade shares of "${video.title}" on TrustBank. Ticker: ${video.ticker}`}
        path={`/video/${id}`}
        image={video.thumbnail_url || undefined}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: video.title,
          description: video.description || "",
          thumbnailUrl: video.thumbnail_url || "",
          url: `${window.location.origin}/video/${id}`,
        }}
      />
      <Header />
      <KYCModal open={kycOpen} onClose={() => setKycOpen(false)} />

      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Board
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Main Content */}
          <div className="space-y-4">
            {/* Video Player */}
            <div
              ref={playerRef}
              className="relative aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer"
              onClick={toggleFullscreen}
            >
              <img src={video.thumbnail_url || ""} alt={video.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <Play className="w-16 h-16 text-white/80 group-hover:scale-110 transition-transform" />
              </div>
              {video.shares_issued && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-[10px] font-bold font-mono">
                  <Lock className="w-3 h-3" />
                  IMMUTABILITY LOCKED — POLYGON
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="absolute bottom-3 right-3 bg-black/60 text-white p-1.5 rounded hover:bg-black/80 transition-colors"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
              <VideoOverlayAd />
            </div>

            {/* Video Info */}
            <div className="space-y-2">
              <h1 className="text-lg font-extrabold text-foreground">{video.title}</h1>
              <div className="flex items-center gap-3">
                {category && (
                  <div className="flex items-center gap-1.5">
                    <img src={category.avatar} alt={category.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase">{category.name}</span>
                  </div>
                )}
                <span className="ticker-badge">{video.ticker}</span>
              </div>
              <p className="text-xs text-muted-foreground">{video.description}</p>
              <div className="flex items-center justify-between pt-1">
                <VideoActions videoId={video.id} creatorId={video.creator_id} boostCount={boostCount} />
                <ReportButton videoId={video.id} />
              </div>
            </div>

            {/* Boost to Home */}
            <BoostPanel videoId={video.id} videoTitle={video.title} />

            {video.shares_issued && (
              <div className="bg-secondary rounded-lg p-3 text-[10px] text-muted-foreground">
                <p className="font-bold text-card-foreground mb-1">⚠️ Metadata Locked</p>
                <p>Title, description, and video URL are permanently locked after share issuance. Changes require governance vote.</p>
              </div>
            )}

            {/* Shadow Valuation — always shown */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-card-foreground uppercase">
                  {video.shares_issued ? "Market Data" : "Shadow Valuation"}
                </h3>
                {!video.shares_issued && (
                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">PRE-IPO</span>
                )}
              </div>

              <div className="flex items-center gap-6">
                {video.shares_issued ? (
                  <div>
                    <span className="text-3xl font-mono font-extrabold text-card-foreground">
                      ${video.share_price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">USDC</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-2xl font-mono font-extrabold text-primary">
                      ~${fairValuation.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">estimated</span>
                  </div>
                )}

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px]">
                  <div>
                    <span className="text-muted-foreground block">Fair Valuation</span>
                    <span className="font-mono font-bold text-primary">${fairValuation.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Revenue</span>
                    <span className="font-mono text-card-foreground">${video.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Total Shares</span>
                    <span className="font-mono text-card-foreground">{video.total_shares.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {!video.shares_issued && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-[10px] text-muted-foreground">
                  <p className="font-bold text-primary mb-1">📊 This is a Shadow Valuation</p>
                  <p>This video has not yet issued shares (IPO). The valuation shown is based on revenue × {multiplier}x multiplier. It is for evaluation purposes only — no shares are available for trading yet.</p>
                </div>
              )}

              {/* Paywall unlock button */}
              {video.paywall_price > 0 && (
                <button onClick={handlePaywall} disabled={!!unlock || processingPaywall}
                  className={`w-full font-bold text-sm py-2.5 rounded-full transition-opacity ${unlock ? "bg-muted text-muted-foreground cursor-default" : "bg-accent text-accent-foreground hover:opacity-90"} disabled:opacity-60`}>
                  {unlock ? <span className="flex items-center justify-center gap-1.5"><Unlock className="w-4 h-4" /> Unlocked</span> : processingPaywall ? "Processing..." : `Unlock — $${video.paywall_price.toFixed(2)}`}
                </button>
              )}

              {!kycVerified && user && (
                <div className="bg-accent/10 rounded p-2 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-accent-foreground" />
                  <span className="text-[10px] text-accent-foreground font-semibold">KYC required to trade</span>
                </div>
              )}
            </div>

            {/* Perpetual Contract — only for issued shares */}
            <PerpetualContract video={video} />

            <p className="text-[7px] text-muted-foreground/60 leading-tight">
              TRUSTBANK IS A TECH PLATFORM. CONTENT IS CREATOR RESPONSIBILITY. HIGH RISK ASSET.
              Shares do not represent equity ownership. Trading involves risk of total loss.
            </p>
          </div>

          {/* Right Sidebar - Related Videos */}
          <aside className="space-y-4">
            <RelatedVideos currentVideo={video} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
