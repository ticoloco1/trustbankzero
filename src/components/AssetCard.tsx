import { Link } from "react-router-dom";
import { categories } from "@/data/mockDatabase";
import type { Video } from "@/hooks/useVideos";
import { Play, Lock, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useVideoBoostProgress } from "@/hooks/useBoosts";
import { Progress } from "@/components/ui/progress";
import BoostPanel from "@/components/BoostPanel";

interface AssetCardProps {
  video: Video;
  nftCollection?: any;
}

const AssetCard = ({ video, nftCollection }: AssetCardProps) => {
  const { user } = useAuth();
  const { data: boostProgress } = useVideoBoostProgress(video.id);
  const category = categories.find((c) => c.id === video.category);
  const boostCount = video.boost_count ?? 0;
  const isPaywall = video.paywall_price > 0;

  return (
    <div className={`bg-card rounded-2xl overflow-hidden shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-strong)] transition-shadow ${video.blocked ? "opacity-40 pointer-events-none" : ""}`}>
      <Link to={`/video/${video.id}`} className="block">
        <div className="relative aspect-video bg-muted overflow-hidden rounded-t-2xl">
          <img src={video.thumbnail_url || "/placeholder.svg"} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-foreground/70 flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110">
              <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-0.5" />
            </div>
          </div>
          {isPaywall && (
            <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> ${video.paywall_price.toFixed(2)}
            </div>
          )}
          {boostProgress?.isInHome && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> Featured
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-base font-extrabold text-foreground leading-tight line-clamp-2">{video.title}</h3>
          <div className="flex items-center gap-2">
            {category && <img src={category.avatar} alt={category.name} className="w-5 h-5 rounded-full object-cover" />}
            <span className="text-xs font-bold text-muted-foreground">{category?.name || video.category}</span>
            <span className="text-xs text-muted-foreground font-bold">•</span>
            <span className="text-xs text-muted-foreground font-bold">{video.like_count} views</span>
          </div>
        </div>
      </Link>

      {/* Boost section */}
      <div className="px-4 pb-4 space-y-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          <div className="flex-1">
            <Progress value={boostProgress?.progress ?? 0} className="h-2.5" />
          </div>
          <span className="text-[10px] font-mono font-black text-muted-foreground whitespace-nowrap">
            {boostProgress?.isInHome ? "⭐ FEATURED" : `$${(boostProgress?.remaining ?? 225).toFixed(0)} left`}
          </span>
        </div>
        <BoostPanel videoId={video.id} compact />
      </div>
    </div>
  );
};

export default AssetCard;
